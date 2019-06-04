/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class VoteContract extends Contract {
    async getAllVote(ctx) {
        const startKey = 'vote0';
        const endKey = 'vote999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async getLastVote(ctx) {
        const startKey = 'vote0';
        const endKey = 'vote999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        let result = {};
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                result = { Key, Record };
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(result);
                return JSON.stringify(result);
            }
        }
    }

    async voteExists(ctx, voteId) {
        const buffer = await ctx.stub.getState(voteId);
        return !!buffer && buffer.length > 0;
    }

    async createVote(ctx, voteId, value) {
        const exists = await this.voteExists(ctx, voteId);
        if (exists) {
            throw new Error(`The vote ${voteId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(voteId, buffer);
    }

    async readVote(ctx, voteId) {
        const exists = await this.voteExists(ctx, voteId);
        if (!exists) {
            throw new Error(`The vote ${voteId} does not exist`);
        }
        const buffer = await ctx.stub.getState(voteId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateVote(ctx, voteId, newValue) {
        const exists = await this.voteExists(ctx, voteId);
        if (!exists) {
            throw new Error(`The vote ${voteId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(voteId, buffer);
    }

    async deleteVote(ctx, voteId) {
        const exists = await this.voteExists(ctx, voteId);
        if (!exists) {
            throw new Error(`The vote ${voteId} does not exist`);
        }
        await ctx.stub.deleteState(voteId);
    }
}

module.exports = VoteContract;
