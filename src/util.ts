export const getEnvarOrDefault = <T>(envar: string, _default: T): T => {
    return process.env[envar]
        ? process.env[envar] as T
        : _default;
}

export const pause = (seconds: number): Promise<void> => 
    new Promise((resolve => setTimeout(() => resolve(), seconds * 1000)));