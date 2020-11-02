import { connection_levels } from './constants';
import i18next from 'i18next';

export const connectionLevelStrings = {
  [connection_levels.REPORTED]: '✋ ' + i18next.t('pendingConnections.button.flagged'),
  [connection_levels.SUSPICIOUS]: '🤔 ' + i18next.t('pendingConnections.button.suspicious'),
  [connection_levels.JUST_MET]: '👋 ' +  i18next.t('pendingConnections.button.justMet'),
  [connection_levels.ALREADY_KNOWN]: '😎 ' + i18next.t('pendingConnections.button.alreadyKnown'),
  [connection_levels.RECOVERY]: '🔐 ' + i18next.t('pendingConnections.button.recovery'),
};

export const connectionLevelColors = {
  [connection_levels.REPORTED]: '#ED1B24',
  [connection_levels.SUSPICIOUS]: '#ED1B24',
  [connection_levels.JUST_MET]: '#F6BF08',
  [connection_levels.ALREADY_KNOWN]: '#4EC580',
  [connection_levels.RECOVERY]: '#4EC580',
};
