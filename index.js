const express = require('express')
const http = require('http');
const cors = require('cors')
const bodyParser = require('body-parser');
const setupSocket = require('./config/socketios');
const routes = require('./routes')
const { limiter } = require('./utils/rateLimit')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1); 

const corsOptions = {
  origin: process.env.WEBSITE_URL,
};

app.use(bodyParser.json());
app.use(cors(corsOptions))
app.use(limiter)
app.use((req, res, next) => {
  const referer = req.get('Referer');
  if (referer && referer.startsWith(process.env.WEBSITE_URL)) {
    next();
  } else {
    res.status(403).send('Access denied');
  }
});

// app.use('/', authenticateAPIKey, protectedRoutes); 
app.use('/', routes)

app.get('/', (req, res) => {
  res.send('Hello, this is your server!')
})

// const protectedRoutes = express.Router();
// protectedRoutes.get('/data', (req, res) => {
//   res.json({ secretData: "This is protected" }); // This route is now protected and requires a valid API key
// });

setupSocket(server);
  
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})