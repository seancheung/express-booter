const request = require('supertest');

describe('boot test', function() {
  before(function() {
    this.app = require('./app');
  });

  it('expect /users routes to work', async function() {
    await request(this.app)
      .get('/users')
      .expect(403);
  });

  it('expect /books routes to work', async function() {
    await request(this.app)
      .get('/books')
      .expect(403);
    await request(this.app)
      .get('/books/1')
      .expect(200, { id: '1' });
    await request(this.app)
      .post('/books')
      .expect(201);
    await request(this.app)
      .put('/books/2')
      .expect(200, { id: '2' });
    await request(this.app)
      .delete('/books/1')
      .expect(204);
  });
});
