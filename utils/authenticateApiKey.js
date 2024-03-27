const API_KEY = process.env.BEARER_TOKEN

const authenticateAPIKey = (req, res, next) => {
    const apiKey = req.headers.authorization;
  
    if (apiKey && apiKey === `Bearer ${API_KEY}`) {
      next(); 
    } else {
      res.status(401).json({ error: 'Unauthorized' }); 
    }
};