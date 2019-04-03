const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const MemoryPromiseAdapter = require('./memory-promise-adapter');
const DB = require('./db');




function createDB(adapter) {
    let _lowDb;
    return low(adapter)
        .then((lowDb) => {
            _lowDb = lowDb;

            return lowDb.getState();
        })
        .then((state) => {
            state.products = state.products.map((product) => {
                return {
                    image: null,
                    ...product
                }
            })

            _lowDb.setState(state);
            return _lowDb.write();
        })
        .then(() => new DB(_lowDb))
}
/**
 *  return db instance
 */
const createMemoryDB = () => createDB(new MemoryPromiseAdapter('', {defaultValue: DB.defaultValue()}));

/**
 * return Promise
 */
function createFileDB(dbPath) {
    const fileAdapter = new FileAsync(dbPath, { defaultValue: DB.defaultValue() });

    return createDB(fileAdapter)
}

module.exports = {
    createFileDB,
    createMemoryDB,
}

