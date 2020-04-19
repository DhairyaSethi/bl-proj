let  createHash = require('crypto');
const url = require('url');

class Block{
    constructor(index, timestamp, trans, proof, prevHash){
        this._index = index;
        this._timestamp = timestamp;
        this._transactions = trans;
        this._proof = proof;
        this._previous_hash = prevHash; 
    }

    get timestamp(){
        return this._timestamp;
    }
    get transactions(){
        return this._transactions;
    }
    get proof(){
        return this._proof;
    }
    get previous_hash(){
        return this._previous_hash;
    }
    get index(){
        return this._index;
    }
    
}

class Blockchain{
    constructor(){
        this._chain =  [];
        this._nodes = new Set();
        this._current_transactions = [];
        this.new_block(100,1);
        console.log(JSON.stringify(this.chain));
    }
    get chain(){
        return this._chain;
    }
    get nodes(){
        return this._nodes;
    }
    set current_transactions(transactions){
        this._current_transactions = transactions;
    }
    get current_transactions(){
        return this._current_transactions
    }

    register_node(address){
        let parsed_url = new URL(address);
        this._nodes.add(parsed_url);
    }

    valid_chain(chain_to_check){   
        let current_index = 1;
        let last_block = chain_to_check[0];
        while (current_index < chain_to_check.length){
            let block = chain_to_check[current_index];
            if (block.previous_hash != this.hash(block)){ return false; }
            if (! this.valid_proof(last_block.proof, block.proof)){ return false; }
            last_block = block;
            current_index +=1;
        }
        return true;
    }

    resolve_conflicts(){
        let neighbours = this.nodes;
        max_length = this.chain.length;
        neighbours.forEach( node => {
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() { 
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
                    let new_chain = JSON.parse(xmlHttp.responseText);
                    if (this.valid_chain(new_chain)  && new_chain.length > max_length){
                        this._chain = new_chain;
                        max_length = new_chain.length;
                    }
                }
            };
            xmlHttp.open("GET", node.origin + "/chain", true);
            xmlHttp.send(null);
        });

    }

    new_block(proof,previous_hash = null){
        let previous_index;
        const time = new Date();
        if (this.chain.length == 0){
            previous_index = 0;
        }
        else{
            previous_index = this.chain.length -1 ;
        }
        let block = new Block(this.chain.length+1, time, this.current_transactions, previous_hash || this.hash(this.chain[previous_index]));
//        console.log(block); 

        this.setCurrent_transactions = [];
        this.chain.push(block);
        return block;
    }

    last_block(){
        if (!this.chain.length){ return 0; }
        return this.chain[this.chain.length -1];
    }

    proof_of_work(last_proof){
        let proof = 0;
        while(!this.valid_proof(last_proof, proof)){
            proof+=1;
        }
        console.log("Proof number found " + proof);
        return proof;
    }

    valid_proof(last_proof,proof){
        let guess = Buffer.from(proof.toString()).toString('base64') + Buffer.from(last_proof.toString()).toString('base64');
        let hash = createHash.createHash('sha256')
        .update(guess)
        .digest('base64');
        return hash.startsWith('0000');
    }

    hash(block){
        let block_string = JSON.stringify(block);
        console.log("block " + block_string);
        let base64_string = Buffer.from(block_string.toString()).toString("base64");
        let hash = createHash.createHash('sha256')
        .update(base64_string)
        .digest('base64');
        console.log("Creating Hash " + hash);
        return hash;
    }

    new_transaction(sender,recipient,amount){
        this.current_transactions.push(
            {
                sender: sender,
                amount: amount,
                recipient : recipient
        });
        if (this.chain.length == 0){
            return 1;
        }
        else{
            return this.chain[this.chain.length -1].index +1;
        }
    }
}

let blockchain = new Blockchain();
module.exports = blockchain;