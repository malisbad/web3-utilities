import BN from 'bn.js';
import W3Utils, { Chain } from './utils';

describe('Block reward calculations', ()  => {
    const chain = Chain.ETH;
    const w3Utils = new W3Utils("http://localhost:8545");

    test('Calculates the correct post-London blockreward', async () => {
        const totalReward = await w3Utils.calculateBlockReward(14811417);
        expect(totalReward.eq(new BN("2029985731605798020"))).toBe(true);
    }, 350000);

    test('Calculates the correct value for blocks with one uncle', async () => {
        const totalReward = await w3Utils.calculateBlockReward(14811419)
            .catch(console.log);
        expect(totalReward.eq(new BN("2195065261011318564"))).toBe(true);
    }, 35000);

    test('Calculates the correct value for blocks with two uncles', async () => {
        const totalReward = await w3Utils.calculateBlockReward(14996758)
            .catch(console.log);
        expect(totalReward.eq(new BN("2197429983749541284"))).toBe(true);
    }, 35000);
});
