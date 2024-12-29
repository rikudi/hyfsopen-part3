const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../index')
const Person = require('../models/person')

const api = supertest(app)

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI)
})

beforeEach(async () => {
  await Person.deleteMany({})
})

test('people data can be retrieved', async () => {
  const response = await api.get('/api/persons')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body).toBeInstanceOf(Array)
})

test('a new person can be created', async () => {
  const newPerson = {
    name: 'Test User',
    number: '123-456789'
  }

  const createdPerson = await api
    .post('/api/persons')
    .send(newPerson)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(createdPerson.body.name).toBe(newPerson.name)
  expect(createdPerson.body.number).toBe(newPerson.number)
})

test('a person can be retrieved by id', async () => {
  const newPerson = new Person({ name: 'Test User', number: '123-456789' })
  const savedPerson = await newPerson.save()

  const response = await api
    .get(`/api/persons/${savedPerson.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body.name).toBe(savedPerson.name)
  expect(response.body.number).toBe(savedPerson.number)
})

test('a person can be deleted', async () => {
  const newPerson = new Person({ name: 'Test User', number: '123-456789' })
  const savedPerson = await newPerson.save()

  await api
    .delete(`/api/persons/${savedPerson.id}`)
    .expect(204)

  const response = await api.get('/api/persons')
  const persons = response.body

  expect(persons.find(p => p.id === savedPerson.id)).toBeUndefined()
})

test('an existing person can be updated', async () => {
  const newPerson = new Person({ name: 'Test User', number: '123-456789' })
  const savedPerson = await newPerson.save()

  const updatedPerson = {
    name: 'Test User',
    number: '987-654321'
  }

  await api
    .put(`/api/persons/${savedPerson.id}`)
    .send(updatedPerson)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get(`/api/persons/${savedPerson.id}`)
  expect(response.body.number).toBe(updatedPerson.number)
})

afterAll(async () => {
  await mongoose.connection.close()
})
