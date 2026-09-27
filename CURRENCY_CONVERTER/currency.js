const input = require("sync-input");

class Converter {
  constructor() {
    this.rates = {
      USD: 1.0,
      JPY: 113.5,
      EUR: 0.89,
      RUB: 74.36,
      GBP: 0.75,
      KSH: 130.0,
      RWF: 1443.0
    };
  }

  convert = (from, to, amount) => {
    return (amount / this.rates[from]) * this.rates[to];
  }
}

const converter = new Converter();

console.log("Welcome to Currency Converter");
console.log("We can convert: " + Object.keys(converter.rates).join(", "));
console.log("");

let fromCurrency = input("What do you want to convert from: ").toUpperCase();
let toCurrency = input("What do you want to convert to: ").toUpperCase();
let amount = Number(input("Amount: "));

let result = converter.convert(fromCurrency, toCurrency, amount);
console.log(`Result: ${amount} ${fromCurrency} equals ${result.toFixed(4)} ${toCurrency}`);
