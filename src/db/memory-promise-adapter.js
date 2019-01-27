const Memory = require('lowdb/adapters/Base');


class MemoryPromiseAdapter extends Memory {
    read() {
        return Promise.resolve(this.defaultValue);
    }
    write() {
        return Promise.resolve();
    }
}

module.exports = MemoryPromiseAdapter;