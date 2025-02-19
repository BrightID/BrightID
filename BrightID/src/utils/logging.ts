import {
  configLoggerType,
  consoleTransport,
  logger,
  transportFunctionType,
} from 'react-native-logs';
import { InteractionManager } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { LOGFILE_KEEP_DURATION } from '@/utils/constants';

// const rnFetchBlobTransport: transportFunctionType
const rnFetchBlobTransport = async (props) => {
  if (!props) return false;
  const path = `${props.options.filePath}/${props.options.fileName}`;
  const output = `${props.msg}\n`;
  try {
    await RNFetchBlob.fs.appendFile(path, output, 'utf8');
    return true;
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
    return false;
  }
};

// setup log directory
const logsDirectory = `${RNFetchBlob.fs.dirs.DocumentDir}/logs`;
// setup filename as current timestamp
export const currentLogName = `log-${Date.now()}.txt`;

// const config: configLoggerType = {
const config = {
  async: true,
  asyncFunc: InteractionManager.runAfterInteractions,
  // log both to file and console in dev mode, only to file in production
  transport: __DEV__
    ? [rnFetchBlobTransport, consoleTransport]
    : rnFetchBlobTransport,
  transportOptions: {
    filePath: logsDirectory,
    fileName: currentLogName,
  },
};

// export const LOG = logger.createLogger<'debug' | 'info' | 'warn' | 'error'>(
//   config,
// );

export const LOG = logger.createLogger(config);

export const listLogs = async (): Promise<Array<string>> => {
  const exists = await RNFetchBlob.fs.exists(logsDirectory);
  if (!exists) return [];
  let files = [];
  try {
    files = await RNFetchBlob.fs.ls(logsDirectory);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
  return files;
};

export const readLog = async (filename: string): Promise<string> => {
  const path = `${logsDirectory}/${filename}`;
  try {
    const fileExists = await RNFetchBlob.fs.exists(path);
    if (!fileExists) {
      console.warn(`File ${path} does not exist`);
      return '';
    }
    const logData = await RNFetchBlob.fs.readFile(path, 'utf8');
    return logData;
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
    return '';
  }
};

// purge logfiles older than LOGFILE_KEEP_DURATION
export const purgeLogs = async (): Promise<void> => {
  const threshold = Date.now() - LOGFILE_KEEP_DURATION;
  // get all logfiles
  const files = await listLogs();
  for (const file of files) {
    // parse filename to get timestamp
    const timestamp = getLogTimestamp(file);
    if (timestamp < threshold) {
      console.log(`Deleting log file ${logsDirectory}/${file}`);
      try {
        await RNFetchBlob.fs.unlink(`${logsDirectory}/${file}`);
      } catch (err) {
        err instanceof Error ? console.warn(err.message) : console.warn(err);
      }
    }
  }
};

// compare logfiles by timestamp, newest first
export const compareLogs = (log1: string, log2: string): number => {
  const t1 = getLogTimestamp(log1);
  const t2 = getLogTimestamp(log2);
  return t2 - t1;
};

export const getLogTimestamp = (filename: string): number => {
  return parseInt(filename.split('-')[1].split('.')[0]);
};
