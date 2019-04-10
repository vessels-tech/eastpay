import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
//@ts-ignore
import morganBody from 'morgan-body';
import ErrorHandler from '../utils/ErrorHandler';
import MojaloopConnector, { CurrencyPair, Currency } from '../api/MojaloopConnector';
import ExternalQuotes from '../api/ExternalQuotes';
import { ResultType } from '../utils/AppProviderTypes';
// import { relayDefaultCountrycode } from '../utils/Env';
// import FirebaseAuth from '../middlewares/FirebaseAuth';
// import { formatMobile, sleep } from '../utils';
// import { ResultType } from '../types_rn/AppProviderTypes';
const bodyParser = require('body-parser');


module.exports = (functions: any) => {
  const app = express();
  app.use(bodyParser.json());


  if (process.env.VERBOSE_LOG === 'false') {
    console.log('Using simple log');
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  } else {
    console.log('Using verbose log');
    morganBody(app);
    // app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  }

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /**
   * GetQuotes
   * 
   */
  app.get('/quotes', async (req, res) => {
    console.log("req.body is", JSON.stringify(req.body, null, 2));

    //TODO: get the user's phone number, check that its in a whitelist.
    const mlApi = new MojaloopConnector();
    const quoteApi = new ExternalQuotes();

    //TODO: get the values out of the req params
    const currencyPair: CurrencyPair = {
      source: Currency.RMB,
      destination: Currency.TSH,
    };
    const amount = 1000;

    const [mlQuoteResult, externalQuoteResult] = await Promise.all([
      mlApi.getQuotes([], currencyPair, amount),
      quoteApi.getExternalQuotes([]),
    ]);

    if (mlQuoteResult.type === ResultType.ERROR) {
      return mlQuoteResult;
    }

    if (externalQuoteResult.type === ResultType.ERROR) {
      return externalQuoteResult;
    }


    const data = [
      {
        "paymentMethod": "M-Pesa Mastercard",
        "fx": 0.0024,
        "fees": [
          {
            "currency": "TSH",
            "amount": 2000,
          }
        ],
        "sourceTotal": 85245,
        "sourceCurrency": "TSH",
        "handoffUrl": "https://url.com",
      }
    ];

    return res.json(data);
  });

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
}