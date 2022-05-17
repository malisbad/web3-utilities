const Web3 = require('web3'); // necessary for Node.js

const cliArgs = process.argv.slice(2);
const provider = cliArgs[0];

export enum Chain {
    ETH,
}

const web3 = new Web3('http://localhost:8545');

export const isMinedUncleBlock = async (chain: Chain, blockHeight: number, blockhash?: string, coinbaseAddr?: string): Promise<boolean> => {
    const checksumCoinbaseAddr = web3.utils.toChecksumAddress(coinbaseAddr);
    return web3.eth.getBlock(blockHeight)
        .then(block => {
            if (!block) throw new Error(`${chain} at block height ${blockHeight} does not exist`)
            return block;
        })
        .then(block => {
            if (blockhash && block.hash === blockhash) return false; // if the block at this height and the block hash match, not an uncle
            if (coinbaseAddr && block.miner === checksumCoinbaseAddr) return false;
            if (block.uncles.length > 0) return true;
            throw new Error(`${chain} at block height ${blockHeight} with hash ${blockhash} does not exist`);
        });
};