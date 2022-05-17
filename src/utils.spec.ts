import { Chain, isMinedUncleBlock } from './utils';

// blocks here were selected from etherscan.io
describe('isMinedUncleBlock', () => {
    test('Checks correctly against a block with no uncles, by miner', async () => {
        const isUncle = await isMinedUncleBlock(Chain.ETH, 14793163, undefined, '0x8b4de256180cfec54c436a470af50f9ee2813dbb');
        await expect(isUncle).toBe(false);
    });

    test('Checks correctly against a block with uncles, by miner', async () => {
        const isUncle = await isMinedUncleBlock(Chain.ETH, 14792407, undefined, '0x00192fb10dF37c9FB26829eb2CC623cd1BF599E8');
        await expect(isUncle).toBe(false);
    });

    test('Checks correctly against a block with no uncles, by blockhash', async () => {
        const isUncle = await isMinedUncleBlock(Chain.ETH, 14793163, '0xc71bdf4d8b38adfe7cc67f63bf8c66218caf237b493916174421b15a6aa5ccf8');
        await expect(isUncle).toBe(false);
    });

    test('Checks correctly against a block with uncles, by blockhash', async () => {
        const isUncle = await isMinedUncleBlock(Chain.ETH, 14792407, '0xba5ffacddb2d7deccb1a8bb3ad458ec53fd5b7495335b5a83e03501dc7b5d8a2');
        await expect(isUncle).toBe(false);
    });

    test('Checks correctly against a block where blockhash is an uncle, by blockhash', async () => {
        const isUncle = await isMinedUncleBlock(Chain.ETH, 14792407, '0xcfc079eeda235019debe19a8e7035924989e22436235bb0f828df884644108ca');
        await expect(isUncle).toBe(true);
    });

    test('Checks correctly against a block with uncles, in nth position, by blockhash', async ()  => {
        const isUncle = await isMinedUncleBlock(Chain.ETH, 14792921, '0xa1b505e34ae3ce8f1e5c411dee199c60f4863b069684459bc190774b823b82cc');
        await expect(isUncle).toBe(true);
    });
});
