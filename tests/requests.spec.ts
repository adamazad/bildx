import Path from 'path';
import Sharp from 'sharp';
import request from 'supertest';
import { BildX, BildXStorage } from '../src';

describe('BildX', () => {
  const BILDX_PORT = 5000;
  const testImageName = 'joshua-rondeau-ecScGr6Oicw-unsplash.jpg';
  const testImagePath = Path.resolve(__dirname, './storage/', testImageName);
  let bildX: BildX;
  let testImageMetadata: Sharp.Metadata;

  beforeAll(async () => {
    // Create an instance
    bildX = new BildX({
      storage: new BildXStorage(Path.resolve(__dirname, './storage')),
      cache: new BildXStorage(Path.resolve(__dirname, './cache')),
    });
    await bildX.start(BILDX_PORT);
    testImageMetadata = await Sharp(testImagePath).metadata();
  });

  afterAll(async () => {
    await bildX.stop();
  });

  describe('Original image request', () => {
    test('Should be of type image/jpeg', (done) => {
      request(bildX.server).get(`/${testImageName}`).expect('Content-Type', /image\/jpeg/, done);
    });

    test('Dimensions should match the original', async () => {
      const res = await request(bildX.server).get(`/${testImageName}`);
      // Response
      const { height, width } = await Sharp(res.body).metadata();
      // Match the dimensions
      expect(width).toEqual(testImageMetadata.width);
      expect(height).toEqual(testImageMetadata.height);
    });

    test('Dimensions should return a 200px width image', async () => {
      const res = await request(bildX.server).get(`/${testImageName}?width=200`);
      // Response
      const { width } = await Sharp(res.body).metadata();
      // Match the dimensions
      expect(width).toEqual(200);
    });
  });
});
