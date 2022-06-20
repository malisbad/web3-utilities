const Web3 = require('web3'); // necessary for Node.js

import BN from "bn.js";
import { Console } from "console";

const cliArgs = process.argv.slice(2);
const provider = cliArgs[0] || 'http://localhost:8545';

export enum Chain {
    ETH = 'ETH',
}

let web3 = new Web3(provider);

const getUncle = async (chain: Chain, blockHeight: number, idx: number, hash: string) => {
    const block = await web3.eth.getUncle(blockHeight, idx);
    return hash === block.hash || hash === block.miner;
};

const getTransactionReceipt = async (txHash: number) => {
    const tx = await web3.eth.getTransactionReceipt(txHash);
    return tx;
};

export const isMinedUncleBlock = async (chain: Chain, blockHeight: number, blockhash?: string, coinbaseAddr?: string): Promise<boolean | Error> => {
    const checksumCoinbaseAddr = web3.utils.toChecksumAddress(coinbaseAddr);
    const block = await web3.eth.getBlock(blockHeight);

    if (!block) throw new Error(`${chain} at block height ${blockHeight} does not exist`)
    if (blockhash && block.hash === blockhash) return false; // if the block at this height and the block hash match, not an uncle
    if (checksumCoinbaseAddr && block.miner === checksumCoinbaseAddr) return false;
    if (block.uncles.length === 0) throw new Error(`${chain} at ${blockHeight} does not match and there are no uncles`);

    // deep check the uncles array
    let isUncle = false;
    for (let i = 0; i < block.uncles.length; i++) {
        isUncle = await getUncle(chain, blockHeight, i, blockhash || checksumCoinbaseAddr);
    }
    if (await isUncle === false) {
        throw new Error(`${chain} at ${blockHeight} is possibly orphaned`)
    } else {
        return isUncle;
    };
};

export const calculateBlockReward = async (blockHeight: number) => {
    const block = await web3.eth.getBlock(blockHeight);
    const baseReward = web3.utils.toWei(new BN(2), 'ether');
    const gasUsed = new BN(block.gasUsed);
    const baseGasFee = new BN(block.baseFeePerGas);
    const uncleInclusionRewards = new BN(web3.utils.toWei("0.0625", 'ether')).mul(new BN(block.uncles.length));
    const burnedFee = gasUsed.mul(baseGasFee);

    let transactionReceipts: Promise<any>[] = [];
    for (let i = 0; i < block.transactions.length; i++) {
        transactionReceipts.push(web3.eth.getTransactionReceipt(block.transactions[i]));
    };
    
    // get all of the receipts FIRST, then process otherwise it is too slow
    return Promise.all(transactionReceipts)
        .then(receipts => {
            // can't declare this in the initil value arg as it will always rest to zero
            let accumulator = new BN(0); 
            return receipts.reduce((acc, receipt) => {
                const gasUsed = new BN(receipt.gasUsed);
                const gasPrice = new BN(receipt.effectiveGasPrice);
                const total = gasUsed.mul(gasPrice)
                return acc.add(total);
                }, accumulator
            )
        })
        .then(transactionRewards => baseReward.add(transactionRewards).add(uncleInclusionRewards).sub(burnedFee))
}

// TODO calculate blockrewards for normal blocks between two dates

// TODO calculate blockrewards for uncle blocks between two dates
