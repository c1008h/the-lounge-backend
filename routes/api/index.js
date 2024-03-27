const route = require('express').Router()
const socketRoute = require('./socketRoute')

route.use('/socket', socketRoute)

module.exports = route;