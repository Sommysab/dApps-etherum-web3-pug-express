# Decentralized Application (dAPP) with Etherem & Metamask, Web3js and Pug

> Simple dApp  built for ERC20 token transactions

## Pre Config
```bash
# Change the following parts with yours
const abiArray = [];    
this.contract_address = "your_smart_contract address"; 
this.url = '/url/to/etherum/node/gateway/api';  # e.g. API from infura | etherscan | Geth / Parity
this.privateKey = process.env.PRIVATE_KEY;   # environmental variable
this.web3.eth.defaultAccount = "your_ethereum_public_key"; 
```

## Quick Start

```bash
# Start Nodejs server
npm run start

```
## On Docker
```bash
# Run in Docker
docker-compose up  
# use -d flag to run in background

# Tear down
docker-compose down

# To be able to edit files, add volume to compose file
volumes: ['./:/usr/src/app']

# To re-build
docker-compose build
```

# For Metamask integration, access the backend modules in the client-side with browsify

# dApps-etherum-web3-pug-express
