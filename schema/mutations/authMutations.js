// schema/mutations/authMutations.js (Improved version)
const { GraphQLNonNull, GraphQLString } = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { UserType } = require('../types');

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

const authMutations = {
    registerUser: {
        type: UserType,
        args: {
            name: { type: GraphQLNonNull(GraphQLString) },
            email: { type: GraphQLNonNull(GraphQLString) },
            password: { type: GraphQLNonNull(GraphQLString) },
        },
        async resolve(parent, args) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ email: args.email.toLowerCase() });
                if (existingUser) {
                    throw new Error('User with this email already exists');
                }

                // Validate password strength (optional)
                if (args.password.length < 6) {
                    throw new Error('Password must be at least 6 characters long');
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(args.password, 12);
                
                // Create user
                const user = new User({
                    name: args.name.trim(),
                    email: args.email.toLowerCase().trim(),
                    password: hashedPassword,
                });

                const savedUser = await user.save();
                
                // Return user without password
                return {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email
                };
            } catch (error) {
                console.error('Registration error:', error);
                throw new Error(error.message || 'Failed to register user');
            }
        }
    },

    loginUser: {
        type: GraphQLString, // return token
        args: {
            email: { type: GraphQLNonNull(GraphQLString) },
            password: { type: GraphQLNonNull(GraphQLString) },
        },
        async resolve(parent, args) {
            try {
                // Find user by email (case-insensitive)
                const user = await User.findOne({ 
                    email: args.email.toLowerCase().trim() 
                });
                
                if (!user) {
                    // Don't reveal whether user exists or not for security
                    throw new Error('Invalid email or password');
                }

                // Check password
                const isValidPassword = await bcrypt.compare(args.password, user.password);
                if (!isValidPassword) {
                    throw new Error('Invalid email or password');
                }

                // Generate JWT token
                const token = jwt.sign(
                    { 
                        id: user._id, 
                        email: user.email,
                        name: user.name 
                    }, 
                    JWT_SECRET, 
                    { expiresIn: '24h' }
                );

                return token;
            } catch (error) {
                console.error('Login error:', error);
                throw new Error(error.message || 'Login failed');
            }
        }
    }
};

module.exports = authMutations;