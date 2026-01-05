const SHA256 = require("crypto-js/sha256");

const message = "This is a secret message.";
const hash = SHA256(message).toString();

console.log(`Original Message: ${message}`);
console.log(`SHA256 Hash: ${hash}`);
