import { resolve } from 'path';

describe('cli', () => {
  it('should exist', () => {
    const cli = require(resolve(__dirname, '../../src/bin'));

    expect(cli).toBeTruthy();
  });
});
