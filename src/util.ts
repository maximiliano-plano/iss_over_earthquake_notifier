export const getEnvarOrDefault = <T>(envar:string, _default:T):T => {
    return process.env[envar]
        ? process.env[envar] as T
        : _default;
}