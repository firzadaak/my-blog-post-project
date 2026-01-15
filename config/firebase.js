require('dotenv').config();
const { initializeApp } = require('firebase/app');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} = require('firebase/auth');
const admin = require('firebase-admin');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase (Client SDK - used for auth operations)
initializeApp(firebaseConfig);

// Initialize Firebase Admin SDK (for verifying tokens and Firestore/Storage access)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();
const storage = admin.storage().bucket();  // Gets the default bucket
const auth = getAuth();

module.exports = {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  admin,
  db,
  storage
};