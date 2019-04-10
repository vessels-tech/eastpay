import { SomeResult, makeError } from "../utils/AppProviderTypes";

export enum PaymentMethod {
  Buffalo = 'Buffalo',
  Lion = 'Lion',
  Tiger = 'Tiger',
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


export default class MojaloopConnector {

  
  public getQuotes(paymentMethods: Array<PaymentMethod>, pair: CurrencyPair, amount: number): Promise<SomeResult<Array<Quote>>> {


    return Promise.resolve(makeError("Something went wrong"));
  }

}