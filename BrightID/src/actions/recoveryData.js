// @flow

export const SET_RECOVERY_DATA = 'SET_RECOVERY_DATA';
export const REMOVE_RECOVERY_DATA = 'REMOVE_RECOVERY_DATA';

export const setRecoveryData = (recoveryData: {
  publicKey: string,
  id: string,
  name: string,
  photo: { filename: string },
  secretKey: string,
  timestamp: number,
  updateTimestamp: number,
  sigs: { [string]: Signature },
  completedItems: number,
  totalItems: number,
}) => ({
  type: SET_RECOVERY_DATA,
  recoveryData,
});

export const removeRecoveryData = () => ({
  type: REMOVE_RECOVERY_DATA,
});
