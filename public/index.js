
var loadingIndicator
var compareTable
var bestPrice
var bestMethod
var goButton


var results = [];

function throttle(method, scope) {
  clearTimeout(method._tId);
  method._tId = setTimeout(function () {
    method.call(scope);
  }, 250);
}

window.onload = function () {  
  
  loadingIndicator = document.getElementById('loading');
  compareTable = document.getElementById('compareTable');
  bestPrice = document.getElementById('bestPrice');
  bestMethod = document.getElementById('bestMethod');
  goButton = document.getElementById('goButton');

  $('#results').hide();
  $('#tableSection').hide();

  loadingIndicator.hidden = true;
  compareTable.hidden = true;
}


function submitFormThrottled() {
  throttle(submitForm, window);
}

function handoffCheapest() {
  var url = results[0].handoffUrl;
  var name = results[0].dfspName;

  handoff(url, name);
}

function handoff(url, bankName) {
  //TODO: display modal, and redirect after time
  console.log("handing off to", url, bankName);

  $("#handoff_modal").addClass('is-active');
  document.getElementById('selected_bank_name').innerText = bankName;
  

  setTimeout(function() {
    window.location = url;
  }, 1000);

  setTimeout(function() {
    $("#handoff_modal").removeClass('is-active');
  }, 2000);
}

window.submitForm = function() {
  const country = document.getElementById('field_country').value;
  const amount = document.getElementById('field_amount').value;
  const currency = document.getElementById('field_currency').value;

  if (amount === "") {
    return;
  }

  $("#goButton").addClass("is-loading");
  $('#results').hide();
  $('#tableSection').hide();

  
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://us-central1-eastpay-ml.cloudfunctions.net/default-quotes/quotes?sourceCurrency=TZS&destCurrency=${currency}&destAmount=${amount}&shouldEnrich=false`,
    "method": "GET",
  }

  $.ajax(settings).done(function (response) {
    results = response;
    loadingIndicator.hidden = true;
    $("#goButton").removeClass("is-loading");
    updateResults();
  });
}

function updateResults() {
  if (results.length === 0) {
    return;
  }

  compareTable.hidden = false;

  console.log("Updating results");

  updateTable();
  $('#results').show();
  $('#tableSection').show();

  const lowestSourceTotal = results[0].sourceTotal;
  const lowestSourceTotalFormatted = lowestSourceTotal.toLocaleString(
    undefined,
    { 
      maximumFractionDigits: 2 }
  );
  const sourceCurrency = results[0].sourceCurrency;
  bestMethod.innerText = results[0].dfspName;
  bestPrice.innerText = `${lowestSourceTotalFormatted} ${sourceCurrency}`;

  $('html, body').animate({
    scrollTop: $("#results").offset().top
  }, 200);
}

function updateTable() {

  $('tbody').empty();


  //TODO: add the loan option
  for (i in results) {
    var result = results[i];

    if (i === "1") {
      addLoans();
    }

    var name = result.dfspName;
    var fx = result.fx.toFixed(3);
    var fee = result.fees[0].amount;
    var total = result.sourceTotal.toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2
      }
    );
    var handoffUrl = result.handoffUrl;
    var button = `<a class="button is-link" onclick="handoff('${handoffUrl}', '${name}')">Pay</a>`;
  
    $('tbody').append(`<tr><td>${name}</td><td>${fx}</td><td>${fee}TZS</td><td>${total}</td><td>${button}</td></tr>`);
  }
}

function addLoans() {

  const loanUrl = "https://paylater.ng";
  var button = `<a class="button is-success" href="${loanUrl}">Apply</a>`;

  $('tbody').append(`<tr><td>Carbon</td><td colspan="3"><strong>Apply for 30 day loan at 14.50% APR*<strong></td><td>${button}</td></tr>`);
}

