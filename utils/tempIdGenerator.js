const { v4: uuidv4 } = require('uuid');

function createUniqueId() {
    return uuidv4(); 
}

module.exports = { createUniqueId }