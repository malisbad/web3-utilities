const Web3 = require('web3'); // necessary for Node.js

import BN from "bn.js";

export enum Chain {
    ETH = 'ETH',
}

export default class W3Utils {
    web3;
    subscribe;
    unsubscribe;

    constructor(provider: string) {
        this.web3 = new Web3(provider);
        this.subscribe = this.web3.subscribe;
        this.unsubscribe = this.web3.unsubscribe;
    }


    async getUncle(chain: Chain, blockHeight: number, idx: number, hash: string) {
        const block = await this.web3.eth.getUncle(blockHeight, idx);
        return hash === block.hash || hash === block.miner;
    };

    async isMinedUncleBlock(chain: Chain, blockHeight: number, blockhash?: string, coinbaseAddr?: string): Promise<boolean | Error> {
        const checksumCoinbaseAddr = this.web3.utils.toChecksumAddress(coinbaseAddr);
        const block = await this.web3.eth.getBlock(blockHeight);
    
        if (!block) throw new Error(`${chain} at block height ${blockHeight} does not exist`)
        if (blockhash && block.hash === blockhash) return false; // if the block at this height and the block hash match, not an uncle
        if (checksumCoinbaseAddr && block.miner === checksumCoinbaseAddr) return false;
        if (block.uncles.length === 0) throw new Error(`${chain} at ${blockHeight} does not match and there are no uncles`);
    
        // deep check the uncles array
        let isUncle = false;
        for (let i = 0; i < block.uncles.length; i++) {
            isUncle = await this.getUncle(chain, blockHeight, i, blockhash || checksumCoinbaseAddr);
        }
        if (await isUncle === false) {
            throw new Error(`${chain} at ${blockHeight} is possibly orphaned`)
        } else {
            return isUncle;
        };
    };

    async calculateBlockReward(blockHeight: number) {
        const block = await this.web3.eth.getBlock(blockHeight);
        const baseReward = this.web3.utils.toWei(new BN(2), 'ether');
        const gasUsed = new BN(block.gasUsed);
        const baseGasFee = new BN(block.baseFeePerGas);
        const uncleInclusionRewards = new BN(this.web3.utils.toWei("0.0625", 'ether')).mul(new BN(block.uncles.length));
        const burnedFee = gasUsed.mul(baseGasFee);
    
        let transactionReceipts: Promise<any>[] = [];
        for (let i = 0; i < block.transactions.length; i++) {
            transactionReceipts.push(this.web3.eth.getTransactionReceipt(block.transactions[i]));
        };
        
        // get all of the receipts FIRST, then process otherwise it is too slow
        return Promise.all(transactionReceipts)
            .then(receipts => {
                // can't declare this in the initil value arg as it will always rest to zero
                let accumulator = new BN(0); 
                return receipts.reduce((acc, receipt) => {
                    const txGasUsed = new BN(receipt.gasUsed);
                    const gasPrice = new BN(receipt.effectiveGasPrice);
                    const total = txGasUsed.mul(gasPrice)
                    return acc.add(total);
                    }, accumulator
                )
            })
            .then(transactionRewards => baseReward.add(transactionRewards).add(uncleInclusionRewards).sub(burnedFee))
    }; 
}

// TODO calculate blockrewards for normal blocks between two dates

// TODO calculate blockrewards for uncle blocks between two dates
