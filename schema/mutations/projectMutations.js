// schema/mutations/projectMutations.js
const { GraphQLNonNull, GraphQLString, GraphQLID, GraphQLEnumType } = require('graphql');
const Project = require('../../models/Project');
const { ProjectType } = require('../types');

// Define enum types
const ProjectStatusEnum = new GraphQLEnumType({
    name: 'ProjectStatus',
    values: {
        'new': { value: 'Not Started' },
        'progress': { value: 'In Progress' },
        'completed': { value: 'Completed' }
    }
});

const ProjectStatusUpdateEnum = new GraphQLEnumType({
    name: 'ProjectStatusUpdate',
    values: {
        'new': { value: 'Not Started' },
        'progress': { value: 'In Progress' },
        'completed': { value: 'Completed' }
    }
});

const projectMutations = {
    addProject: {
        type: ProjectType,
        args: {
            name: { type: GraphQLNonNull(GraphQLString) },
            description: { type: GraphQLNonNull(GraphQLString) },
            status: {
                type: ProjectStatusEnum,
                defaultValue: 'Not Started'
            },
            clientId: { type: GraphQLNonNull(GraphQLID) },
        },
        async resolve(parent, args) {
            const project = new Project({
                name: args.name,
                description: args.description,
                status: args.status,
                clientId: args.clientId
            });
            return await project.save();
        }
    },

    deleteProject: {
        type: ProjectType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, args) {
            return await Project.findByIdAndDelete(args.id);
        }
    },

    updateProject: {
        type: ProjectType,
        args: {
            id: { type: GraphQLNonNull(GraphQLID) },
            name: { type: GraphQLString },
            description: { type: GraphQLString },
            status: { type: ProjectStatusUpdateEnum },
        },
        async resolve(parent, args) {
            return await Project.findByIdAndUpdate(
                args.id,
                {
                    $set: {
                        name: args.name,
                        description: args.description,
                        status: args.status
                    },
                },
                { new: true }
            );
        }
    }
};

module.exports = projectMutations;