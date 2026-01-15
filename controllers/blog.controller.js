const { db, storage, admin } = require('../config/firebase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Fetches and renders the main blog page.
 * Handles fetching the current blog, its comments, and determining the next blog ID.
 */
const getMainPage = async (req, res) => {
  const { blogId } = req.query;
  try {
    // Fetch user's name from Firestore
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userName = userDoc.exists ? userDoc.data().name : req.user.email;

    let blogsSnapshot = await db.collection('blogs').orderBy('createdAt', 'desc').get();
    let blogs = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let currentBlog;
    if (!blogId && blogs.length > 0) {
      currentBlog = blogs[0];
    } else if (blogId) {
      currentBlog = blogs.find(b => b.id === blogId);
    }

    if (!currentBlog) {
      return res.render('main', { blog: null, comments: [], nextId: null, user: req.user, userName });
    }

    // Fetch comments
    // Comments are now stored directly in the blog document as an array of objects
    let comments = currentBlog.comments || [];
    
    // If comments are stored as IDs (legacy support), we might need to fetch them, 
    // but for the new requirement, we assume they are embedded objects.
    // If we wanted to support both, we'd check if the first element is a string (ID) or object.
    // For this implementation, we'll assume the new structure or empty.
    if (comments.length > 0 && typeof comments[0] === 'string') {
       // Fallback for old data structure (array of IDs)
       let fetchedComments = [];
       for (let commentId of comments) {
         const commentDoc = await db.collection('comments').doc(commentId).get();
         if (commentDoc.exists) {
           fetchedComments.push(commentDoc.data());
         }
       }
       comments = fetchedComments;
    }

    // Find next blog ID
    const currentIndex = blogs.findIndex(b => b.id === currentBlog.id);
    const nextId = currentIndex < blogs.length - 1 ? blogs[currentIndex + 1].id : null;

    res.render('main', { blog: currentBlog, comments, nextId, user: req.user, userName });
  } catch (error) {
    console.error(error);
    res.render('main', { blog: null, comments: [], nextId: null, user: req.user, userName: req.user.email });
  }
};

/**
 * Renders the blog creation form.
 */
const createBlogForm = (req, res) => {
  res.render('create-blog', { error: null });
};

/**
 * Handles blog creation.
 * Uploads image as base64 and saves blog data to Firestore.
 */
const createBlog = [
  upload.single('image'),
  async (req, res) => {
    const { title, imageHeader, subHeaders, email, content } = req.body;
    const file = req.file;
    try {
      let imageUrl = '';
      if (file) {
        // Convert image to base64 to store in Firestore (no Firebase Storage needed)
        const base64Image = file.buffer.toString('base64');
        imageUrl = `data:${file.mimetype};base64,${base64Image}`;
      }

      const blogRef = await db.collection('blogs').add({
        title,
        imageHeader: imageHeader || '',
        subHeaders: subHeaders || '',
        email: email || '',
        content,
        imageUrl,
        likes: [],
        comments: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        userId: req.user.uid
      });

      res.redirect('/main?blogId=' + blogRef.id);
    } catch (error) {
      console.error(error);
      res.render('create-blog', { error: 'Failed to create blog.' });
    }
  }
];

/**
 * Toggles like status for a blog post.
 * Uses atomic array operations to prevent race conditions.
 */
const likeBlog = async (req, res) => {
  const { blogId } = req.body;
  try {
    const blogRef = db.collection('blogs').doc(blogId);
    const blog = await blogRef.get();

    if (blog.exists) {
      const likes = blog.data().likes || [];
      const userUid = req.user.uid;

      if (likes.includes(userUid)) {
        // Use atomic arrayRemove to prevent race conditions
        await blogRef.update({
          likes: admin.firestore.FieldValue.arrayRemove(userUid)
        });
      } else {
        // Use atomic arrayUnion to prevent race conditions
        await blogRef.update({
          likes: admin.firestore.FieldValue.arrayUnion(userUid)
        });
      }
    }
    res.redirect('/main?blogId=' + blogId);
  } catch (error) {
    console.error(error);
    res.redirect('/main?blogId=' + blogId);
  }
};

/**
 * Adds a comment to a blog post.
 * Appends the comment object directly to the blog's comments array.
 */
const addComment = async (req, res) => {
  const { blogId, comment } = req.body;
  try {
    // Create comment object with user email from JWT token
    const newComment = {
      text: comment,
      userEmail: req.user.email,
      createdAt: new Date().toISOString() // Use ISO string for embedded timestamp
    };

    const blogRef = db.collection('blogs').doc(blogId);
    
    // Atomically add the new comment object to the "comments" array
    await blogRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(newComment)
    });

    res.redirect('/main?blogId=' + blogId);
  } catch (error) {
    console.error(error);
    res.redirect('/main?blogId=' + blogId);
  }
};

/**
 * Redirects to the next blog post.
 */
const nextBlog = (req, res) => {
  const { nextId } = req.body;
  res.redirect('/main?blogId=' + nextId);
};

module.exports = { getMainPage, createBlogForm, createBlog, likeBlog, addComment, nextBlog };