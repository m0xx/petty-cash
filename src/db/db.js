const shortid = require('shortid');

function nextId() {
    return shortid.generate();
}

class DB {
    constructor(db) {
        if (!db || !db.get) {
            throw new Error('db must be defined...');
        }

        this.db = db;
    }
    _getById(collection, id) {
        const item = this.db.get(collection).find({ id }).value();

        return Promise.resolve(item);
    }
    createTransaction({ type, data }) {
        const id = nextId();

        return this.db
            .get('transactions')
            .push({
                id,
                type,
                data,
                createdAt: new Date().toISOString()
            })
            .write()
            .then(() => this.getTransactionById(id));
    }
    getTransactionById(id) {
        return this._getById('transactions', id);
    }
    getProducts() {
        return this.db
            .get('products')
            .value();
    }
    createProduct({ name, description, price }) {
        const id = nextId();
        return this.db
            .get('products')
            .push({
                id,
                name,
                description,
                price: price,
                quantity: 0
            })
            .write()
            .then(() => this.getProductById(id));
    }
    updateProduct(id, update) {
        if (!id) {
            throw new Error('id must be defined');
        }

        return this.getProductById(id)
            .then(product => {
                if (product === null) {
                    throw new Error('not_found');
                }

                return this.db
                    .get('products')
                    .find({ id })
                    .assign({
                        ...update,
                        id
                    })
                    .write();
            })
            .then(() => this.getProductById(id));
    }
    getTransactions() {
        return this.db.get('transactions').value();
    }
    getProductById(id) {
        return this._getById('products', id);
    }
}

DB.defaultValue = () => ({
    transactions: [],
    products: []
});

module.exports = DB;
