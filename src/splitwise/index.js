const createApi = require('./api');

module.exports = {
    name: 'splitwise',
    register: function(server, options) {
        server.expose('splitwise', createApi({
            consumerKey: process.env.SPLITWISE_KEY,
            consumerSecret: process.env.SPLITWISE_SECRET,
            groupId: process.env.SPLITWISE_GROUP_ID,
            cashierId: process.env.SPLITWISE_CASHIER_ID,
            walletId: process.env.SPLITWISE_WALLET_ID,
        }))

        server.route([]);
    }
};
