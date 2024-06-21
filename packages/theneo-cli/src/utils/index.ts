export function sleep(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

export function isInteractiveFlow(options: {
  key: string | undefined;
  project: string | undefined;
}): boolean {
  return !(options.key || options.project);
}
