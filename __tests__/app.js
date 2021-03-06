/* global notesMock:writable */
// using globals since I don't think there's an easy way to grab a reference to the mock Notes object the app has.
const request = require('supertest');

jest.mock('../lib/notes');
// eslint-disable-next-line no-unused-vars
const Notes = require('../lib/notes');
const app = require('../app');

const NODE_ENV = process.env.NODE_ENV;

beforeEach(() => {
  notesMock = {
    shouldFind: true,
    shouldValidate: true,
    idShouldValidate: true,
    shouldSysError: false,
    shouldInitError: false,
  };
  process.env.NODE_ENV = NODE_ENV;
});

// API routes

describe('GET /api/notes', () => {
  test('should respond 200 with body containing notes array', async () => {
    const response = await request(app).get('/api/notes').expect(200);
    expect(response.body).toMatchSnapshot();
  });
  test('should respond 500 with body containing error if data fails to initialize', async () => {
    notesMock.shouldInitError = true;
    const response = await request(app).get('/api/notes').expect(500);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 500 with body containing JSONified error if anything else goes wrong outside of production environment', async () => {
    notesMock.shouldSysError = true;
    const response = await request(app).get('/api/notes/test').expect(500);
    expect(response.body).toMatchSnapshot();
  });
  test('should respond 500 with no body in production environment', async () => {
    notesMock.shouldSysError = true;
    process.env.NODE_ENV = 'production';
    const response = await request(app).get('/api/notes/test').expect(500);
    expect(response.text).toEqual('Internal Server Error');
  });
});

describe('GET /api/notes/:id', () => {
  test('should respond 200 with body containing a note if found', async () => {
    const response = await request(app).get('/api/notes/test').expect(200);
    expect(response.body).toMatchSnapshot();
  });
  test('should respond 404 if not found', async () => {
    notesMock.shouldFind = false;
    await request(app).get('/api/notes/test').expect(404);
  });
  test('should respond 500 with body containing error if invalid id matches', async () => {
    notesMock.idShouldValidate = false;
    const response = await request(app).get('/api/notes/test').expect(500);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 500 with body containing error if data fails to initialize', async () => {
    notesMock.shouldInitError = true;
    const response = await request(app).get('/api/notes').expect(500);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 500 if anything else goes wrong', async () => {
    notesMock.shouldSysError = true;
    await request(app).get('/api/notes/test').expect(500);
  });
});

describe('POST /api/notes', () => {
  test('should respond 201 with location header and body containing created note on success', async () => {
    const response = await request(app).post('/api/notes').send({test: 'test'}).expect(201);
    expect(response.header.location).toEqual('notes/0');
    expect(response.body).toEqual({test: 'test', id: 0});
  });
  test('should respond 400 with body containing validation errors if body fails validation', async () => {
    notesMock.shouldValidate = false;
    const response = await request(app).post('/api/notes').send({test: 'test'}).expect(400);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 500 with body containing error if write fails', async () => {
    notesMock.shouldSysError = true;
    const response = await request(app).post('/api/notes').send({test: 'test'}).expect(500);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 500 with body containing error if data fails to initialize', async () => {
    notesMock.shouldInitError = true;
    const response = await request(app).get('/api/notes').expect(500);
    expect(response.text).toMatchSnapshot();
  });
});

describe('PUT /api/notes/:id', () => {
  test('should respond 200 with body containing updated note on success', async () => {
    const response = await request(app).put('/api/notes/test').send({test: 'test'}).expect(200);
    expect(response.body).toEqual({test: 'test'});
  });
  test('should respond 400 with body containing validation errors if body fails validation', async () => {
    notesMock.shouldValidate = false;
    const response = await request(app).put('/api/notes/test').send({test: 'test'}).expect(400);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 404 if not found', async () => {
    notesMock.shouldFind = false;
    await request(app).put('/api/notes/test').send({test: 'test'}).expect(404);
  });
  test('should respond 500 with body containing error if invalid id matches', async () => {
    notesMock.idShouldValidate = false;
    const response = await request(app).put('/api/notes/test').send({test: 'test'}).expect(500);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 500 with body containing error if write fails', async () => {
    notesMock.shouldSysError = true;
    const response = await request(app).put('/api/notes/test').send({test: 'test'}).expect(500);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 500 with body containing error if data fails to initialize', async () => {
    notesMock.shouldInitError = true;
    const response = await request(app).get('/api/notes').expect(500);
    expect(response.text).toMatchSnapshot();
  });
});

describe('DELETE /api/notes/:id', () => {
  test('should respond 204 on success', async () => {
    await request(app).delete('/api/notes/test').expect(204);
  });
  test('should respond 404 if not found', async () => {
    notesMock.shouldFind = false;
    await request(app).delete('/api/notes/test').expect(404);
  });
  test('should respond 500 with body containing error if invalid id matches', async () => {
    notesMock.idShouldValidate = false;
    const response = await request(app).delete('/api/notes/test').expect(500);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 500 with body containing error if data fails to initialize', async () => {
    notesMock.shouldInitError = true;
    const response = await request(app).get('/api/notes').expect(500);
    expect(response.text).toMatchSnapshot();
  });
  test('should respond 500 with body containing error if write fails', async () => {
    notesMock.shouldSysError = true;
    const response = await request(app).delete('/api/notes/test').expect(500);
    expect(response.text).toMatchSnapshot();
  });
});

// HTML routes
describe('GET /', () => {
  test('should respond 200 with body containing static content', async () => {
    const response = await request(app).get('/').expect(200);
    expect(response.text).toMatchSnapshot();
  });
});
describe('GET /notes', () => {
  test('should respond 200 with body containing static content', async () => {
    const response = await request(app).get('/notes').expect(200);
    expect(response.text).toMatchSnapshot();
  });
});
describe('GET (anything else)', () => {
  test('should respond 200 with body containing static content', async () => {
    const response = await request(app)
      .get('/test/route/that/shouldnt/match/anything/but/a/wildcard/route')
      .expect(200);
    expect(response.text).toMatchSnapshot();
  });
});
