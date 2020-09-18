export default class BildXError extends Error {
  name: string = 'BildXError';

  message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
