/**
 * Some of the tests in this suite are disabled by default because
 * they are very heavy to run, and if you test these against a light
 * node, or a full node that you don't have an arrangement with, you 
 * can end up with your node getting kicked off the network.
 */
import BN from 'bn.js';
import { calculateBlockReward, blockRewardsByRange } from './utils';
import { multiblockData } from "../test-data/blockrewards";

describe.only('Block reward calculations', ()  => {
    test('Calculates the correct post-London blockreward', async () => {
        const totalReward = await calculateBlockReward(15173569);
        expect(totalReward.eq(new BN("2015751493299477688"))).toBe(true);
    });

    test('Calculates the correct value for blocks with one uncle', async () => {
        const totalReward = await calculateBlockReward(15173570)
        expect(totalReward.eq(new BN("2163758172683062587"))).toBe(true);
    });

    test('Calculates the correct value for blocks with two uncles', async () => {
        const totalReward = await calculateBlockReward(14996758)
        expect(totalReward.eq(new BN("2197429983749541284"))).toBe(true);
    });

    // TODO this currently fails because of the way that transaction receipts are handled
    test.skip('Calcualtes the correct pre-London blockreward', async () => {
        const totalReward = await calculateBlockReward(4370010);
        expect(totalReward.eq(new BN("3039490300691388602"))).toBe(true);
    });

    test('Calcualtes the correct pre-byzantine blockreward, early mining', async () => {
        const totalReward = await calculateBlockReward(450);
        expect(totalReward.eq(new BN("5000000000000000000"))).toBe(true);
    });

    // TODO this currently fails because of the way that transaction receipts are handled
    test.skip('Calcualtes the correct pre-byzantine blockreward, later mining', async () => {
        const totalReward = await calculateBlockReward(4530000);
        expect(totalReward.eq(new BN("3098266553451756196"))).toBe(true);
    });

    // something is wrong with the addition of multiple rewards, and the numbers are wildly different.
    test.skip('Calcualtes the correct post-london blockreward, early mining', async () => {
        const totalReward = await blockRewardsByRange({earliest: 15173560, latest: 15173570});

        const totalBlockReward = (await totalReward.blockRewards).reduce((acc, reward) => acc.iadd(reward), new BN(0));
        const totalUncleReward = (await totalReward.uncleRewards).reduce((acc, reward) => acc.iadd(reward), new BN(0));
        totalReward.blockRewards.then(res => console.log(res.map(reward => reward.toString())));
        totalReward.uncleRewards.then(res => console.log(res.map(reward => reward.toString())));
        const targetBlockReward = multiblockData.blockRewards.reduce((acc, blockData) => acc.iadd(new BN(blockData.reward)), new BN(0))
        const targetUncleReward = multiblockData.uncleRewards.reduce((acc, blockData) => acc.iadd(new BN(blockData.reward)), new BN(0))

        expect(totalBlockReward.toString()).toMatch(targetBlockReward.toString());
        expect(totalUncleReward.toString()).toMatch(targetUncleReward.toString());
    });
});
