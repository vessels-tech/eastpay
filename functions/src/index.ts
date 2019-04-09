import * as functions from 'firebase-functions';


export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});


//TODO: make an express handler
export const getQuote = functions.https.onRequest((request, response) => {
  
  const data = [
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
  ];

  response.send(data);
});
