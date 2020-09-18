import Path from 'path';
import { BildX, BildXStorage } from '../src';

describe('BildX', () => {
  const BILDX_PORT = 5000;
  // const testImagePath = Path.resolve(__dirname, './storage/', testImageName);
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
});
