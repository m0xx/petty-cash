const listTransactions = {
    method: 'GET',
    path: '/transactions',
    handler: (request, h) => {
        const {store} = request.server.plugins.store;

        return store.getTransactions();
    }
};

module.exports = {
    name: 'transactions',
    register: function(server, options) {
        server.route([listTransactions]);
    }
};
