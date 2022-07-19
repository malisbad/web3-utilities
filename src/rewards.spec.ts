/**
 * Some of the tests in this suite are disabled by default because
 * they are very heavy to run, and if you test these against a light
 * node, or a full node that you don't have an arrangement with, you 
 * can end up with your node getting kicked off the network.
 */
import BN from 'bn.js';
import { calculateBlockReward } from './utils';

describe.only('Block reward calculations', ()  => {
    test('Calculates the correct post-London blockreward', async () => {
        const totalReward = await calculateBlockReward(14811417);
        expect(totalReward.eq(new BN("2029985731605798020"))).toBe(true);
    });

    test('Calculates the correct value for blocks with one uncle', async () => {
        const totalReward = await calculateBlockReward(14811419)
        expect(totalReward.eq(new BN("2195065261011318564"))).toBe(true);
    });

    test('Calculates the correct value for blocks with two uncles', async () => {
        const totalReward = await calculateBlockReward(14996758)
        expect(totalReward.eq(new BN("2197429983749541284"))).toBe(true);
    });

    // TODO this currently fails because of the way that transaction receipts are handled
    test.skip('Calcualtes the correct pre-London blockward', async () => {
        const totalReward = await calculateBlockReward(4370010).then(res => {console.log(res.toString()); return res});
        expect(totalReward.eq(new BN("3039490300691388602"))).toBe(true);
    });

    test('Calcualtes the correct pre-byzantine blockward, early mining', async () => {
        const totalReward = await calculateBlockReward(450).then(res => {console.log(res.toString()); return res});
        expect(totalReward.eq(new BN("5000000000000000000"))).toBe(true);
    });

    // TODO this currently fails because of the way that transaction receipts are handled
    test.skip('Calcualtes the correct pre-byzantine blockward, later mining', async () => {
        const totalReward = await calculateBlockReward(4530000).then(res => {console.log(res.toString()); return res});
        expect(totalReward.eq(new BN("3098266553451756196"))).toBe(true);
    });
});
