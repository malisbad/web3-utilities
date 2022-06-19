import BN from 'bn.js';
import { Chain, calculateBlockReward } from './utils';

describe('Block reward calculations', ()  => {
    test('Calculates the correct post-London blockreward', async () => {
        const totalReward = await calculateBlockReward(14811417);
        expect(totalReward.eq(new BN("2029985731605798020"))).toBe(true);
    }, 350000);
});
