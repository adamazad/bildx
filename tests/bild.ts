import Path from 'path';
import Sharp from 'sharp';
import request from 'supertest';
import { BildX, BildXStorage } from '../src';

describe('BildX', () => {
  const BILDX_PORT = 5000;
  const testImageName = 'joshua-rondeau-ecScGr6Oicw-unsplash.jpg';
  const testImagePath = Path.resolve(__dirname, './storage/', testImageName);
  let bildX: BildX;

  beforeAll(() => {
    // Create an instance
    bildX = new BildX({
      storage: new BildXStorage(Path.resolve(__dirname, './storage')),
      cache: new BildXStorage(Path.resolve(__dirname, './cache')),
    });
  });

  afterAll(async () => {
    await bildX.stop();
  });

  test('BildX.storage and BildX.cache should be of type BildXStorage', () => {
    expect(bildX.storage).toBeInstanceOf(BildXStorage);
    expect(bildX.cache).toBeInstanceOf(BildXStorage);
  });

  test(`BildX.start should start listening on ${BILDX_PORT}`, () => {
    expect(bildX.start(BILDX_PORT)).resolves.toBeCalled();
  });

  describe('Original image request', () => {
    test('Dimensions should match the original', async () => {
      const res = await request(bildX.http).get(`/${testImageName}`);
      // Original file
      const testImageMetadata = await Sharp(testImagePath).metadata();
      // Response
      const { height, width } = await Sharp(res.body).metadata();
      // Match the dimensions
      expect(width).toEqual(testImageMetadata.width);
      expect(height).toEqual(testImageMetadata.height);
    });
  });
});
