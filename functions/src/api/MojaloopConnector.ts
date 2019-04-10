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

export type Quote = {

}

export enum Currency {
  TSH = "TSH",
  RMB = "RMB",
}

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


export default class MojaloopConnector {

  
  public async getQuotes(paymentMethods: Array<PaymentMethod>, pair: CurrencyPair, amount: number): Promise<SomeResult<Array<Quote>>> {

    const results = await Promise.all(paymentMethods.map(m => this.getQuoteForMethod(m, amount)));

    if (resultsHasError(results)) {
      return makeError("Error with getQuotes");
    }

    console.log("results are", results);
    const quotes: Array<Quote> = []
    results.forEach(r => {
      if (r.type === ResultType.SUCCESS) {
        quotes.push(r.result)
      }
    });
    
    return makeSuccess(quotes)
  }

  private getAuthHeaders(username: string, password: string): any {
    const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    return {
      Authorization: `Basic ${encoded}`
    }
  }

  private getQuoteForMethod(paymentMethod: PaymentMethod, amount: number): Promise<SomeResult<Quote>> {
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
        amount: { amount: '200', currency: 'TZS' },
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
    .then((response: FinteractQuoteResponse) => makeSuccess(response))
    .catch((err: Error) => {
      console.log("Error is", err.message);
      return makeError(err.message);
    });
  }

}