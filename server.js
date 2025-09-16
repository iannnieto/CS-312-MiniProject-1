// CS-312 MiniProject 1 – Blog App
// Simple blog using Express + EJS with posts stored in memory.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Store posts in memory (no database)
let posts = [];
let nextPostId = 1;
const POST_CATEGORIES = ['Tech', 'Lifestyle', 'Education', 'Other'];

// Middleware and view setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helpers
function formatTimestamp(value) {
  return new Date(value).toLocaleString();
}
function createPost({ author, title, content, category }) {
  const now = Date.now();
  return {
    id: nextPostId++,
    author: author?.trim() || 'Anonymous',
    title: title?.trim() || '(untitled)',
    content: content?.trim() || '',
    category: POST_CATEGORIES.includes(category) ? category : 'Other',
    createdAt: now,
    updatedAt: now,
  };
}
function findPost(id) {
  return posts.find(p => p.id === Number(id));
}

// Routes
app.get('/', (req, res) => {
  const activeCategory = req.query.category || 'All';
  const visiblePosts =
    activeCategory === 'All'
      ? posts
      : posts.filter(p => p.category === activeCategory);

  res.render('index', {
    posts: visiblePosts,
    categories: POST_CATEGORIES,
    activeCategory,
    formatTimestamp,
  });
});

app.get('/posts/new', (req, res) => {
  res.render('new', { categories: POST_CATEGORIES });
});

app.post('/posts', (req, res) => {
  const newPost = createPost(req.body);
  posts.unshift(newPost);
  res.redirect('/');
});

app.get('/posts/:id/edit', (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return res.status(404).send('Post not found');
  res.render('edit', { post, categories: POST_CATEGORIES });
});

app.post('/posts/:id', (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return res.status(404).send('Post not found');

  const { author, title, content, category } = req.body;
  post.author = author?.trim() || post.author;
  post.title = title?.trim() || post.title;
  post.content = content?.trim() || post.content;
  post.category = POST_CATEGORIES.includes(category)
    ? category
    : post.category;
  post.updatedAt = Date.now();

  res.redirect('/');
});

app.post('/posts/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  posts = posts.filter(p => p.id !== id);
  res.redirect('/');
});

// Start server
app.listen(PORT, () => {
  console.log(`Blog running at http://localhost:${PORT}`);
});
