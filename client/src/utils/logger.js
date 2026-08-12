const enabled = import.meta.env.DEV;

export const logger = {
 error: (...args) => {
 if (enabled) console.error(...args);
 },
 warn: (...args) => {
 if (enabled) console.warn(...args);
 },
};
