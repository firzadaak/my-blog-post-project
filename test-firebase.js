require('dotenv').config();
const admin = require('firebase-admin');

console.log('Checking Firebase Config...');
console.log(`Project ID: '${process.env.FIREBASE_PROJECT_ID}' (Length: ${process.env.FIREBASE_PROJECT_ID.length})`);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('Private Key Length:', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 'MISSING');

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
  console.log('Firebase Admin Initialized.');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

async function testConnection() {
  try {
    console.log('Attempting to list collections...');
    const collections = await db.listCollections();
    console.log('Collections found:', collections.map(c => c.id));
    console.log('Connection successful!');
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
