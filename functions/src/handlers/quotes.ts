//@ts-ignore
import validate from 'express-validation';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
//@ts-ignore
import morganBody from 'morgan-body';
import ErrorHandler from '../utils/ErrorHandler';
import MojaloopConnector, { CurrencyPair, DFSP, Quote, availableCurrencies } from '../api/MojaloopConnector';
import ExternalQuotes from '../api/ExternalQuotes';
import { ResultType } from '../utils/AppProviderTypes';
const bodyParser = require('body-parser');

const Joi = require('joi');

const paymentMethods = [
  {
    dfsp: DFSP.Buffalo,
    baseUrl: 'http://buffalo.mlabs.dpc.hu/fineract-provider/',
    tenantId: 'tn01',
    username: 'mifos',
    password: 'password'
  },
  // {
  //   dfsp: DFSP.Lion,
  //   baseUrl: 'http://lion.mlabs.dpc.hu/fineract-provider/',
  //   tenantId: 'tn02',
  //   username: 'mifos',
  //   password: 'password'
  // }
  //TODO: add more methods
];


const enrichData = (data: Array<Quote>, currencyPair: CurrencyPair): Array<Quote> => {

  //TODO: also edit some of the existing data to make things nicer

  data.push(
    {
      dfspName: "M-Pesa Mastercard",
      "fx": 0.0024,
      "fees": [
        {
          "currency": currencyPair.source,
          "amount": 2000,
        }
      ],
      "sourceTotal": 85245,
      "sourceCurrency": currencyPair.source,
      "handoffUrl": "https://url.com",
    }
  );

  return data;
}

module.exports = (functions: any) => {
  const app = express();
  app.use(bodyParser.json());

  if (process.env.VERBOSE_LOG === 'false') {
    console.log('Using simple log');
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  } else {
    console.log('Using verbose log');
    morganBody(app);
  }

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /**
   * GetQuotes
   * 
   */
  const getQuotesValidation = {
    options: {
      allowUnknownBody: false,
    },
    query: {
      sourceCurrency: Joi.string().required().valid(availableCurrencies),
      destCurrency: Joi.string().required().valid(availableCurrencies),
      destAmount: Joi.number().required(),
      shouldEnrich: Joi.boolean().default(false),
    }
  }    

  app.get('/quotes', validate(getQuotesValidation), async (req, res) => {
    const {
      sourceCurrency,
      destCurrency,
      destAmount,
      shouldEnrich,
    } = req.query;

    const currencyPair: CurrencyPair = {
      source: sourceCurrency,
      destination: destCurrency,
    };
    const amount = destAmount;
    
    const mlApi = new MojaloopConnector();
    const externalQuoteApi = new ExternalQuotes();

    const [mlQuoteResult, externalQuoteResult] = await Promise.all([
      mlApi.getQuotes(paymentMethods, currencyPair, amount),
      externalQuoteApi.getExternalQuotes([], currencyPair, amount),
    ]);

    if (mlQuoteResult.type === ResultType.ERROR) {
      return mlQuoteResult;
    }

    if (externalQuoteResult.type === ResultType.ERROR) {
      return externalQuoteResult;
    }

    //Format the results
    const data: Array<Quote> = [];
    mlQuoteResult.result.forEach(q => data.push(q));
    externalQuoteResult.result.forEach(q => data.push(q));
    
    if (shouldEnrich) {
      enrichData(data, currencyPair);
    }
    
    //Sort by total cost ascending
    data.sort((a, b) => a.sourceTotal - b.sourceTotal);
    return res.json(data);
  });

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
}