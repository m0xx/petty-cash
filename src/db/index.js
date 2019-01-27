const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const MemoryPromiseAdapter = require('./memory-promise-adapter');
const DB = require('./db');

function createDB(adapter) {
    return low(adapter)
        .then((lowDb) => new DB(lowDb))
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

