const client = require('prom-client');

const productSellCounter = new client.Counter({
    name: 'cashier_product_sell',
    help: 'Product sell',
    labelNames: ['productId', 'user', 'product']
});

const productGauge = new client.Gauge({
    name: 'cashier_product_qty',
    help: 'Product quantity',
    labelNames: ['name', 'id']
});

const balanceGauge = new client.Gauge({
    name: 'cashier_balance',
    help: 'Cashier balance'
});

function balanceMetrics(splitwise) {
    splitwise.getBalance()
        .then((balance) => {
            balanceGauge.set(balance);
        })
}
function productMetrics(store) {
    Promise.resolve()
        .then(() => {
            return store.getProducts()
        })
        .then((products) => {
            products.forEach(({id, name, quantity}) => {
                productGauge.set({id, name}, quantity)
            })
        })
}

function collectMetrics(store, splitwise) {
    productMetrics(store)
    balanceMetrics(splitwise)
}

const metrics = {
    method: 'GET',
    path: '/metrics',
    handler: (request, h) => {
        return client.register.metrics();
    }
};

module.exports = {
    name: 'metrics',
    register: async (server, options) => {

        server.route([metrics]);

        server.events.on('credit', ({userId, productId, quantity}) => {
            const {store} = server.plugins.store;
            const {splitwise} = server.plugins.splitwise;

            Promise.all([
                store.getProductById(productId),
                splitwise.getUserById(userId)
            ])
                .then(([product, user]) => {
                    productSellCounter.inc({
                        productId: product.id,
                        product: product.name,
                        user: `${user.first_name} ${user.last_name || ''}`
                    }, quantity)
                })
        })

        setInterval(() => {
            const {store} = server.plugins.store;
            const {splitwise} = server.plugins.splitwise;

            collectMetrics(store, splitwise);
        }, process.env.METRICS_INTERVAL || 5000)
    }
}