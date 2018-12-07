const request = require('supertest');

describe('guards test', function() {
  before(function() {
    this.app = require('./app');
  });

  it('expect headers guard to work', async function() {
    await request(this.app)
      .get('/items/count')
      .expect(400, {
        status: 400,
        name: 'BadRequest',
        message: 'X-ID is required but missing in header'
      });
  });

  it('expect auth guard to work', async function() {
    await request(this.app)
      .get('/items/count')
      .set('x-id', '123')
      .expect(200, { id: '123' });
  });

  it('expect filter/sort/projection/pagination guard to work', async function() {
    await request(this.app)
      .get('/items')
      .set('x-id', '123')
      .query({
        w: JSON.stringify({ key: { $gt: 10 } }),
        o: JSON.stringify({ key: -1, name: 1 }),
        p: JSON.stringify(['id', 'key', 'name']),
        i: 3
      })
      .expect(200, {
        where: { key: { $gt: 10 } },
        order: { key: -1, name: 1 },
        select: ['id', 'key', 'name'],
        index: 3,
        limit: 20,
        offset: 60
      });
  });

  it('expect queries guard to work', async function() {
    await request(this.app)
      .get('/items/1')
      .set('x-id', '123')
      .expect(400, {
        name: 'BadRequest',
        status: 400,
        message: 'code is required but missing in query'
      });
    await request(this.app)
      .get('/items/1')
      .set('x-id', '123')
      .query({ code: 12345 })
      .expect(200, { id: '1', code: '12345' });
  });

  it('expect params guard to work', async function() {
    await request(this.app)
      .get('/items/abc')
      .set('x-id', '123')
      .query({ code: 12345 })
      .expect(400, {
        name: 'BadRequest',
        status: 400,
        message: 'invalid id in params'
      });
    await request(this.app)
      .get('/items/1')
      .set('x-id', '123')
      .query({ code: 12345 })
      .expect(200, { id: '1', code: '12345' });
  });

  it('expect body guard to work', async function() {
    await request(this.app)
      .post('/items')
      .set('x-id', '123')
      .expect(400, {
        name: 'BadRequest',
        status: 400,
        message: 'item name is required but missing in body'
      });
    await request(this.app)
      .post('/items')
      .set('x-id', '123')
      .send({ name: 'abc', key: '12345' })
      .expect(400, {
        name: 'BadRequest',
        status: 400,
        message: 'invalid key in body'
      });
    await request(this.app)
      .post('/items')
      .set('x-id', '123')
      .send({ name: 'abc', key: 12345 })
      .expect(400, {
        name: 'BadRequest',
        status: 400,
        message: 'type is required'
      });
    await request(this.app)
      .post('/items')
      .set('x-id', '123')
      .send({ name: 'abc', key: 12345, type: 'custom' })
      .expect(201, { name: 'abc', key: 12345 });
  });

  it('expect access guard to work', async function() {
    const crypto = require('crypto');
    const namespace = 'TEST',
      key = 'testkey',
      secret = 'testsecret';
    const msg = { name: 'xyz' };
    const signature = crypto
      .createHmac('sha1', secret)
      .update(
        'PUT' +
          crypto
            .createHash('md5')
            .update(JSON.stringify(msg))
            .digest('hex') +
          'application/json' +
          '/items/1'
      )
      .digest('base64');
    const hash = namespace + key + ':' + signature;
    await request(this.app)
      .put('/items/1')
      .set('x-id', '123')
      .set('authorization', hash)
      .send(msg)
      .expect(200, { id: '1' });
    await request(this.app)
      .put('/items/1')
      .set('x-id', '123')
      .set('authorization', hash)
      .send({ name: 'yzx' })
      .expect(401, { name: 'Unauthorized', status: 401, message: 'Unauthorized' });
  });

  it('expect env guard to work', async function() {
    await request(this.app)
      .delete('/items/1')
      .set('x-id', '123')
      .expect(403, { name: 'Forbidden', status: 403, message: 'Forbidden' });
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production_test';
    await request(this.app)
      .delete('/items/1')
      .set('x-id', '123')
      .expect(204);
    process.env.NODE_ENV = env;
  });
});
