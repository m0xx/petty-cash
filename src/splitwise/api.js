const SplitwiseClient = require('splitwise');

const notFoundHandler = (err) => {
    if(err.message && err.message.indexOf('record not found') > -1) {
        return null;
    }

    throw err;
}


class Api {
    constructor({consumerKey, consumerSecret, groupId, cashierId}) {
        if(!consumerKey || !consumerSecret || !groupId || !cashierId) {
            throw new Error("missing params...")
        }

        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
        this.groupId = groupId;
        this.cashierId = cashierId;
    }
    _client() {
        // TODO: could be better require server trip each time
        return SplitwiseClient({
            consumerKey: this.consumerKey,
            consumerSecret: this.consumerSecret
        });
    }
    getUsers() {
        return this.getGroup()
            .then(({members}) => members)
    }
    getUserById(id) {
        return this._client()
            .getUser({ id })
            .catch(notFoundHandler);
    }
    getGroup() {
        return this._client()
            .getGroup({
                id: this.groupId
            })
    }
    createExpense({from, to, isPayment, amount, description}) {
        return this._client()
            .createExpense({
                description,
                group_id: this.groupId,
                payment: isPayment,
                cost: amount,
                users: [
                    {
                        user_id: from,
                        paid_share: amount,
                    },
                    {
                        user_id: to,
                        owed_share: amount,
                    },
                ],
            })
    }

}

module.exports = (options) => {
    return new Api(options)
}
