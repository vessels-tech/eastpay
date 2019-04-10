import { SomeResult, makeSuccess } from "../utils/AppProviderTypes";
import MojaloopConnector, { Quote, CurrencyPair } from "./MojaloopConnector";


export enum ExternalPaymentMethod {
  
  
  
}

const calculate = (pair: CurrencyPair, amount: number): {fx: number, fee: number, sourceTotal: number} => {
  const fx = MojaloopConnector.fxForPair(pair);
  const fee = 100;
  const sourceTotal = (amount / fx) + fee;

  return {
    fx,
    fee,
    sourceTotal
  }
}


export default class ExternalQuotes {


  public async getExternalQuotes(paymentMethods: Array<ExternalPaymentMethod>, currencyPair: CurrencyPair, amount: number): Promise<SomeResult<Array<Quote>>> {
   
    const quote1 = calculate(currencyPair, amount);
    const quote2 = calculate(currencyPair, amount);
    const quote3 = calculate(currencyPair, amount);

    const quotes: Array<Quote> = [
      {
        dfspName: "Demo DFSP 1",
        fx: quote1.fx,
        fees: [{
          currency: currencyPair.source,
          amount: quote1.fee,
        }],
        sourceTotal: quote1.sourceTotal,
        sourceCurrency: currencyPair.source,
        handoffUrl: "https://vesselstech.com",
      },
      {
        dfspName: "Demo DFSP 2",
        fx: quote2.fx,
        fees: [{
          currency: currencyPair.source,
          amount: quote2.fee,
        }],
        sourceTotal: quote2.sourceTotal,
        sourceCurrency: currencyPair.source,
        handoffUrl: "https://vesselstech.com",
      },
      {
        dfspName: "Demo DFSP 3",
        fx: quote3.fx,
        fees: [{
          currency: currencyPair.source,
          amount: quote3.fee,
        }],
        sourceTotal: quote3.sourceTotal,
        sourceCurrency: currencyPair.source,
        handoffUrl: "https://vesselstech.com",
      },
    ]

    return makeSuccess(quotes);
  }

}