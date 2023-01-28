var express = require("express");
var cors = require("cors");
var app = express();
var http = require("http");
var bodyParser = require("body-parser");
const Web3 = require("web3");

const web3 = new Web3("https://api.hyperspace.node.glif.io/rpc/v1"); // hyperspace network

const router = require("./routes");

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

const CONTRACT_ADDRESS = "0xaadf05c737D6efDEbBD50C79E02d670E559dEE34"; // add your contract address here.
const CONTRACT_ABI = require("./abi.json"); // add your abi to the abi json file.
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

let blockNumber = 0;

async function getLastestBlock() {
  return await web3.eth.getBlockNumber();
}

async function getEvents() {
  let latest_block = await getLastestBlock();
  blockNumber = blockNumber === 0 ? latest_block - 1 : blockNumber;
  console.log(
    "before - latest: ",
    latest_block,
    "previous block: ",
    blockNumber
  );
  if (latest_block !== blockNumber) {
    const events = await contract.getPastEvents(
      "Name", // change if your looking for a different event
      { fromBlock: blockNumber + 1, toBlock: "latest" }
    );
    blockNumber = latest_block;
    if (events.length !== 0) {
      console.log(events, "events");
      console.log(events[0].raw.topics, "topic");
    }
    console.log(
      "after - before - latest: ",
      latest_block,
      "previous block: ",
      blockNumber
    );
    indexData();
  }
  getEvents();
}

async function indexData() {
  // query data logic.
  getEvents();
}

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cors());

app.use(router);

server.listen(
  PORT,
  () => console.log(`server has started on port ${PORT}`),
  getEvents(CONTRACT_ABI, CONTRACT_ADDRESS)
);
