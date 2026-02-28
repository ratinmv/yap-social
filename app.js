// Your Firebase configuration (replace with your own from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAe1x-DOMdpH-DcjwIUO1Jyo0SiRnHRNSk",
  authDomain: "yap-app-709c8.firebaseapp.com",
  projectId: "yap-app-709c8",
  storageBucket: "yap-app-709c8.firebasestorage.app",
  messagingSenderId: "619765834048",
  appId: "1:619765834048:web:0b54fb3af147b158bb9aa5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const loginForm = document.getElementById('loginForm');
const postForm = document.getElementById('postForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const postBtn = document.getElementById('postBtn');
const messageInput = document.getElementById('message');
const feedDiv = document.getElementById('feed');
const authStateDiv = document.getElementById('authState');

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    // User is logged in
    loginForm.classList.add('hidden');
    postForm.classList.remove('hidden');
    authStateDiv.innerHTML = `
      <span>Logged in as ${user.email}</span>
      <button id="logoutBtn" style="margin-left:10px; padding:4px 8px; width:auto;">Logout</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', () => auth.signOut());
    loadPosts(); // load posts from Firestore
  } else {
    // User is logged out
    loginForm.classList.remove('hidden');
    postForm.classList.add('hidden');
    authStateDiv.innerHTML = '';
    feedDiv.innerHTML = '<p style="text-align:center; color:#888;">Log in to see the chatter.</p>';
  }
});

// Sign up
signupBtn.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  auth.createUserWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
});

// Log in
loginBtn.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  auth.signInWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
});

// Post a new message
postBtn.addEventListener('click', async () => {
  const message = messageInput.value.trim();
  if (!message) return;
  const user = auth.currentUser;
  if (!user) return;

  try {
    await db.collection('posts').add({
      text: message,
      authorEmail: user.email,
      authorUid: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    messageInput.value = ''; // clear input
    loadPosts(); // refresh feed
  } catch (error) {
    alert('Error posting: ' + error.message);
  }
});

// Load and display posts
async function loadPosts() {
  try {
    const snapshot = await db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    let html = '';
    snapshot.forEach(doc => {
      const post = doc.data();
      const date = post.createdAt ? post.createdAt.toDate().toLocaleString() : 'just now';
      html += `
        <div class="post">
          <div class="post-header">
            <span class="post-author">${post.authorEmail}</span>
            <span class="post-time">${date}</span>
          </div>
          <div class="post-message">${post.text}</div>
          <div class="post-actions">
            <span>❤️ 0</span>
            <span>💬 reply</span>
          </div>
        </div>
      `;
    });
    feedDiv.innerHTML = html || '<p style="text-align:center;">No yaps yet. Be the first!</p>';
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}
