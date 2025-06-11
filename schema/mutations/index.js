// schema/mutations/index.js
const { GraphQLObjectType } = require('graphql');
const projectMutations = require('./projectMutations');
const clientMutations = require('./clientMutations');
const authMutations = require('./authMutations');

const RootMutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...projectMutations,
        ...clientMutations,
        ...authMutations
    }
});

module.exports = RootMutation;