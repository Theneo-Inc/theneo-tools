export function sleep(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}
