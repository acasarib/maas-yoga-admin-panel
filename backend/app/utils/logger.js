const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

export const logger = {
  log: (...args) => {
    console.log(`[${getTimestamp()}]`, ...args);
  },
  error: (...args) => {
    console.error(`[${getTimestamp()}]`, ...args);
  },
  warn: (...args) => {
    console.warn(`[${getTimestamp()}]`, ...args);
  },
  info: (...args) => {
    console.info(`[${getTimestamp()}]`, ...args);
  }
};

export default logger;
