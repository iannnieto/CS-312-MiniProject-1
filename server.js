const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let posts = [];
let nextId = 1;
const CATEGORIES = ["Tech", "Lifestyle", "Education", "Other"];

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function formatDate(dt) {
  return new Date(dt).toLocaleString();
}

app.get('/', (req, res) => {
  const { category } = req.query;
  let filtered = posts;
  if (category && category !== 'All') {
    filtered = posts.filter(p => p.category === category);
  }
  res.render('index', { posts: filtered, categories: CATEGORIES, activeCategory: category || 'All', formatDate });
});

app.get('/posts/new', (req, res) => {
  res.render('new', { categories: CATEGORIES });
});

app.post('/posts', (req, res) => {
  const { author, title, content, category } = req.body;
  const now = new Date();
  const post = {
    id: nextId++,
    author: (author || '').trim() || 'Anonymous',
    title: (title || '').trim() || '(untitled)',
    content: (content || '').trim() || '',
    category: CATEGORIES.includes(category) ? category : 'Other',
    createdAt: now,
    updatedAt: now,
  };
  posts.unshift(post);
  res.redirect('/');
});

app.get('/posts/:id/edit', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).send('Post not found');
  res.render('edit', { post, categories: CATEGORIES });
});

app.post('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).send('Post not found');
  const { author, title, content, category } = req.body;
  post.author = (author || '').trim() || post.author;
  post.title = (title || '').trim() || post.title;
  post.content = (content || '').trim() || post.content;
  post.category = CATEGORIES.includes(category) ? category : post.category;
  post.updatedAt = new Date();
  res.redirect('/');
});

app.post('/posts/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  posts = posts.filter(p => p.id !== id);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`CS-312 blog running at http://localhost:${PORT}`);
});
