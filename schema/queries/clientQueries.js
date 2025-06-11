// schema/queries/clientQueries.js
const { GraphQLList, GraphQLID } = require('graphql');
const Client = require('../../models/Client');
const { ClientType } = require('../types');

const clientQueries = {
    clients: {
        type: new GraphQLList(ClientType),
        resolve() {
            return Client.find();
        }
    },
    client: {
        type: ClientType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
            return Client.findById(args.id);
        }
    }
};

module.exports = clientQueries;