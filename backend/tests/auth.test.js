const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/database');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Mock data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'student',
  loginId: 'testuser',
  rollNumber: 'TEST101',
  department: 'Computer Science',
  year: '1st Year',
  semester: '1st Semester',
  program: 'B.Tech',
  isEmailVerified: true,
  isActive: true
};

// Setup and teardown
beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate();
  
  // Sync database (force: true will drop tables and recreate them)
  await sequelize.sync({ force: true });
  
  // Create test user
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  await User.create({
    ...testUser,
    password: hashedPassword
  });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

// Tests
describe('Auth Controller', () => {
  let token;
  
  describe('POST /api/auth/login', () => {
    it('should login user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          loginId: testUser.loginId,
          password: testUser.password
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.message).toEqual('Login successful');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toEqual(testUser.email);
      
      // Save token for later tests
      token = res.body.data.token;
    });
    
    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          loginId: testUser.loginId,
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toEqual('Invalid credentials');
    });
  });
  
  describe('GET /api/auth/me', () => {
    it('should return current user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toEqual(testUser.email);
    });
    
    it('should return 401 for missing token', async () => {
      const res = await request(app)
        .get('/api/auth/me');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toEqual('Not authorized to access this route');
    });
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'student',
        loginId: 'newuser',
        rollNumber: 'NEW101',
        department: 'Computer Science',
        year: '1st Year',
        semester: '1st Semester',
        program: 'B.Tech'
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toEqual(true);
      expect(res.body.message).toEqual('User registered successfully. Please verify your email.');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toEqual(newUser.email);
    });
    
    it('should return 400 for existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: testUser.email, // Using existing email
          password: 'password123',
          role: 'student',
          loginId: 'duplicateuser',
          rollNumber: 'DUP101',
          department: 'Computer Science',
          year: '1st Year',
          semester: '1st Semester',
          program: 'B.Tech'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toEqual('Email already exists');
    });
  });
});

