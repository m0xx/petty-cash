const test = require('tape');
const {createMemoryDB} = require('./');

test('should create product', function(t) {
    createMemoryDB()
        .then((db) => {
            return db.createProduct({
                name: 'Beer',
                description: 'Good and cheap beer!',
                price: 2.0
            })
        })
        .then(product => {
            t.ok(product, 'product is created');
            t.ok(product.id);
            t.equal(product.name, 'Beer');
            t.equal(product.description, 'Good and cheap beer!');
            t.equal(product.price, 2.0);
            t.equal(product.quantity, 0);

            t.end();
        })
        .catch((err) => {
            console.log(err);
        })
});

test('should create transaction', function(t) {
    createMemoryDB()
        .then((db) => {
            return db.createTransaction({
                type: 'consume-product',
                data: {
                    userId: '123'
                }
            })
        })
        .then(transaction => {
            t.ok(transaction, 'transaction is created');
            t.ok(transaction.id);
            t.equal(transaction.type, 'consume-product');
            t.equal(transaction.data.userId, '123');
            t.ok(transaction.createdAt);

            t.end();
        });
});

test('should update product', function(t) {

    let db;
    createMemoryDB()
        .then((_db) => {
            db = _db;
            return db.createProduct({
                name: 'Beer',
                description: 'Good and cheap beer!',
                price: 2.0
            })
        })
        .then((product) => {
            return db.updateProduct(product.id, {
                quantity: 2,
                price: 4.00
            })
        })
        .then((product) => {
            t.ok(product, 'product is updated');
            t.equal(product.quantity, 2);
            t.equal(product.price, 4.0);

            t.end();
        })
});
