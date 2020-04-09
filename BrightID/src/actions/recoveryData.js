// @flow

export const SET_RECOVERY_DATA = 'SET_RECOVERY_DATA';
export const REMOVE_RECOVERY_DATA = 'REMOVE_RECOVERY_DATA';

export const setRecoveryData = (recoveryData: {
  publicKey: string,
  id: string,
  secretKey: string,
  timestamp: number,
  sigs: Signature[],
}) => ({
  type: SET_RECOVERY_DATA,
  recoveryData,
});

export const removeRecoveryData = () => ({
  type: REMOVE_RECOVERY_DATA,
});
