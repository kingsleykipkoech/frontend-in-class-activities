const rates = {
  USD: 1.0,
  JPY: 113.5,
  EUR: 0.89,
  RUB: 74.36,
  GBP: 0.75,
  KSH: 130.0,
  RWF: 1443.0
};

$('#convert-btn').click(function () {
  const from = $('#from-currency').val();
  const to = $('#to-currency').val();
  const rawInput = $('#amount').val();
  const amount = Number(rawInput);

  // Check 1: Empty or not a number
  if (rawInput === '' || isNaN(amount)) {
    $('#error-msg').text('Please enter a valid amount').show();
    $('#result-box').hide();
  } 
  // Check 2: Negative or zero
  else if (amount <= 0) {
    $('#error-msg').text('Amount cannot be negative or zero').show();
    $('#result-box').hide();
  } 
  // If valid it  will  calculate and show result
  else {
    $('#error-msg').hide();
    const result = (amount / rates[from]) * rates[to];
    $('#result-value').text(`${amount} ${from} = ${result.toFixed(2)} ${to}`);
    $('#result-box').show();
  }
});
