const Joi = require('joi');
const Boom = require('boom');

const cashierCredit = ({productId, userId, quantity, plugins}) => {
    const { store } = plugins.store;
    const { splitwise } = plugins.splitwise;

    let product;
    let user;
    return Promise.all([
        store.getProductById(productId),
        splitwise.getUserById(userId)
    ])
        .then(([_product, _user]) => {
            if (_product === null || _user === null) {
                throw new Error('not_found');
            }

            product = _product;
            user = _user;
            return store.updateProduct(productId, {
                quantity: product.quantity - quantity
            });
        })
        .then((product) => {
            const amount = quantity * product.price;

            return splitwise.createExpense({
                from: splitwise.cashierId,
                to: userId,
                amount,
                description: `${user.first_name} took (${quantity}) ${product.name}`,
                isPayment: true
            })
                .then(() => (store.createTransaction({
                    type: 'cashier-credit',
                    data: {
                        userId,
                        productId,
                        quantity,
                        amount
                    }
                })))
        })
}

const cashierRefund = ({productId, userId, quantity, amount, plugins}) => {
    const { store } = plugins.store;
    const { splitwise } = plugins.splitwise;

    let product;
    let user;
    return Promise.all([
        store.getProductById(productId),
        splitwise.getUserById(userId)
    ])
        .then(([_product, _user]) => {
            if (_product === null || _user === null) {
                throw new Error('not_found');
            }

            product = _product;
            user = _user;
            return store.updateProduct(productId, {
                quantity: product.quantity + quantity
            });
        })
        .then((product) => {
            return splitwise.createExpense({
                from: userId,
                to: splitwise.cashierId,
                amount,
                description: `${user.first_name} bought (${quantity}) ${product.name}`,
                isPayment: true
            })
                .then(() => (store.createTransaction({
                    type: 'cashier-refund',
                    data: {
                        userId,
                        productId,
                        quantity,
                        amount
                    }
                })))
        })
}

const buyPost = {
    method: 'POST',
    path: '/cashier/credit',
    config: {
        validate: {
            payload: {
                productId: Joi.string().required(),
                userId: Joi.string().required(),
                quantity: Joi.number().required()
            }
        }
    },
    handler: (request, h) => {
        const { plugins } = request.server;
        const { productId, userId, quantity } = request.payload;

        return cashierCredit({productId, userId, quantity, plugins})
            .catch((err) => {
                if(err.message && err.message === 'not_found') {
                    return Boom.notFound();
                }

                throw err;
            })
    }
};

const buyGet = {
    method: 'GET',
    path: '/cashier/credit',
    config: {
        validate: {
            query: {
                productId: Joi.string().required(),
                userId: Joi.string().required(),
                quantity: Joi.number().required()
            }
        }
    },
    handler: (request, h) => {
        const { plugins } = request.server;
        const { productId, userId, quantity } = request.query;

        return cashierCredit({productId, userId, quantity, plugins})
            .catch((err) => {
                if(err.message && err.message === 'not_found') {
                    return Boom.notFound();
                }

                throw err;
            })
    }
};

const refundPost = {
    method: 'POST',
    path: '/cashier/refund',
    config: {
        validate: {
            payload: {
                productId: Joi.string().required(),
                userId: Joi.string().required(),
                quantity: Joi.number().required(),
                amount: Joi.number().required()
            }
        }
    },
    handler: (request, h) => {
        const { plugins } = request.server;
        const { productId, userId, quantity, amount } = request.payload;

        return cashierRefund({productId, userId, quantity, amount, plugins})
            .catch((err) => {
                if(err.message && err.message === 'not_found') {
                    return Boom.notFound();
                }

                throw err;
            })
    }
};

const refundGet = {
    method: 'GET',
    path: '/cashier/refund',
    config: {
        validate: {
            query: {
                productId: Joi.string().required(),
                userId: Joi.string().required(),
                quantity: Joi.number().required(),
                amount: Joi.number().required()
            }
        }
    },
    handler: (request, h) => {
        const { plugins } = request.server;
        const { productId, userId, quantity, amount } = request.query;

        return cashierRefund({productId, userId, quantity, amount, plugins})
            .catch((err) => {
                if(err.message && err.message === 'not_found') {
                    return Boom.notFound();
                }

                throw err;
            })
    }
};

const getBalance = {
    method: 'GET',
    path: '/cashier/balance',
    handler: (request, h) => {
        const { splitwise } = request.server.plugins.splitwise;

        return splitwise.getBalance()
            .then((balance) => ({amount: balance}))
            .catch((err) => {
                console.error(err);
                return Boom.internal();
            })
    }
};

module.exports = {
    name: 'cashier',
    register: function(server, options) {
        server.route([buyPost, buyGet, refundPost, refundGet, getBalance]);
    }
};
