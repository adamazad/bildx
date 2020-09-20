// Source: https://github.com/lovell/sharp/blob/master/test/fixtures/index.js
import Path from 'path';
import Sharp from 'sharp';

/**
 * Generates a 64-bit-as-binary-string image fingerprint
 * Based on the dHash gradient method - see http://www.hackerfactor.com/blog/index.php?/archives/529-Kind-of-Like-That.html
 * @param {string|Buffer} image Image to calculate its fingerprint
 * @returns {Promise<boolean>} The fingerprint
 */
export async function fingerprint(image: string | Buffer): Promise<string> {
  const sharpImg = Sharp(image);

  sharpImg.flatten()
    .greyscale()
    .normalise()
    .resize(9, 8, {
      fit: Sharp.fit.fill,
    })
    .raw();

  const data = await sharpImg.toBuffer();

  let output = '';
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 8; row++) {
      const left = data[(row * 8) + col];
      const right = data[(row * 8) + col + 1];
      output += (left < right ? '1' : '0');
    }
  }

  return output;
}

type SimilarityOptions = {
  threshold: number,
};

const defaultOptions: SimilarityOptions = {
  threshold: 5, // ~7%
};

/**
 * Verify similarity of expected vs actual images via fingerprint
 * Specify distance threshold using `options={threshold: 42}`, default `threshold` is 5;
 * @param {string | Buffer} expectedImage
 * @param {string | Buffer} actualImage
 * @returns {Promise<boolean>}
 * @throws An error if the match threshold is larger than provided
 */
export async function assertSimilar(
  expectedImage: string | Buffer,
  actualImage: string | Buffer,
  options: SimilarityOptions | undefined = defaultOptions,
) {
  // Calcualte fingerprints for both images
  const expectedFingerprint = await fingerprint(expectedImage);
  const actualFingerprint = await fingerprint(actualImage);

  let distance = 0;
  for (let i = 0; i < 64; i++) {
    if (expectedFingerprint[i] !== actualFingerprint[i]) {
      distance++;
    }
  }

  if (distance > options.threshold) {
    throw new Error(`Expected maximum similarity distance: ${options.threshold}. Actual: ${distance}.`);
  }

  return true;
}

// Credits to Jon Flobrant and Joshua Rondeau on Unsplash
export const images = {
  stockholm: {
    path: Path.resolve(__dirname, './storage/', 'jon-flobrant-jxfe3orC4G8-unsplash.jpg'),
    name: 'jon-flobrant-jxfe3orC4G8-unsplash.jpg',
  },
  santorini: {
    path: Path.resolve(__dirname, './storage/', 'joshua-rondeau-ecScGr6Oicw-unsplash.jpg'),
    name: 'joshua-rondeau-ecScGr6Oicw-unsplash.jpg',
  }
  ,
};

export default {
  fingerprint,
  assertSimilar,
  images,
};
