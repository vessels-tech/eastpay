import { SomeResult, makeError } from "../utils/AppProviderTypes";
import { Quote } from "./MojaloopConnector";


export enum ExternalPaymentMethod {
  
  
  
}


export default class ExternalQuotes {


  public getExternalQuotes(paymentMethods: Array<ExternalPaymentMethod>): Promise<SomeResult<Array<Quote>>> {


    return Promise.resolve(makeError("Something went wrong"));
  }

}