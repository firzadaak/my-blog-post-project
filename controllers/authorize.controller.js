const { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('../config/firebase');
const { db, admin } = require('../config/firebase');

/**
 * Handles user registration.
 * Validates input, creates user in Firebase Auth, and saves user details in Firestore.
 */
const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Server-side validation
  if (!name || name.trim() === '') {
    return res.render('authentication', { error: 'Name is required.', showSignup: true });
  }
  if (!email || email.trim() === '') {
    return res.render('authentication', { error: 'Email is required.', showSignup: true });
  }
  if (!password || password.trim() === '') {
    return res.render('authentication', { error: 'Password is required.', showSignup: true });
  }
  if (password !== confirmPassword) {
    return res.render('authentication', { error: 'Passwords do not match.', showSignup: true });
  }
  if (password.length < 6) {
    return res.render('authentication', { error: 'Password must be at least 6 characters.', showSignup: true });
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user name to Firestore
    await db.collection('users').doc(user.uid).set({
      name: name.trim(),
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const idToken = await user.getIdToken();
    res.cookie('access_token', idToken, { httpOnly: true, secure: false }); // secure: true in production with HTTPS
    res.redirect('/main');
  } catch (error) {
    let errorMsg = 'Registration failed. Try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMsg = 'This email is already registered.';
    } else if (error.code === 'auth/weak-password') {
      errorMsg = 'Password is too weak.';
    }
    res.render('authentication', { error: errorMsg, showSignup: true });
  }
};

/**
 * Handles user login.
 * Authenticates with Firebase Auth and sets a session cookie.
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    res.cookie('access_token', idToken, { httpOnly: true, secure: false });
    res.redirect('/main');
  } catch (error) {
    res.render('authentication', { 
      error: 'Invalid email or password.', 
      showSignup: false 
    });
  }
};

/**
 * Handles user logout.
 * Clears the session cookie.
 */
const logout = async (req, res) => {
  res.clearCookie('access_token');
  res.redirect('/auth');
};

module.exports = { register, login, logout };