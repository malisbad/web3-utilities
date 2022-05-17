import { Chain, isMinedUncleBlock } from './utils';

describe('isMinedUncleBlock', () => {
    test.skip('Checks correctly against a block with no uncles', () => {

    });

    test('Checks correctly against a block with uncles', async () => {
        const isUncle = await isMinedUncleBlock(Chain.ETH, 14792407, undefined, '0x00192fb10dF37c9FB26829eb2CC623cd1BF599E8')
        await expect(isUncle).toBe(false);
    })
});
