const Boom = require('boom');

const getUsers = {
    method: 'GET',
    path: '/users',
    handler: (request, h) => {
        const { splitwise } = request.server.plugins.splitwise;

        return splitwise.getUsers();
    }
};

const getUserById = {
    method: 'GET',
    path: '/users/{userId}',
    handler: (request, h) => {
        const {params: { userId }} = request;
        const { splitwise } = request.server.plugins.splitwise;

        return splitwise.getUserById(userId).then(user => (user === null ? Boom.notFound() : user));
    }
};

module.exports = {
    name: 'users',
    register: function(server, options) {
        server.route([getUsers, getUserById]);
    }
};
