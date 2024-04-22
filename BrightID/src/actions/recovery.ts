export const UPDATE_LAST_UPLOADED_BACKUP_DATA_HASH =
  'UPDATE_LAST_UPLOADED_BACKUP_DATA_HASH';
export const updateLastUploadedBackupDataHash = (payload: {
  hashedId: string;
  encryptedDataHash: string;
}) => ({
  type: UPDATE_LAST_UPLOADED_BACKUP_DATA_HASH,
  payload,
});
