const route = require('express').Router();
const apiRoutes = require('./api')

route.use('/api', apiRoutes)

module.exports = route;