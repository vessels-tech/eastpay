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
export declare type Fee = {
    currency: Currency;
    amount: number;
};
export declare type Quote = {
    dfspName: string;
    fx: number;
    fees: Array<Fee>;
    sourceTotal: number;
    sourceCurrency: Currency;
    handoffUrl: string;
};
export declare enum Currency {
    TZS = "TZS",
    USD = "USD",
    RMB = "RMB",
    KSH = "KSH",
    RWF = "RWF"
}
export declare const availableCurrencies: string[];
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
export declare type PaymentMethodConstants = {
    dfspName: string;
    handoffUrl: string;
};
export default class MojaloopConnector {
    getQuotes(paymentMethods: Array<PaymentMethod>, pair: CurrencyPair, amount: number): Promise<SomeResult<Array<Quote>>>;
    private getAuthHeaders;
    private getQuoteForMethod;
    private static formatQuote;
    /**
     * fxForPair
     *
     * Generate a semi random exchange rate for a currency pair
     * @param pair
     */
    static fxForPair(pair: CurrencyPair): number;
    private static enrichPaymentMethod;
}
