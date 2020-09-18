import Fs from 'fs';
import Path from 'path';
import Sharp from 'sharp';
import request from 'supertest';
import { BildX, BildXStorage } from '../src';

describe('BildX', () => {
  // Create empty cache dir
  const CACHE_TEMP_DIR = Path.resolve(__dirname, Fs.mkdtempSync('./tests/cache-'));

  const BILDX_PORT = 5000;
  const testImageName = 'joshua-rondeau-ecScGr6Oicw-unsplash.jpg';
  const testImagePath = Path.resolve(__dirname, './storage/', testImageName);

  // Create an instance
  const bildX = new BildX({
    storage: new BildXStorage(Path.resolve(__dirname, './storage')),
    cache: new BildXStorage(CACHE_TEMP_DIR),
  });

  test('BildX.storage and BildX.cache should be of type BildXStorage', () => {
    expect(bildX.storage).toBeInstanceOf(BildXStorage);
    expect(bildX.cache).toBeInstanceOf(BildXStorage);
  });

  test(`BildX.start should start listening on ${BILDX_PORT}`, () => {
    expect(bildX.start(BILDX_PORT)).resolves.toBeCalled();
  });

  describe('Original image request', () => {
    test('Should be of type image/jpeg', async () => {
      const res = await request(bildX.http).get(`/${testImageName}`);
      expect(res.type).toBe('image/jpeg');
    });

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
