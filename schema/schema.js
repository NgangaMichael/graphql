const {projects, clients} = require('../sampleData')
// we are no longer using sample data 

// mongoose models 
const Project = require('../models/Project')
const Client = require('../models/Client')

const {
    GraphQLObjectType, 
    GraphQLID,  
    GraphQLString, 
    GraphQLSchema, 
    GraphQLList, 
    GraphQLNonNull,
    GraphQLEnumType
} = require('graphql');

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

// mutations 
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {

        // for adding client to db 
        addClient: {
            type: ClientType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args) {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone
                });
                return client.save();
            }
        },

        // for deleting client from db 
        deleteClient: {
            type: ClientType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                return Client.findByIdAndDelete(args.id);
            }
        },

        // adding project to db 
        addProject: {
            type: ProjectType,
            args : {
                name: {type: GraphQLNonNull(GraphQLString)},
                description: {type: GraphQLNonNull(GraphQLString)},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            'new': {value: 'Not Started'},
                            'Progress': {value: 'In Progress'},
                            'completed': {value: 'Completed'}
                        }
                    }),
                    defaultValue: 'Not Started'
                },
                clientId: {type: GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                });
                return project.save()
            }
        },

        // deleting project from db 
        deleteProject: {
            type: ProjectType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                return Project.findByIdAndDelete(args.id)
            }
        },

        // update project 
        updateProject: {
            type: ProjectType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)},
                name: {type: GraphQLString},
                description: {type: GraphQLString},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdated',
                        values: {
                            'new': {value: 'Not Started'},
                            'Progress': {value: 'In Progress'},
                            'completed': {value: 'Completed'}
                        }
                    }),
                },
            },
            resolve(parent, args) {
                return Project.findByIdAndUpdate(
                    args.id, 
                    {
                        $set: {
                            name: args.name,
                            description: args.description,
                            status: args.status
                        },
                    },
                    {new: true}
                )
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})