const express = require('express')
const http = require('http');
const cors = require('cors')
const bodyParser = require('body-parser');
const setupSocket = require('./config/socketios');
const routes = require('./routes')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.BEARER_TOKEN

const authenticateAPIKey = (req, res, next) => {
    const apiKey = req.headers.authorization;
  
    if (apiKey && apiKey === `Bearer ${API_KEY}`) {
      next(); 
    } else {
      res.status(401).json({ error: 'Unauthorized' }); 
    }
};

app.use(bodyParser.json());
app.use(cors())
app.use(authenticateAPIKey); 
app.use('/', routes)

app.get('/', (req, res) => {
    res.send('Hello, this is your server!')
})

setupSocket(server);
  
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})