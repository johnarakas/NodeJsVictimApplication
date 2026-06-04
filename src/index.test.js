const request = require('supertest');
const app = require('../src/index');

describe('Notes API', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /notes returns empty array initially', async () => {
    const res = await request(app).get('/notes');
    expect(res.statusCode).toBe(200);
    expect(res.body.notes).toEqual([]);
  });

  it('POST /notes creates a note', async () => {
    const res = await request(app)
      .post('/notes')
      .send({ title: 'Test Note', body: 'Hello world', tags: ['test'] });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Test Note');
  });

  it('POST /notes returns 400 if title missing', async () => {
    const res = await request(app)
      .post('/notes')
      .send({ body: 'No title' });
    expect(res.statusCode).toBe(400);
  });
});