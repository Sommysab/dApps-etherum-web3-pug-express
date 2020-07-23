const express = require('express'); 
const router = express.Router(); 
const Web3 = require('web3');

"use strict";


class dAPP{ 

  constructor(){    
    
    const abiArray = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"balances","type":"uint256"}],"name":"GetBalance","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];
    
    this.contract_address = "0x35A4FBEBA70125d637ff95718DF0321e548485A7"; 
    this.url = '/url/to/etherum/node/gateway/api';  // e.g. API from infura | etherscan | Geth / Parity
    this.web3 = new Web3(this.url);      
    this.privateKey = process.env.PRIVATE_KEY;   
    this.privateKey = Buffer.from(this.privateKey,'hex'); // bigInt to hexadecimal
    
    this.web3.eth.defaultChain = "rinkeby"; // Testnet 
    this.web3.eth.Contract.defaultBlock = "latest"; 
    this.web3.eth.defaultAccount = "your_ethereum_public_key"; 
    
    this.myContract = new web3.eth.Contract(abiArray, this.contract_address);

    // Get Transfer Events
    this.myContract.events.Transfer(function(err, result) {
      console.log({TransferEvent: result}); // whatever..
    });
    
    // Get Approval Events
    this.myContract.events.Approval(function(err, result) {
      console.log({ApproveEvent: result});
    });

  }

  getTokenBal(address){ 
    this.myContract.methods.balanceOf(address).call( (error, balance) => {       
      const msg = !error ? balance : error;
      return Promise(msg);
    }); 
  }

  getEthBal(address){  
    this.web3.eth.getBalance(address)
    .then( balance => { 
      return Promise.resolve(balance)
    })
    .catch(err => {
      return Promise.resolve(err)
    });
  }

}

const dapp = dApp(); 


// Token transfer
router.post('/transfer', async(req, res, next) => { 
  const {to, amt, from } = req.body;
  
  if(await dapp.getTokenBal(from) <= amt ) return res.json({error: 'insufficient balance'})
  if(dapp.web3.eth.defaultAccount !== from) return res.json({error: 'Sender must be a verified account'})
  // [for ico organizers]
  const contractFunction = dapp.myContract.methods.transfer(to, amt);

  // [for ico participants (Use with MetaMask)] 
  // const contractFunction = dapp.myContract.methods.transferFrom(from, to, amt); 

  const gas = await dapp.contractFunction.estimateGas({from});  
  const _nonce = await dapp.web3.eth.getTransactionCount(from, 'pending');

  const txParams = {
    value:    dapp.web3.utils.toHex(dapp.web3.utils.toWei('0', 'ether')), 
    gasPrice: dapp.web3.utils.toHex(dapp.web3.utils.toWei('6', 'Gwei')),
    gasLimit: dapp.web3.utils.toHex(gas), 
    to:       dapp.contract_address,
    data:     contractFunction.encodeABI(),
    from,
    nonce:    dapp.web3.utils.toHex(_nonce),
    chainId:  4 // rinkeby
  };
  
  dapp.web3.eth.accounts.signTransaction(txParams, dapp.privateKey)
  .then(signedTx => 
    dapp.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('transactionHash', hash => res.json({hash}) )
    .on('receipt', receipt => console.log({receipt}))
    .on('error', (error, receipt) => console.log({error, receipt}) )
  )
  
})

// Get Token Balance
router.post('/getbalance', async (req, res) => { 
  const {address} = req.body;
  if(!address || address=='') return res.json({error: 'invalid address'});
  
  res.json({
    balance: await dapp.getTokenBal(address) 
  });
});

// Get Ethereum Balance (for Rinkeby Testnet)
router.post('/getbalance_eth', async (req, res) => { 
  const {address} = req.body;
  if(!address || address=='') return res.json({error: 'invalid address'});
  
  res.json({
    balance: await dapp.getEthBal(address) 
  });
});



module.exports = router;



