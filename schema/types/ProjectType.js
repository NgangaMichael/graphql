// schema/types/ProjectType.js
const { GraphQLObjectType, GraphQLID, GraphQLString } = require('graphql');
const Client = require('../../models/Client');
const ClientType = require('./ClientType');

const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientType,
            resolve(parent, args) {
                return Client.findById(parent.clientId);
            }
        },
    })
});

module.exports = ProjectType;