require('./setup');
const request = require('supertest');
const app = require('../server');

describe('Contacts API', () => {
  let accessToken;

  beforeEach(async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' });
    accessToken = signupRes.body.data.accessToken;
  });

  const contactData = {
    name: 'John Smith',
    email: 'john@company.com',
    phone: '+1-555-123-4567',
    company: 'Acme Inc',
    status: 'Lead',
    notes: 'Met at conference',
  };

  test('POST /api/contacts creates a contact', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(contactData);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe(contactData.name);
  });

  test('POST /api/contacts rejects request without auth token', async () => {
    const res = await request(app).post('/api/contacts').send(contactData);
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/contacts rejects invalid status', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...contactData, status: 'InvalidStatus' });
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/contacts returns paginated list', async () => {
    for (let i = 0; i < 15; i++) {
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...contactData, email: `john${i}@company.com` });
    }
    const res = await request(app)
      .get('/api/contacts?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(10);
    expect(res.body.pagination.total).toBe(15);
    expect(res.body.pagination.pages).toBe(2);
  });

  test('GET /api/contacts?search filters by name/email', async () => {
    await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(contactData);
    await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...contactData, name: 'Alice Brown', email: 'alice@company.com' });

    const res = await request(app)
      .get('/api/contacts?search=alice')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Alice Brown');
  });

  test('PUT /api/contacts/:id updates a contact and logs activity', async () => {
    const createRes = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(contactData);
    const id = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/contacts/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'Customer' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('Customer');

    const logsRes = await request(app)
      .get('/api/activity-logs')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(logsRes.body.data.some((l) => l.action === 'UPDATE_CONTACT')).toBe(true);
  });

  test('DELETE /api/contacts/:id removes a contact', async () => {
    const createRes = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(contactData);
    const id = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/contacts/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);

    const getRes = await request(app)
      .get(`/api/contacts/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(getRes.statusCode).toBe(404);
  });

  test('GET /api/contacts only returns the owner\'s contacts', async () => {
    await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(contactData);

    const otherUser = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Other User', email: 'other@example.com', password: 'password123' });
    const otherToken = otherUser.body.data.accessToken;

    const res = await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.body.data.length).toBe(0);
  });
});
