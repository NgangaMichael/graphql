// schema/queries/index.js
const { GraphQLObjectType } = require('graphql');
const projectQueries = require('./projectQueries');
const clientQueries = require('./clientQueries');
const userQueries = require('./userQueries');

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        ...projectQueries,
        ...clientQueries,
        ...userQueries
    }
});

module.exports = RootQuery;