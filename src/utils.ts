const Web3 = require('web3'); // necessary for Node.js

import BN from "bn.js";

const cliArgs = process.argv.slice(2);
const provider = cliArgs[0] || 'http://localhost:8545';

export enum Chain {
    ETH = 'ETH',
}

let web3 = new Web3('http://localhost:8545');

const getBaseReward = (blockHeight: number) => {
    let baseReward = 0;
    if (blockHeight <= 4369999) baseReward = 5
    if (blockHeight >= 4370000 && blockHeight <= 7279999) baseReward = 3
    if (blockHeight >= 7280000) baseReward = 2
    return web3.utils.toWei(new BN(baseReward), 'ether');
}

const getUncle = async (chain: Chain, blockHeight: number, idx: number, hash: string) => {
    const block = await web3.eth.getUncle(blockHeight, idx);
    return hash === block.hash || hash === block.miner;
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

export const calculateBlockReward = async (blockHeight?: number, blockInput?: any): Promise<BN> => {
    const block = blockInput || await web3.eth.getBlock(blockHeight);
    const baseReward = getBaseReward(blockHeight || blockInput.height);
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

export const calculateUncleBlockReward = async (includedInBlock, uncleIndex: number) => {
    const block = await (web3.eth.getUncle(includedInBlock.hash, uncleIndex));
    const reward = web3.utils.toWei(((block.number + 8 - includedInBlock.number) * (2 / 8)).toString());
    return new BN(reward);
}

type BlockRange = {
    earliest?: number;
    latest?: number;
}

// TODO calculate blockrewards for normal blocks between two dates
export const blocksByRange = async ({earliest, latest}: BlockRange) => {
    const latestBlock = await web3.eth.getBlock("latest");
    const lastBlock = latest ? latest : latestBlock.number;
    if(!earliest) earliest = latestBlock - 10000;
    
    const blocks: Promise<any>[] = [];
    for (let i = earliest; i <= lastBlock; i++) {
        blocks.push(web3.eth.getBlock(i));
    };

    return Promise.all(blocks);
}

export const blockRewardsByRange = async ({earliest, latest}: BlockRange) => {
    let blockRewards: Promise<any>[] = [];
    let uncleRewards: Promise<any>[] = [];

    const blocks = await blocksByRange({ earliest, latest });

    for (let i = 0; i < blocks.length; i++) {
        const currentBlock = blocks[i];
        blockRewards.push(calculateBlockReward(undefined, currentBlock));
        if (currentBlock.uncles.length > 0) {
            for (let j = 0; j < currentBlock.uncles.length; j++) {
                const uncleReward = calculateUncleBlockReward(currentBlock, j);
                uncleRewards.push(uncleReward);
            }
        }
    }

    return {
        blockRewards: Promise.all(blockRewards),
        uncleRewards: Promise.all(uncleRewards)
    }
}

/**
 * Currently one of the slowest ways to batch out requests, but doesn it in a way
 * that will not produce warnings from Geth. Geth will start to output warnings
 * when there are 100 or more concurrent requests in progress.
 * @param param0
 * @returns 
 */
export const batchBlockRewardsByRange = async ({earliest, latest}: BlockRange) => {
    const latestBlock = await web3.eth.getBlock("latest");
    const lastBlock = latest ? latest : latestBlock.number;
    if(!earliest) earliest = latestBlock - 10000;
    
    let batch = new web3.BatchRequest();
    for (let i = earliest; i <= lastBlock; i++) {
        batch.add(web3.eth.getBlock.request(i));
    };

    return batch.execute();
}

// TODO calculate blockrewards for uncle blocks between two dates

// blockRewardsByRange({latest: 15005566, earliest: 15005565})
// blockRewardsByRange({latest: 15005547, earliest: 15005546})
//     .then(blocks => {
//         blocks.blockRewards.then(res => res.toString()).then(res => console.log('Block rewards: ', res));
//         blocks.uncleRewards.then(res => res.toString()).then(res => console.log('Uncle rewards: ', res));
//     })
//     .catch(err => console.log(err));
