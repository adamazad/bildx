import BildXError from '../src/BildXError';

describe('BildX Error', () => {
  test('Thrown error should instance of BildXError', async () => {
    expect(() => {
      throw new BildXError('BildXError');
    }).toThrowError(BildXError);
  });
});
