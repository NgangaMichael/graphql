// utils/auth.js (Optional: for auth utilities)
const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('../constants');

const generateToken = (payload) => {
    return jwt.sign(payload, JWT_CONFIG.SECRET, {
        expiresIn: JWT_CONFIG.EXPIRES_IN
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_CONFIG.SECRET);
};

module.exports = {
    generateToken,
    verifyToken
};