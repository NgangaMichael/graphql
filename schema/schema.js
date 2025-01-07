const {projects, clients} = require('../sampleData')
// we are no longer using sample data 

// mongoose models 
const Project = require('../models/Project')
const Client = require('../models/Client')

const {GraphQLObjectType, GraphQLID,  GraphQLString, GraphQLSchema, GraphQLList} = require('graphql');

// client type 
const ClientType = new GraphQLObjectType({
    name: 'client',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        phone: {type: GraphQLString},
    })
})

// Project type 
const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: GraphQLString},
        // the way you add relationships 
        client: {
            type: ClientType,
            resolve(parent, args) {
                return Client.findById(parent.clientId)
            }
        },
    })
})

// root query object 
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // for projects 
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args) {
                return Project.find()
            }
        },
        project: {
            type: ProjectType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return Project.findById(args.id)
            }
        },

        // for clients 
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parent, args) {
                return Client.find()
            }
        },
        client: {
            type: ClientType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return Client.findById(args.id)
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
})