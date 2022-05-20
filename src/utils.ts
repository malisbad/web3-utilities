const Web3 = require('web3'); // necessary for Node.js

import BN from "bn.js";

const cliArgs = process.argv.slice(2);
const provider = cliArgs[0];

export enum Chain {
    ETH = 'ETH',
}

const web3 = new Web3('http://localhost:8545' || provider);

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
    const burnedFee = gasUsed.mul(baseGasFee);

    // TODO this method is slow AF (39s in testing M1 Mac Mini), needs improvement
    let totalFees = new BN(0);
    for (let i = 0; i < block.transactions.length; i++) {
        const txDetails = await getTransactionReceipt(block.transactions[i]);
        const gasUsed = new BN(txDetails.gasUsed);
        const gasPrice = new BN(txDetails.effectiveGasPrice);
        totalFees = totalFees.add(gasUsed.mul(gasPrice));
    };

    return baseReward.add(await totalFees).sub(burnedFee);
}

// TODO calculate blockrewards for normal blocks between two dates

// TODO calculate blockrewards for uncle blocks between two dates

