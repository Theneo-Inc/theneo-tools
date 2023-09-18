import { execa } from 'execa';
import { resolve } from 'path';

const bin = resolve(__dirname, './bin.js');

describe('theneo', () => {
  it('should display the help contents', async () => {
    const { stdout } = await execa(bin, ['--help']);

    expect(stdout).toContain('Usage: my-command [options]');
  });
});
