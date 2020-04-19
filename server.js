"use strict";
let express=require('express');
let app=express();
const Blockchain = require("./blockchain"); 
const { uuid } = require('uuidv4'); 

let nodeId = uuid();
app.get('/', (req,res) => {
    res.send(JSON.stringify(Blockchain.chain));
});
app.get('/chain',function (req,res){
    res.send(JSON.stringify(Blockchain.chain));
});

app.get('/mine', (req,res) => {
    let last_proof;
    let  last_block = Blockchain.last_block();
    if (last_block == 0){ last_proof = 0; }
    else{ last_proof = last_block.proof; }
    
    let proof = Blockchain.proof_of_work(last_proof);

    let index = Blockchain.new_transaction(0, nodeId,1);

    let previous_hash = Blockchain.hash(last_block);
    let block = Blockchain.new_block (proof, previous_hash);

    res.send(JSON.stringify(block));
});

app.post('/transactions/new',function (req,res){
    const { sender, amount, recipient } = req.query;
    if (sender === "" || ammount ==="" || recipient === ""){
        res.send("value missing");
        return;
    } 
    let index = Blockchain.new_transaction(sender, recipient, ammount)
    res.send("transaction will be added to block " + index);
});

app.post('/nodes/register',function (req,res){
    let nodes = req.query.nodes;
    if (nodes === ""){
        res.send("please provide a list of nodes.");
    }
    nodes.forEach(element => {
        Blockchain.register_node(element);
    });
    res.send("nodes added to the block");
});

app.get('/nodes/resolve',function (req,res){
    let replaced = Blockchain.resolve_conflicts();
    res.send(JSON.stringify(Blockchain));
});

let myArgs = process.argv.slice(2)[0];
console.log('launching bitnode in port: ', myArgs);