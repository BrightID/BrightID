import { connection_levels } from './constants';

export const connectionLevelStrings = {
  [connection_levels.REPORTED]: '✋ Flagged',
  [connection_levels.SUSPICIOUS]: '🤔 Suspicious',
  [connection_levels.JUST_MET]: '👋 Just met',
  [connection_levels.ALREADY_KNOWN]: '😎 Already known',
  [connection_levels.RECOVERY]: '🔐 Recovery',
};

export const connectionLevelColors = {
  [connection_levels.REPORTED]: '#ED1B24',
  [connection_levels.SUSPICIOUS]: '#ED1B24',
  [connection_levels.JUST_MET]: '#F6BF08',
  [connection_levels.ALREADY_KNOWN]: '#4EC580',
  [connection_levels.RECOVERY]: '#4EC580',
};
