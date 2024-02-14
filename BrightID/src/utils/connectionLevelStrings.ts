import i18next from 'i18next';
import { DARK_GREEN, GREY, RED, YELLOW } from '@/theme/colors';
import { connection_levels } from './constants';

const connectionLevelStrings: {
  [key in ValueOf<typeof connection_levels>]: string;
} = {
  [connection_levels.REPORTED]: `✋ ${i18next.t(
    'pendingConnections.label.reported',
  )}`,
  [connection_levels.SUSPICIOUS]: `🤔 ${i18next.t(
    'pendingConnections.label.suspicious',
  )}`,
  [connection_levels.JUST_MET]: `👋 ${i18next.t(
    'pendingConnections.label.justMet',
  )}`,
  [connection_levels.ALREADY_KNOWN]: `😎 ${i18next.t(
    'pendingConnections.label.alreadyKnown',
  )}`,
  [connection_levels.RECOVERY]: `🔐 ${i18next.t(
    'pendingConnections.label.recovery',
  )}`,
};

export function getConnectionLevelString(connectionLevel: string): string {
  return (
    connectionLevelStrings[connectionLevel] ??
    i18next.t('pendingConnections.label.unknownLevel')
  );
}

const connectionLevelColors: {
  [key in ValueOf<typeof connection_levels>]: string;
} = {
  [connection_levels.REPORTED]: RED,
  [connection_levels.SUSPICIOUS]: RED,
  [connection_levels.JUST_MET]: YELLOW,
  [connection_levels.ALREADY_KNOWN]: DARK_GREEN,
  [connection_levels.RECOVERY]: DARK_GREEN,
};

export function getConnectionLevelColor(connectionLevel: string): string {
  return connectionLevelColors[connectionLevel] ?? GREY;
}
