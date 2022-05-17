const Web3 = require('web3'); // necessary for Node.js

const cliArgs = process.argv.slice(2);
const provider = cliArgs[0];

export enum Chain {
    ETH,
}

const web3 = new Web3('http://localhost:8545');

const getUncle = async (chain: Chain, blockHeight: number, idx: number, hash: string) => {
    const block = await web3.eth.getUncle(blockHeight, idx);
    return hash === block.hash || hash === block.miner;
};

export const isMinedUncleBlock = async (chain: Chain, blockHeight: number, blockhash?: string, coinbaseAddr?: string): Promise<boolean> => {
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
    return await isUncle;
};
