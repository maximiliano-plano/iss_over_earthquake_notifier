export const getEnvarOrDefault = <T>(envar: string, _default: T): T => {
  return process.env[envar] ? (process.env[envar] as T) : _default;
};

export const getEnvarOrThrow = <T>(envar: string): T => {
  if (process.env[envar]) {
    return process.env[envar] as T;
  }
  console.error(`${envar} environment variable is not set.`);
  throw new Error(`${envar} environment variable is not set.`);
};

export const pause = (seconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(() => resolve(), seconds * 1000));
