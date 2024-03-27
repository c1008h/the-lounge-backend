const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
  }),
  databaseURL: process.env.DATABASE_URL
});
  
const db = admin.firestore();
const realTimeDb = admin.database()

const chatSessionsRef = realTimeDb.ref("sessions")
const anonSessionRef = realTimeDb.ref('anon')

const userRef = db.collection('users')

module.exports = {
  db,
  realTimeDb,
  chatSessionsRef,
  userRef,
  anonSessionRef
};