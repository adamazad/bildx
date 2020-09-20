import Mime from 'mime';
import Path from 'path';
import { Server } from 'http';
import hash from 'object-hash';
import SharpEngine, { Sharp } from 'sharp';
import HttpExpress, { Express, Request, Response } from 'express';
// Locals
import BildXStorage from './Storage';
import BildXError from './BildXError';

interface BildRequest extends Request {
  bildHash?: string;
}

interface BildX {
  http: Express;
  storage: BildXStorage;
  cache: BildXStorage;
  bildEngine: Sharp;
  bildExists(bildId: string): Promise<boolean>;
  start(port: number): Promise<void | undefined>;
  stop(): Promise<void | undefined>;
}

type BildXConfig = {
  // Where original objects are stored
  storage: BildXStorage;
  cache: BildXStorage;
}

type BildXBildOptions = {
  width?: Number | string | undefined;
  height?: Number | string | undefined;
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside' | undefined;
  blur?: number | boolean | string | undefined;
}

class BildX implements BildX {
  // HTTP client to serve file
  http: Express;

  // Interface to access storage manager for BildX
  storage: BildXStorage;

  // Cache interface: default is redis
  cache: BildXStorage;

  server: Server;

  /**
   * Creates an BildX instance
   * @param {BildXConfig} options
   */
  constructor(options: BildXConfig) {
    if (!options.storage) {
      throw new BildXError('options.storage is required');
    }

    if (!options.cache) {
      throw new BildXError('options.storage is required');
    }

    this.http = HttpExpress();
    this.storage = options.storage;
    this.cache = options.cache;

    // Add routes
    this.addRoutes();
  }

  /**
   * Adds the required routes to Express instance
   */
  private addRoutes(): void {
    // Cache layer
    this.http.get('/:bildName', this.handleResponse.bind(this));
  }

  /**
   * Request handler for bild requests
   * @param {BildRequest} req
   * @param {Response} res
   */
  async handleResponse(req: BildRequest, res: Response): Promise<any> {
    // fileName
    const { bildName } = req.params;
    // Bild options as specified in BildXBildOptions
    const bildQueryOptions = req.query as BildXBildOptions || {};

    // Extract name and extension
    const { name, ext } = Path.parse(bildName);
    // Get the mimeType for Content-Type header
    const mimeType = Mime.getType(bildName) || 'image/jpg';
    // BildHash: unique name for each cached image including information
    // about image options found in BildXBildOptions
    const bildHash = `${name}-${hash(bildQueryOptions)}${ext}`;

    // Default response headers
    res.set({
      'Access-Control-Allow-Origin': '*',
      'X-Served-By': 'BildX',
      'Content-Type': mimeType,
    });

    // Resolves to cache storage first
    // Check cache
    const cachedBild = await this.cache.fileExists(bildHash);
    // Check cache
    if (cachedBild) {
      // Read the stream and pass it to client
      return this.cache.readFileStream(bildHash).pipe(res);
    }

    try {
      // Read the entire buffer and pass it to
      const bildBuffer = await this.storage.getFile(bildName);
      const sharpImage = await this.createBild(bildBuffer, bildQueryOptions);

      // Save a copy to cache storage
      this.cache.saveFile(bildHash, await sharpImage.toBuffer()).catch(console.log);

      // Flush to client
      return sharpImage.pipe(res);
    } catch (error) {
      return res.send(error);
    }
  }

  /**
   * Checks if an image exists
   * @param {string} bildId
   */
  bildExists(bildId: string): Promise<boolean> {
    return this.storage.fileExists(bildId);
  }

  /**
   *
   * @param {Request} _req
   * @param {Response} res
   */
  createBild = async (input: string | Buffer, options: BildXBildOptions): Promise<Sharp> => {
    // Create sharp Image
    const sharpImage = SharpEngine(input);
    // Blur option
    if (options.blur) {
      sharpImage.blur(options.blur);
    }
    // Resize: width, height or fit
    if (options.width || options.height || options.fit) {
      sharpImage.resize({
        width: Number(options.width) || undefined,
        height: Number(options.height) || undefined,
        fit: options.fit || undefined,
      });
    }
    // Return the buffer
    return sharpImage;
  }

  /**
   *
   * @param {Request} _req
   * @param {Response} res
   */
  async httpListBilds(_req: Request, res: Response) {
    const list = await this.storage.getFiles();
    res.json(list);
  }

  /**
   * Starts the Bildx server via Express
   * @param {number} port
   */
  start(port: number): Promise<void | undefined> {
    return new Promise((resolve) => {
      this.server = this.http.listen(port, resolve);
    });
  }

  /**
   * Stops listening
   */
  stop(): Promise<void | undefined | Error> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// Exports from here
export {
  BildX,
  BildXStorage,
};
