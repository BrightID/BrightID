import i18next from 'i18next';
import { YELLOW, RED, DARK_GREEN } from '@/theme/colors';
import { connection_levels } from './constants';

export const connectionLevelStrings = {
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

export const connectionLevelColors = {
  [connection_levels.REPORTED]: RED,
  [connection_levels.SUSPICIOUS]: RED,
  [connection_levels.JUST_MET]: YELLOW,
  [connection_levels.ALREADY_KNOWN]: DARK_GREEN,
  [connection_levels.RECOVERY]: DARK_GREEN,
};