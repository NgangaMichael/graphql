// mongoose models 
const Project = require('../models/Project')
const Client = require('../models/Client')
const User = require('../models/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

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

// user type 
const UserType = new GraphQLObjectType({
    name: 'user',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
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
        },

        // for users
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find()
            }
        },
        user: {
            type: UserType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return User.findById(args.id)
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

        // this deletes clients and his projects 
        deleteClient: {
            type: ClientType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            
            async resolve(parent, args) {
                try {
                    // Delete all projects associated with this client
                    await Project.deleteMany({clientId: args.id});
                    
                    // Delete the client
                    const deletedClient = await Client.findByIdAndDelete(args.id);
                    
                    return deletedClient;
                } catch (error) {
                    throw new Error(`Failed to delete client: ${error.message}`);
                }
            }
        },

        // this just deletes the clients 
        // deleteClient: {
        //     type: ClientType,
        //     args: {
        //         id: { type: GraphQLNonNull(GraphQLID) }
        //     },
        //     async resolve(parent, args) {
        //         // Delete all projects associated with the client
        //         await Project.deleteMany({ clientId: args.id });
        
        //         // Delete the client
        //         return Client.findByIdAndDelete(args.id);
        //     }
        // },        

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
                            'progress': {value: 'In Progress'},
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
                        name: 'ProjectStatusUpdate',
                        values: {
                            'new': {value: 'Not Started'},
                            'progress': {value: 'In Progress'},
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
        },

        registerUser: {
            type: UserType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args) {
                const existing = await User.findOne({ email: args.email });
                if (existing) {
                    throw new Error('User already exists');
                }

                const hashedPassword = await bcrypt.hash(args.password, 10);
                const user = new User({
                    name: args.name,
                    email: args.email,
                    password: hashedPassword,
                });

                return user.save();
            }
        },

        loginUser: {
            type: GraphQLString, // return token
            args: {
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args) {
                const user = await User.findOne({ email: args.email });
                if (!user) {
                    throw new Error('User not found');
                }

                const isValid = await bcrypt.compare(args.password, user.password);
                if (!isValid) {
                    throw new Error('Invalid credentials');
                }

                const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
                    expiresIn: '1d'
                });

                return token;
            }
        },
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})