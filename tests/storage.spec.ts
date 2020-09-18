import Path from 'path';
import { promises as Fs } from 'fs';
import BildXError from '../src/BildXError';
import BildXStorage from '../src/Storage';

describe('BildX Storage', () => {
  // Absolute path
  const storagePath = Path.resolve(__dirname, './storage'); // <rootDir>/tests/storage
  // BildX instance
  const bildXStorage = new BildXStorage(storagePath);
  // Test image
  const testImageName = 'joshua-rondeau-ecScGr6Oicw-unsplash.jpg';

  test('Storage and Cache path should match', () => {
    expect(bildXStorage.storagePath).toBe(storagePath);
  });

  test('Should throw error with message Storage path must be absolute', () => {
    const createStorage = () => new BildXStorage('./storage');
    expect(createStorage).toThrowError(BildXError);
  });

  test('Should return true for files that exist', async () => {
    const fileExists = await bildXStorage.fileExists(testImageName);
    expect(fileExists).toBeTruthy();
  });

  test('Should return false ', async () => {
    const fileExists = await bildXStorage.fileExists('does-not-exists.jpg');
    expect(fileExists).toBeFalsy();
  });

  test('Should build the absolute path for the image', () => {
    expect(bildXStorage.buildFilePath(testImageName)).toBe(
      Path.resolve(storagePath, testImageName),
    );
  });

  test('Should Return an array of one element', async () => {
    expect(await bildXStorage.getFiles()).toEqual([
      testImageName,
    ]);
  });

  test('Should Return buffer of the file', async () => {
    // Read the test as buffer
    const testFileBuffer = await Fs.readFile(Path.resolve(storagePath, testImageName));
    expect(await bildXStorage.getFile(testImageName)).toEqual(testFileBuffer);
  });
});
