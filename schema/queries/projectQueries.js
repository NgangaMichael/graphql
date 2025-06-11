// schema/queries/projectQueries.js
const { GraphQLList, GraphQLID } = require('graphql');
const Project = require('../../models/Project');
const { ProjectType } = require('../types');

const projectQueries = {
    projects: {
        type: new GraphQLList(ProjectType),
        resolve() {
            return Project.find();
        }
    },
    project: {
        type: ProjectType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
            return Project.findById(args.id);
        }
    }
};

module.exports = projectQueries;