require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.EXPRESS_PORT || process.env.PORT || 5053;
const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL || 'http://localhost:5030/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'orbithealth';
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';

app.get('/', (req, res) => res.send('Auth / Express server is running'));

// POST /api/auth/register
// Expects { username, password } and inserts a new user into Hasura myUsers table
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  try {
    // Check if user already exists
    const checkQuery = `query GetUser($username: String!) {\n  myUsers(where: {username: {_eq: $username}}) { id }\n}`;
    const checkResp = await axios.post(HASURA_GRAPHQL_URL, { query: checkQuery, variables: { username } }, {
      headers: {
        'Content-Type': 'application/json',
        ...(HASURA_ADMIN_SECRET ? { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } : {})
      }
    });

    const existing = checkResp.data?.data?.myUsers;
    if (existing && existing.length) return res.status(409).json({ error: 'User already exists' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert new user
    const insertMutation = `mutation InsertUser($username: String!, $password: String!) {\n  insert_myUsers_one(object: { username: $username, password: $password }) { id username }\n}`;
    const insertResp = await axios.post(HASURA_GRAPHQL_URL, { query: insertMutation, variables: { username, password: hashed } }, {
      headers: {
        'Content-Type': 'application/json',
        ...(HASURA_ADMIN_SECRET ? { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } : {})
      }
    });

    // console.log('insertResp.data:', insertResp.data);

    const newUser = insertResp.data?.data?.insert_myUsers_one;
    if (!newUser) return res.status(500).json({ error: 'Failed to create user' });

    return res.status(201).json({ id: newUser.id, username: newUser.username });
  } catch (err) {
    console.error('Register error:', err.response?.data || err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
// Expects { username, password } and returns { token }
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  try {
    // Query Hasura for the user by username. (Don't request non-existent fields)
    const query = `query GetUser($username: String!) {\n  myUsers(where: {username: {_eq: $username}}) { id username password }\n}`;
    const variables = { username };

    const hasuraResp = await axios.post(HASURA_GRAPHQL_URL, { query, variables }, {
      headers: {
        'Content-Type': 'application/json',
        ...(HASURA_ADMIN_SECRET ? { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } : {})
      }
    });

    const users = hasuraResp.data?.data?.myUsers;
    if (!users || users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];

    // Compare hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Include Hasura claims so Hasura can authorize requests using this token
    const hasuraClaims = {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': String(user.id),
      'x-hasura-user-name': String(user.username),
    };

    const payload = {
      sub: String(user.id),
      username: user.username,
      'https://hasura.io/jwt/claims': hasuraClaims,
    };

    // Shorter-lived access token: change expiresIn to control session length
    // Example uses 1 hour; change to desired lifetime (e.g., '7d', '2h')
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30s' });

    // Set HttpOnly cookie so server-side middleware can detect authenticated users
    try {
      res.cookie('token', token, { maxAge:  30* 1000, httpOnly: true, sameSite: 'lax', path: '/' });
    } catch (e) {
      // If cookie couldn't be set for some reason, continue to return the token in body
      console.error('Failed to set cookie', e);
    }

    return res.json({ token });
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
// Clears the token cookie
app.post('/api/auth/logout', (req, res) => {
  try {
    res.setHeader('Set-Cookie', 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  } catch (e) {
    console.error('Error clearing cookie', e);
  }
  return res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Express auth server listening on http://localhost:${PORT}`));