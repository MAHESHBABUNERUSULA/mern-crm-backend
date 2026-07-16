require('./setup');
const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  const userData = { name: 'Jane Doe', email: 'jane@example.com', password: 'password123' };

  test('POST /api/auth/signup creates a new user and returns tokens', async () => {
    const res = await request(app).post('/api/auth/signup').send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(userData.email);
  });

  test('POST /api/auth/signup rejects duplicate email', async () => {
    await request(app).post('/api/auth/signup').send(userData);
    const res = await request(app).post('/api/auth/signup').send(userData);
    expect(res.statusCode).toBe(409);
  });

  test('POST /api/auth/signup rejects invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'A', email: 'not-an-email', password: '123' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/login succeeds with correct credentials', async () => {
    await request(app).post('/api/auth/signup').send(userData);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('POST /api/auth/login fails with wrong password', async () => {
    await request(app).post('/api/auth/signup').send(userData);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me requires a valid token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/auth/refresh returns new tokens', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(userData);
    const { refreshToken } = signupRes.body.data;
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
