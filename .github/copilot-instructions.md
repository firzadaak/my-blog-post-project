# Copilot Instructions for My Blog Post Project

## Architecture Overview
- **Framework**: Node.js with Express.js.
- **View Engine**: EJS (Server-side rendering).
- **Database**: Firebase Firestore.
- **Authentication**: Firebase Auth (Client SDK for login/signup, Admin SDK for token verification).
- **Storage**: Firebase Storage (via Admin SDK).

## Key Components & Patterns

### Firebase Configuration
- **File**: `config/firebase.js`
- **Pattern**: This file initializes both the Client SDK (for `auth` operations) and the Admin SDK (for `db` and `storage` access).
- **Usage**: Always import `db`, `storage`, `admin`, or `auth` from this file instead of initializing new instances.

### Authentication Flow
- **Mechanism**: Cookie-based authentication using Firebase ID tokens.
- **Middleware**: `middleware/authorize.middleware.js` verifies the `access_token` cookie using `admin.auth().verifyIdToken()`.
- **User Context**: Validated user data is available in `req.user` in controllers.

### Data Handling (Firestore)
- **Collections**: `users`, `blogs`.
- **Comments Pattern**: Comments are stored as an **embedded array of objects** within the `blogs` document, not as a separate sub-collection (though legacy code might handle IDs).
- **Fetching**: Use `db.collection('...').doc('...').get()` or `.where()` queries.

### File Uploads
- **Library**: `multer` with memory storage.
- **Flow**: Files are uploaded to memory first, then streamed/uploaded to Firebase Storage bucket using `admin.storage().bucket()`.

## Developer Workflow
- **Start Server**: `npm run dev` (runs with `nodemon`).
- **Environment**: Ensure `.env` contains all Firebase credentials (`FIREBASE_API_KEY`, `FIREBASE_PRIVATE_KEY`, etc.). Note that `FIREBASE_PRIVATE_KEY` often needs newline handling (`.replace(/\\n/g, '\n')`).

## Coding Conventions
- **Controllers**: Keep business logic in `controllers/`.
- **Routes**: Define routes in `router/` and mount them in `server.js`.
- **Views**: Use EJS templates in `views/`. Pass data (e.g., `user`, `blog`) explicitly to `res.render()`.

## Troubleshooting
- **Error: 5 NOT_FOUND**: This usually means the Firestore database hasn't been created in the Firebase Console, or the `FIREBASE_PROJECT_ID` in `.env` is incorrect. Ensure you have created a **Firestore Database** (not Realtime Database) in the Firebase Console.
