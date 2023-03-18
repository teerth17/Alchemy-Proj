const express = require("express");
const app = express();
const cors = require("cors");
const { recoverPublicKey } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { sha256 } = require("ethereum-cryptography/sha256");
const {
  hexToBytes,
  toHex,
  utfToBytes,
} = require("ethereum-cryptography/utils");

const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0xf847EF00fb884f1d24Ef82c6594557490c998F89": 100,
  "0x1958cd5ba9302e9c067e56d3bca705e67768316e": 50,
  "0xeb77dc8bfec7bc141203efb3f055ee4069c0bb3a": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recoverKey, msgHash, nonce } =
    req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  let senderPublicKey = recoverPublicKey(
    hexToBytes(msgHash),
    hexToBytes(signature),
    recoverKey
  );

  let senderAddress = `0x${toHex(
    keccak256(senderPublicKey.slice(1)).slice(12)
  )}`;
  if (senderAddress != sender) {
    res.status(401).send({ message: "Not Authorized Sender" });
  }

  let msg = { sender, recipient, amount, nonce };
  let newCalHash = toHex(sha256(utfToBytes(JSON.stringify(msg))));

  if (newCalHash != msgHash) {
    res.status(400).send({
      message: "Invalid Hash",
    });
  }
  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
