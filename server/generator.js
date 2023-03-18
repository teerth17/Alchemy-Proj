const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
let pvtKey = secp.utils.randomPrivateKey();
console.log("pvtKey", pvtKey);
let publicKey = secp.getPublicKey(pvtKey);
console.log("publicKey", publicKey);
let address = toHex(keccak256(publicKey.slice(1)).slice(12));

console.log(
  "Private key",
  toHex(pvtKey),
  "publicKey",
  toHex(publicKey),
  "address",
  address
);
