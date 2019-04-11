import request from 'request-promise-native';
import { SomeResult, makeError, makeSuccess, resultsHasError, ResultType } from "../utils/AppProviderTypes";
const uuid = require('uuid/v4');

export enum DFSP {
  Buffalo = 'Buffalo',
  Lion = 'Lion',
  Tiger = 'Tiger',
}

export type PaymentMethod = {
  dfsp: DFSP,
  baseUrl: string,
  tenantId: string,
  username: string,
  password: string,
}

export type Fee = {
  currency: Currency,
  amount: number
}

export type Quote = {
  dfspName: string,
  fx: number,
  fees: Array<Fee>,
  sourceTotal: number,
  sourceCurrency: Currency
  handoffUrl: string,
}

export enum Currency {
  TZS = "TZS",
  USD = "USD",
  RMB = "RMB",
  KSH = "KSH",
  RWF = "RWF",
}

export const availableCurrencies = Object.keys(Currency);

export type CurrencyPair = {
  source: Currency,
  destination: Currency,
}

export type FinteractQuoteResponse = {
  quoteCode: string,
  transactionCode: string,
  fspFee: { amount: number, currency: Currency },
  state: string,
}

export type PaymentMethodConstants = {
  dfspName: string, //Pretty name for a DFSP
  handoffUrl: string, //handoff url
}


export default class MojaloopConnector {

  
  public async getQuotes(paymentMethods: Array<PaymentMethod>, pair: CurrencyPair, amount: number): Promise<SomeResult<Array<Quote>>> {

    const results = await Promise.all(paymentMethods.map(m => this.getQuoteForMethod(m, pair, amount)));

    if (resultsHasError(results)) {
      return makeError("Error with getQuotes");
    }

    const quotes: Array<Quote> = []
    results.forEach(r => {
      if (r.type === ResultType.SUCCESS) {
        quotes.push(r.result)
      }
    });

    console.log("quotes are", quotes);
    
    return makeSuccess(quotes)
  }

  private getAuthHeaders(username: string, password: string): any {
    const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    return {
      Authorization: `Basic ${encoded}`
    }
  }

  private getQuoteForMethod(paymentMethod: PaymentMethod, pair: CurrencyPair, amount: number): Promise<SomeResult<Quote>> {
    const { baseUrl, tenantId, username, password} = paymentMethod;

    const method = `interoperation/quotes`;
    const url = `${baseUrl}/${method}`;
    const transactionCode = uuid();
    const requestCode = uuid();
    const quoteCode = uuid();

    const options = {
      method: 'POST',
      url,
      headers: {
        ...this.getAuthHeaders(username, password),
        'Content-Type': 'application/json',
        'Fineract-Platform-TenantId': tenantId,
      },
      body: {
        transactionCode,
        requestCode,
        quoteCode,
        accountId: '31d77b06141c11e9ab14d6',
        amount: { 
          amount, 
          currency: Currency.TZS,
          // currency: pair.destination //can only use TZs
        },
        amountType: 'RECEIVE',
        transactionRole: 'PAYER',
        transactionType: {
          scenario: 'PAYMENT',
          subScenario: null,
          initiator: 'PAYEE',
          initiatorType: 'CONSUMER'
        },
        note: 'Quote Lookup',
      },
      json: true
    };


    return request(options)
    .then((response: FinteractQuoteResponse) => MojaloopConnector.formatQuote(response, paymentMethod, amount, pair))
    .then((formatted: Quote) => makeSuccess<Quote>(formatted))
    .catch((err: Error) => {
      console.log("Error is", err.message);
      return makeError<Quote>(err.message);
    });
  }

  private static formatQuote(response: FinteractQuoteResponse, paymentMethod: PaymentMethod, amount: number, pair: CurrencyPair): Quote {
    const {
      dfspName,
      handoffUrl,
    } = MojaloopConnector.enrichPaymentMethod(paymentMethod);

    //TODO: figure out what amount means... source or destination?
    //We need it to be source.

    //amount is the destination amount.
    //source total = (amount/fx) + fee
    //TODO: get a reasonable, randomized fx for a given currency pair
    const fx = MojaloopConnector.fxForPair(pair);
    const fee = response.fspFee.amount;
    const sourceTotal = (amount/fx) + fee;

    return {
      dfspName,
      fx,
      fees: [
        {
          currency: response.fspFee.currency,
          amount: response.fspFee.amount
        }
      ],
      sourceTotal,
      sourceCurrency: Currency.TZS,
      handoffUrl,
    }
  }

  /**
   * fxForPair
   * 
   * Generate a semi random exchange rate for a currency pair
   * @param pair 
   */
  public static fxForPair(pair: CurrencyPair): number {
    const fx = {
      TZS: {
        TZS: 1,
        USD: 0.00043,
        RMB: 0.0029,
        KSH: 0.044,
        RWF: 0.39,
      },
      USD: {
        TZS: 2314.90,
        USD: 1,
        RMB: 6.72,
        KSH: 101.10,
        RWF: 904.08,
      },
      RMB: {
        TZS: 344.65,
        USD: 0.15,
        RMB: 1,
        KSH: 15.05,
        RWF: 134.62,
      },
      KSH: {
        TZS: 22.9,
        USD: 0.0099,
        RMB: 0.066,
        KSH: 1,
        RWF: 8.95,
      },
      RWF: {
        TZS: 2.56,
        USD: 0.0011,
        RMB: 0.0074,
        KSH: 0.11,
        RWF: 1,
      },
    };

    let baseRate = fx[pair.source][pair.destination];
    const random = (Math.random() - 1) / 100;
    baseRate = baseRate  + (baseRate * random);

    return baseRate
  }

  private static enrichPaymentMethod(paymentMethod: PaymentMethod): PaymentMethodConstants {
    
    switch (paymentMethod.dfsp) {
      case DFSP.Buffalo: {
        return {
          dfspName: 'Buffalo Bank',
          handoffUrl: "https://vesselstech.com",
        }
      }
      default: {
        return {
          dfspName: 'Other Bank',
          handoffUrl: "https://textteller.com",
        }
      }
    }
  }
}