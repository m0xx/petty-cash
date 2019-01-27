const Joi = require('joi');
const Boom = require('boom');

const createProduct = {
    method: 'POST',
    path: '/products',
    config: {
        validate: {
            payload: {
                name: Joi.string().required(),
                description: Joi.string().required(),
                price: Joi.number().required()
            }
        }
    },
    handler: (request, h) => {
        const {store} = request.server.plugins.store;
        const { name, description, price } = request.payload;

        return store.createProduct({ name, description, price });
    }
};

const getProducts = {
    method: 'GET',
    path: '/products',
    handler: (request, h) => {
        const {store} = request.server.plugins.store;

        return store.getProducts();
    }
};

const getProduct = {
    method: 'GET',
    path: '/products/{productId}',
    handler: (request, h) => {
        const {store} = request.server.plugins.store;
        const { params: { productId } } = request;

        return store.getProductById(productId).then(product => (product === null ? Boom.notFound() : product));
    }
};

const updateProduct = {
    method: 'PATCH',
    path: '/products/{productId}',
    config: {
        validate: {
            payload: {
                name: Joi.string(),
                description: Joi.string(),
                price: Joi.number(),
                quantity: Joi.number(),
            }
        }
    },
    handler: (request, h) => {
        const {store} = request.server.plugins.store;
        const { params: { productId }, payload: updateFields } = request;

        return store.updateProduct(productId, updateFields).catch(err => {
            if (err.message && err === 'not_found') {
                return Boom.notFound();
            }

            return Boom.internal();
        });
    }
};

module.exports = {
    name: 'products',
    register: function(server, options) {
        server.route([getProducts, createProduct, getProduct, updateProduct]);
    }
};
