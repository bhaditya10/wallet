
var express = require('express');
var app = express();
const path = require('path');
const router = express.Router();
const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const { createHash } = require('crypto')
const cbor = require('cbor')
const { protobuf } = require('sawtooth-sdk')
const request = require('request')

const context = createContext('secp256k1')
const privateKey = context.newRandomPrivateKey()
const signer = new CryptoFactory(context).newSigner(privateKey)

var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



app.set('view engine', 'ejs');
app.listen(3000);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/views/index.html'));
});


function  sendRequest(payload) {
 const payloadBytes = cbor.encode(payload)
 const transactionHeaderBytes = protobuf.TransactionHeader.encode({
   familyName: 'simplestore',
   familyVersion: '1.0',
   inputs: ['917479'],
   outputs: ['917479'],
   signerPublicKey: signer.getPublicKey().asHex(),
   batcherPublicKey: signer.getPublicKey().asHex(),
   dependencies: [],
   payloadSha512: createHash('sha512').update(payloadBytes).digest('hex'),
   nonce: (new  Date()).toString()
 }).finish()

 const signature = signer.sign(transactionHeaderBytes)

 const transaction = protobuf.Transaction.create({
   header: transactionHeaderBytes,
   headerSignature: signature,
   payload: payloadBytes
 })

 const transactions = [transaction]

 const batchHeaderBytes = protobuf.BatchHeader.encode({
   signerPublicKey: signer.getPublicKey().asHex(),
   transactionIds: transactions.map((txn) => txn.headerSignature),
 }).finish()

 headerSignature = signer.sign(batchHeaderBytes)

 const batch = protobuf.Batch.create({
   header: batchHeaderBytes,
   headerSignature: headerSignature,
   transactions: transactions
 })

 const batchListBytes = protobuf.BatchList.encode({
   batches: [batch]
 }).finish()

 request.post({
   url: 'http://localhost:8008/batches',
   body: batchListBytes,
   headers: { 'Content-Type': 'application/octet-stream' }
 }, (err, response) => {
   if (err) return  console.log(err)
   console.log(response.body)
 })
}

app.post('/send_amount', function(req, res, next) {
  console.log(req.body)
  sendRequest(req.body)
})

app.post('/send_amount', function(req, res, next) {
  console.log(req.body)
  sendRequest(req.body)
})