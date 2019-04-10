import { SomeResult } from "../utils/AppProviderTypes";
import { Quote, CurrencyPair } from "./MojaloopConnector";
export declare enum ExternalPaymentMethod {
}
export default class ExternalQuotes {
    getExternalQuotes(paymentMethods: Array<ExternalPaymentMethod>, currencyPair: CurrencyPair, amount: number): Promise<SomeResult<Array<Quote>>>;
}
