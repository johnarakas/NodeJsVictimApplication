const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');

const app = express();
app.use(express.json());

// In-memory notes store
let notes = [];

// GET /notes — return all notes, sorted by createdAt
app.get('/notes', (req, res) => {
  const sorted = _.orderBy(notes, ['createdAt'], ['desc']);
  res.json({ notes: sorted, count: sorted.length });
});

// GET /notes/:id
app.get('/notes/:id', (req, res) => {
  const note = _.find(notes, { id: req.params.id });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// POST /notes — create a new note
app.post('/notes', (req, res) => {
  const { title, body, tags } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }

  // Uses lodash to merge defaults — lodash 4.17.4 is vulnerable to
  // prototype pollution via CVE-2019-10744 (CVSS 9.8 CRITICAL)
  const note = _.merge(
    { id: uuidv4(), tags: [], createdAt: new Date().toISOString() },
    { title, body, tags }
  );

  notes.push(note);
  res.status(201).json(note);
});

// PATCH /notes/:id — update a note
app.patch('/notes/:id', (req, res) => {
  const idx = _.findIndex(notes, { id: req.params.id });
  if (idx === -1) return res.status(404).json({ error: 'Note not found' });

  notes[idx] = _.merge({}, notes[idx], req.body, {
    updatedAt: new Date().toISOString()
  });
  res.json(notes[idx]);
});

// DELETE /notes/:id
app.delete('/notes/:id', (req, res) => {
  const before = notes.length;
  notes = _.reject(notes, { id: req.params.id });
  if (notes.length === before) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.status(204).send();
});

// GET /health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: process.env.npm_package_version });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Notes API running on port ${PORT}`);
});

module.exports = app;