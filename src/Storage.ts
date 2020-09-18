import Fs from 'fs';
import Path from 'path';
import BildXError from './BildXError';

interface BildXStorage {
  storagePath: string;
  buildFilePath(fileId: string): string;
  fileExists(fileId: string): Promise<boolean>;
  getFile(fileId: string): Promise<Buffer>;
  getFiles(): Promise<string[]>;
  saveFile(fileName: string, data: string | Buffer): Promise<void>;
}

class BildXStorage implements BildXStorage {
  storagePath: string;

  constructor(storagePath: string) {
    if (!Path.isAbsolute(storagePath)) {
      throw new BildXError('Storage path must be absolute');
    }

    this.storagePath = storagePath;
  }

  async getFile(fileId: string): Promise<Buffer> {
    const fileExists = await this.fileExists(fileId);

    if (!fileExists) {
      return Promise.reject(new BildXError('File does not exist'));
    }

    return Fs.promises.readFile(this.buildFilePath(fileId));
  }

  async getFiles(): Promise<any> {
    const dirList = await Fs.promises.readdir(this.storagePath);
    return dirList;
  }

  /**
   * Resolves the absolute path for file
   * @param fileId
   */
  buildFilePath(fileId: string): string {
    return Path.resolve(this.storagePath, fileId);
  }

  /**
   * Checks if file exists in Storage
   * @param fileId the fileId
   * @returns {boolean}
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      const filePath = this.buildFilePath(fileName);
      await Fs.promises.access(filePath);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   *
   * @param {string} fileName
   * @param {string|Buffer} data
   */
  async saveFile(fileName: string, data: string | Buffer): Promise<void> {
    const filePath = this.buildFilePath(fileName);
    return Fs.promises.writeFile(filePath, data);
  }

  /**
   * Creates a ReadStream to file
   * @param {string} fileName
   */
  readFileStream(fileName: string): Fs.ReadStream {
    const filePath = this.buildFilePath(fileName);
    return Fs.createReadStream(filePath);
  }
}

export default BildXStorage;
