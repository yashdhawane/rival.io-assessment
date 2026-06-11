import request from 'supertest'
import app from '../app'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Backend API Tests', () => {
  // Clean up database before each test
  beforeEach(async () => {
    await prisma.activity.deleteMany()
    await prisma.attachment.deleteMany()
    await prisma.task.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Authentication Flow', () => {
    it('should signup a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      }

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.user.password).toBeUndefined() // Password should not be returned
    })

    it('should login with valid credentials', async () => {
      // First signup
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      }
      await request(app)
        .post('/api/auth/signup')
        .send(userData)

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.headers['set-cookie']).toBeDefined() // Cookie should be set
    })

    it('should fail login with invalid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      }
      await request(app)
        .post('/api/auth/signup')
        .send(userData)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('LOGIN_ERROR')
    })
  })

  describe('Task CRUD Operations', () => {
    let authToken: string

    beforeEach(async () => {
      // Create a test user and get auth token
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      }
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(userData)

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(userData)

      authToken = loginResponse.headers['set-cookie'][0]
    })

    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium'
      }

      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', authToken)
        .send(taskData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe(taskData.title)
      expect(response.body.data.description).toBe(taskData.description)
      expect(response.body.data.status).toBe(taskData.status)
    })

    it('should get all tasks for authenticated user', async () => {
      // Create multiple tasks
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium'
      }
      await request(app)
        .post('/api/tasks')
        .set('Cookie', authToken)
        .send(taskData)
      
      await request(app)
        .post('/api/tasks')
        .set('Cookie', authToken)
        .send({ ...taskData, title: 'Test Task 2' })

      const response = await request(app)
        .get('/api/tasks')
        .set('Cookie', authToken)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.tasks).toHaveLength(2)
    }, 10000)

    it('should update a task', async () => {
      // Create a task first
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium'
      }
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Cookie', authToken)
        .send(taskData)

      const taskId = createResponse.body.data.id

      // Update the task
      const updateData = {
        title: 'Updated Task',
        status: 'completed'
      }
      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Cookie', authToken)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe(updateData.title)
      expect(response.body.data.status).toBe(updateData.status)
    }, 10000)

    it('should delete a task', async () => {
      // Create a task first
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium'
      }
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Cookie', authToken)
        .send(taskData)

      const taskId = createResponse.body.data.id

      // Delete the task
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Cookie', authToken)
        .expect(200)

      // Verify task is deleted
      const getResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', authToken)
        .expect(404)

      expect(getResponse.body.success).toBe(false)
    })
  })

  describe('Cloudinary Upload Signature', () => {
    let authToken: string
    let taskId: string

    beforeEach(async () => {
      // Create a test user and get auth token
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      }
      await request(app)
        .post('/api/auth/signup')
        .send(userData)

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(userData)

      authToken = loginResponse.headers['set-cookie'][0]

      // Create a task
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium'
      }
      const taskResponse = await request(app)
        .post('/api/tasks')
        .set('Cookie', authToken)
        .send(taskData)

      taskId = taskResponse.body.data.id
    })

    it('should generate upload signature for valid file', async () => {
      const fileData = {
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 1024 // 1MB
      }

      const response = await request(app)
        .post(`/api/attachments/tasks/${taskId}/attachments/signature`)
        .set('Cookie', authToken)
        .send(fileData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.signature).toBeDefined()
      expect(response.body.data.timestamp).toBeDefined()
      expect(response.body.data.cloudName).toBeDefined()
      expect(response.body.data.apiKey).toBeDefined()
      expect(response.body.data.publicId).toBeDefined()
    })

    it('should reject file with invalid MIME type', async () => {
      const fileData = {
        filename: 'test.exe',
        mimeType: 'application/x-msdownload',
        size: 1024 * 1024
      }

      const response = await request(app)
        .post(`/api/attachments/tasks/${taskId}/attachments/signature`)
        .set('Cookie', authToken)
        .send(fileData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_FILE')
    })

    it('should reject file exceeding size limit', async () => {
      const fileData = {
        filename: 'large.pdf',
        mimeType: 'application/pdf',
        size: 20 * 1024 * 1024 // 20MB (exceeds 10MB limit)
      }

      const response = await request(app)
        .post(`/api/attachments/tasks/${taskId}/attachments/signature`)
        .set('Cookie', authToken)
        .send(fileData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_FILE')
    })

    it('should save attachment metadata after successful upload', async () => {
      const metadata = {
        filename: 'test_1234567890',
        originalName: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 1024,
        url: 'https://cloudinary.com/test.pdf',
        publicId: 'test_1234567890'
      }

      const response = await request(app)
        .post(`/api/attachments/tasks/${taskId}/attachments/metadata`)
        .set('Cookie', authToken)
        .send(metadata)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.filename).toBe(metadata.filename)
      expect(response.body.data.originalName).toBe(metadata.originalName)
      expect(response.body.data.url).toBe(metadata.url)

      // Verify activity was logged
      const activities = await prisma.activity.findMany({
        where: { taskId }
      })
      expect(activities.length).toBeGreaterThanOrEqual(1)
      const attachmentActivity = activities.find(a => a.action === 'attachment_added')
      expect(attachmentActivity).toBeDefined()
    })
  })
})
