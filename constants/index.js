// constants/index.js (Optional: for shared constants)
const JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || 'yoursecretkey',
    EXPIRES_IN: '1d'
};

const PROJECT_STATUS = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed'
};

module.exports = {
    JWT_CONFIG,
    PROJECT_STATUS
};