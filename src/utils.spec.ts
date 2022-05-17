import { Chain, isMinedUncleBlock } from './utils';

// blocks here were selected from etherscan.io
describe('isMinedUncleBlock, ETH', () => {
    const chain = Chain.ETH;
    test('Checks correctly against a block with no uncles, by miner', async () => {
        const isUncle = await isMinedUncleBlock(chain, 14793163, undefined, '0x8b4de256180cfec54c436a470af50f9ee2813dbb');
        await expect(isUncle).toBe(false);
    });

    test('Checks correctly against a block with uncles, by miner', async () => {
        const isUncle = await isMinedUncleBlock(chain, 14792407, undefined, '0x00192fb10dF37c9FB26829eb2CC623cd1BF599E8');
        await expect(isUncle).toBe(false);
    });

    test('Checks correctly against a block with no uncles, by blockhash', async () => {
        const isUncle = await isMinedUncleBlock(chain, 14793163, '0xc71bdf4d8b38adfe7cc67f63bf8c66218caf237b493916174421b15a6aa5ccf8');
        await expect(isUncle).toBe(false);
    });

    test('Checks correctly against a block with uncles, by blockhash', async () => {
        const isUncle = await isMinedUncleBlock(chain, 14792407, '0xba5ffacddb2d7deccb1a8bb3ad458ec53fd5b7495335b5a83e03501dc7b5d8a2');
        await expect(isUncle).toBe(false);
    });

    test('Checks correctly against a block where blockhash is an uncle, by blockhash', async () => {
        const isUncle = await isMinedUncleBlock(chain, 14792407, '0xcfc079eeda235019debe19a8e7035924989e22436235bb0f828df884644108ca');
        await expect(isUncle).toBe(true);
    });

    test('Checks correctly against a block where blockhash is an uncle, by miner', async () => {
        const isUncle = await isMinedUncleBlock(chain, 14792407, undefined, '0xea674fdde714fd979de3edf0f56aa9716b898ec8');
        await expect(isUncle).toBe(true);
    });

    test('Checks correctly against a block with uncles, in nth position, by blockhash', async ()  => {
        const isUncle = await isMinedUncleBlock(chain, 14792921, '0xa1b505e34ae3ce8f1e5c411dee199c60f4863b069684459bc190774b823b82cc');
        await expect(isUncle).toBe(true);
    });

    test('Checks correctly against a block with uncles, in nth position, by miner', async ()  => {
        const isUncle = await isMinedUncleBlock(chain, 14792921, undefined, '0xc730b028da66ebb14f20e67c68dd809fbc49890d');
        await expect(isUncle).toBe(true);
    });

    test('Fails correctly against a block with no uncles by blockhash', async ()  => {
        const blockHeight = 14792920;
        await expect(isMinedUncleBlock(chain, blockHeight, '0xa1b505e34ae3ce8f1e5c411dee199c60f4863b069684459bc190774b823b82cc'))
            .rejects
            .toThrowError(`${chain} at ${blockHeight} does not match and there are no uncles`);
    });

    test('Fails correctly against a block with no uncles by miner', async ()  => {
        const blockHeight = 14792920;
        await expect(isMinedUncleBlock(chain, blockHeight, undefined, '0x8b4de256180cfec54c436a470af50f9ee2813dbb'))
            .rejects
            .toThrowError(`${chain} at ${blockHeight} does not match and there are no uncles`);
    });

    test('Fails correctly against a block with uncles by miner', async ()  => {
        const blockHeight = 14793642;
        await expect(isMinedUncleBlock(chain, blockHeight, undefined, '0x8b4de256180cfec54c436a470af50f9ee2813dbb'))
            .rejects
            .toThrowError(`${chain} at ${blockHeight} is possibly orphaned`);
    });

    test('Fails correctly against a block with uncles by blockhash', async ()  => {
        const blockHeight = 14793642;
        await expect(isMinedUncleBlock(chain, blockHeight, '0xa1b505e34ae3ce8f1e5c411dee199c60f4863b069684459bc190774b823b82cc'))
            .rejects
            .toThrowError(`${chain} at ${blockHeight} is possibly orphaned`);
    });
});
