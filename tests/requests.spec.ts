import Path from 'path';
import Sharp from 'sharp';
import request from 'supertest';
import { BildX, BildXStorage } from '../src';
// Helpers
import { assertSimilar, images } from './helpers';

describe('BildX', () => {
  const BILDX_PORT = 5000;
  let bildX: BildX;

  beforeAll(async () => {
    // Create an instance
    bildX = new BildX({
      storage: new BildXStorage(Path.resolve(__dirname, './storage')),
      cache: new BildXStorage(Path.resolve(__dirname, './cache')),
    });
    await bildX.start(BILDX_PORT);
  });

  afterAll(async () => {
    await bildX.stop();
  });

  describe('Original image request', () => {
    test('Should be of type image/jpeg', (done) => {
      request(bildX.server).get(`/${images.stockholm.name}`).expect('Content-Type', /image\/jpeg/, done);
    });

    test('Dimensions should match the original', async () => {
      const res = await request(bildX.server).get(`/${images.stockholm.name}`);
      // Response
      const expected = await Sharp(images.stockholm.path).metadata();
      const actual = await Sharp(res.body).metadata();
      // Match the dimensions
      expect(actual.width).toEqual(expected.width);
      expect(actual.height).toEqual(expected.height);
    });

    test('Dimensions should return a 200px width image', async () => {
      const expectedWidth = 200;
      const res = await request(bildX.server).get(`/${images.stockholm.name}?width=${expectedWidth}`);
      // Response
      const { width } = await Sharp(res.body).metadata();
      // Match the dimensions
      expect(width).toEqual(expectedWidth);
    });
    });
  });
});
