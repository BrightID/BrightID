import { create, ApisauceInstance, ApiResponse } from 'apisauce';
import { b64ToUrlSafeB64 } from '@/utils/encoding';

const recoveryUrl = 'https://recovery.brightid.org';

class BackupService {
  recoveryApi: ApisauceInstance;

  constructor() {
    this.recoveryApi = create({
      baseURL: recoveryUrl,
    });
  }

  static throwOnError(response: ApiResponse<any>) {
    if (response.ok) {
      return;
    }
    if (response.data && response.data.errorMessage) {
      throw new Error(response.data.errorMessage);
    }
    console.log(
      `backupApi response error: ${response.status} - ${response.problem}`,
    );
    throw new Error(response.problem);
  }

  async getRecovery(key1: string, key2: string) {
    const res = await this.recoveryApi.get<GetRecoveryRes, ErrRes>(
      `/backups/${b64ToUrlSafeB64(key1)}/${b64ToUrlSafeB64(key2)}`,
    );
    BackupService.throwOnError(res);
    return res as unknown as GetRecoveryRes;
  }

  async putRecovery(key1: string, key2: string, data: string) {
    const res = await this.recoveryApi.put(
      `/backups/${b64ToUrlSafeB64(key1)}/${b64ToUrlSafeB64(key2)}`,
      {
        data,
      },
    );
    BackupService.throwOnError(res);
  }
}

const backupService = new BackupService();

export default backupService;
