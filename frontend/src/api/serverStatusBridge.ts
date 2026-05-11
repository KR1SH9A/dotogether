let reporter: () => void = () => {};

export function setDownReporter(fn: () => void): void {
  reporter = fn;
}

export function clearDownReporter(): void {
  reporter = () => {};
}

export function reportServerDown(): void {
  reporter();
}
