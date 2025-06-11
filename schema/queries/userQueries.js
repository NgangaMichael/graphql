// schema/queries/userQueries.js
const { GraphQLList, GraphQLID } = require('graphql');
const User = require('../../models/User');
const { UserType } = require('../types');

const userQueries = {
    users: {
        type: new GraphQLList(UserType),
        resolve() {
            return User.find();
        }
    },
    user: {
        type: UserType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
            return User.findById(args.id);
        }
    }
};

module.exports = userQueries;