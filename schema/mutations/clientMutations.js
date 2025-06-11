// schema/mutations/clientMutations.js
const { GraphQLNonNull, GraphQLString, GraphQLID } = require('graphql');
const Client = require('../../models/Client');
const Project = require('../../models/Project');
const { ClientType } = require('../types');

const clientMutations = {
    addClient: {
        type: ClientType,
        args: {
            name: { type: GraphQLNonNull(GraphQLString) },
            email: { type: GraphQLNonNull(GraphQLString) },
            phone: { type: GraphQLNonNull(GraphQLString) },
        },
        async resolve(parent, args) {
            const client = new Client({
                name: args.name,
                email: args.email,
                phone: args.phone
            });
            return await client.save();
        }
    },

    deleteClient: {
        type: ClientType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, args) {
            try {
                // Delete all projects associated with this client
                await Project.deleteMany({ clientId: args.id });
                
                // Delete the client
                const deletedClient = await Client.findByIdAndDelete(args.id);
                
                return deletedClient;
            } catch (error) {
                throw new Error(`Failed to delete client: ${error.message}`);
            }
        }
    }
};

module.exports = clientMutations;