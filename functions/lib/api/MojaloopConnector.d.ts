import { SomeResult } from "../utils/AppProviderTypes";
export declare enum DFSP {
    Buffalo = "Buffalo",
    Lion = "Lion",
    Tiger = "Tiger"
}
export declare type PaymentMethod = {
    dfsp: DFSP;
    baseUrl: string;
    tenantId: string;
    username: string;
    password: string;
};
export declare type Quote = {};
export declare enum Currency {
    TSH = "TSH",
    RMB = "RMB"
}
export declare type CurrencyPair = {
    source: Currency;
    destination: Currency;
};
export declare type FinteractQuoteResponse = {
    quoteCode: string;
    transactionCode: string;
    fspFee: {
        amount: number;
        currency: Currency;
    };
    state: string;
};
export default class MojaloopConnector {
    getQuotes(paymentMethods: Array<PaymentMethod>, pair: CurrencyPair, amount: number): Promise<SomeResult<Array<Quote>>>;
    private getAuthHeaders;
    private getQuoteForMethod;
}
