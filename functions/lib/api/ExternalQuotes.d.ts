import { SomeResult } from "../utils/AppProviderTypes";
import { Quote } from "./MojaloopConnector";
export declare enum ExternalPaymentMethod {
}
export default class ExternalQuotes {
    getExternalQuotes(paymentMethods: Array<ExternalPaymentMethod>): Promise<SomeResult<Array<Quote>>>;
}
