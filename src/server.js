const Hapi = require('hapi');
const {createFileDB} = require('./db');
const apiPlugins = require('./api');
const splitwisePlugin = require('./splitwise');

const server = Hapi.server({
    host: process.env.SERVER_HOST || 'localhost',
    port: process.env.SERVER_PORT || 8000
});

const dbPlugin = {
    name: 'store',
    register: async (server, options) => {
        return createFileDB(process.env.DB_PATH || 'db.json')
            .then((db) => {
                // TODO: rename store --> db
                server.expose('store', db)
            })
    }
}

async function start() {
    try {
        await server.register([
            splitwisePlugin,
            dbPlugin,
            ...apiPlugins,
        ])

        await server.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

module.exports = {
    start
};