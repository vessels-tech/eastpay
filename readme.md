# EastPay
## VesselsTech + Teller Collaboration for the 2019 Mojaloop Bootcamp

## Development

```bash
touch /tmp/ep_env
```

## Urls:

Home: https://eastpay-ml.firebaseapp.com



## Api
----


### GetQuote

Gets a quote for a given source country, destination country and currency.

Returns a list of (1) payment methods and (2) loan options to display to user, including
a handoff url

Example:

GET /quote?sourceCurrency=TZS&destCurrency=RMB&destAmount=260

_response_
```json
[
  {
    "paymentMethod": "M-Pesa Mastercard",
    "fx": 0.0024,
    "fees": [
      {
        "currency": "TSH",
        "amount": 2000,
      }
    ],
    "sourceTotal": 85245,
    "sourceCurrency": "TSH",
    "handoffUrl": "https://url.com",
  }
  ...
]
```


## Interface


### Mojaloop Quote Lookup

Initiate 3 x quotes, one for each dfsp, assemble in list.

__if we have time, integrate the account lookup service given a phone number__


### External Quote Lookup

Fill in with dummy data

__if we have time, scrape/integrate transferwise api__