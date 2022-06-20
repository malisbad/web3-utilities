import BN from 'bn.js';
import { Chain, calculateBlockReward } from './utils';

describe('Block reward calculations', ()  => {
    test('Calculates the correct post-London blockreward', async () => {
        const totalReward = await calculateBlockReward(14811417);
        expect(totalReward.eq(new BN("2029985731605798020"))).toBe(true);
    }, 350000);

    test('Calculates the correct value for blocks with one uncle', async () => {
        const totalReward = await calculateBlockReward(14811419)
            .catch(console.log);
        expect(totalReward.eq(new BN("2195065261011318564"))).toBe(true);
    }, 35000);

    test('Calculates the correct value for blocks with two uncles', async () => {
        const totalReward = await calculateBlockReward(14996758)
            .catch(console.log);
        expect(totalReward.eq(new BN("2197429983749541284"))).toBe(true);
    }, 35000);
});
