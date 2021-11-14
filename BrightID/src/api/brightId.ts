import { create, ApisauceInstance, ApiResponse, ApiOkResponse } from 'apisauce';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  hash,
  b64ToUint8Array,
} from '@/utils/encoding';
import BrightidError from '@/api/brightidError';

const v = 6;

export class NodeApi {
  api: ApisauceInstance;

  baseUrlInternal: string;

  secretKey: Uint8Array | undefined;

  id: string | undefined;

  constructor({
    url,
    secretKey,
    id,
  }: {
    url: string;
    secretKey: Uint8Array | undefined;
    id: string | undefined;
  }) {
    this.baseUrlInternal = url;
    this.id = id;
    this.secretKey = secretKey;
    this.api = create({
      baseURL: this.apiUrl,
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  get baseUrl() {
    return this.baseUrlInternal;
  }

  set baseUrl(url: string) {
    this.baseUrlInternal = url;
    this.api.setBaseURL(this.apiUrl);
  }

  get apiUrl() {
    return `${this.baseUrl}/brightid/v${v}`;
  }

  static checkHash(response: ApiOkResponse<OperationPostRes>, message: string) {
    if (response.data.data?.hash !== hash(message)) {
      throw new Error('Invalid operation hash returned from server');
    }
    return response.data.data?.hash;
  }

  static throwOnError(response: ApiResponse<NodeApiRes, ErrRes>) {
    if (response.ok) {
      return true;
    } else if (response.data && (response.data as ErrRes).errorNum) {
      throw new BrightidError(response.data as ErrRes);
    } else {
      throw new Error(response.problem);
    }
  }

  requiresCredentials() {
    if (this.id === undefined || this.secretKey === undefined) {
      throw new Error('Missing API credentials');
    }
  }

  async addConnection(
    id1: string,
    id2: string,
    level: string,
    timestamp: number,
    reportReason?: string,
    fakeUser?: FakeUser,
  ) {
    this.requiresCredentials();
    const sk = fakeUser ? b64ToUint8Array(fakeUser.secretKey) : this.secretKey;

    const name = 'Connect';

    const op: ConnectOp = {
      name,
      id1,
      id2,
      level,
      timestamp,
      v,
    };

    if (reportReason) {
      op.reportReason = reportReason;
    }

    const message = stringify(op);
    console.log(`Connect message: ${message}`);
    op.sig1 = uInt8ArrayToB64(nacl.sign.detached(strToUint8Array(message), sk));
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      op,
    );
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async createGroup(groupId: string, url: string, type: string) {
    this.requiresCredentials();
    const name = 'Add Group';
    const timestamp = Date.now();

    const op: AddGroupOp = {
      name,
      id: this.id,
      group: groupId,
      url,
      type,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), this.secretKey),
    );
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      op,
    );
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async dismiss(dismissee: string, group: string) {
    this.requiresCredentials();
    const name = 'Dismiss';
    const timestamp = Date.now();

    const op: DismissOp = {
      name,
      dismisser: this.id,
      dismissee,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), this.secretKey),
    );
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      op,
    );
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async invite(invitee: string, group: string, data: string) {
    this.requiresCredentials();
    const name = 'Invite';
    const timestamp = Date.now();

    const op: InviteOp = {
      name,
      inviter: this.id,
      invitee,
      group,
      data,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), this.secretKey),
    );
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      op,
    );
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async addAdmin(newAdmin: string, group: string) {
    this.requiresCredentials();
    const name = 'Add Admin';
    const timestamp = Date.now();

    const op: AddAdminOp = {
      name,
      id: this.id,
      admin: newAdmin,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), this.secretKey),
    );

    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      op,
    );
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async deleteGroup(group: string) {
    this.requiresCredentials();
    const name = 'Remove Group';
    const timestamp = Date.now();

    const op: RemoveGroupOp = {
      name,
      id: this.id,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), this.secretKey),
    );
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      op,
    );
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async joinGroup(group: string, fakeUser?: FakeUser) {
    this.requiresCredentials();
    let brightId, secretKey;
    if (fakeUser) {
      brightId = fakeUser.id;
      secretKey = b64ToUint8Array(fakeUser.secretKey);
    } else {
      // use real user data
      brightId = this.id;
      secretKey = this.secretKey;
    }

    const name = 'Add Membership';
    const timestamp = Date.now();

    const op: AddMembershipOp = {
      name,
      id: brightId,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      op,
    );
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async leaveGroup(group: string) {
    this.requiresCredentials();
    const name = 'Remove Membership';
    const timestamp = Date.now();

    const op: RemoveMembershipOp = {
      name,
      id: this.id,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), this.secretKey),
    );
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      op,
    );
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async socialRecovery(params: {
    id: string;
    signingKey: string;
    timestamp: number;
    id1: string;
    id2: string;
    sig1: string;
    sig2: string;
  }) {
    const op: SocialRecoveryOp = {
      name: 'Social Recovery',
      id: params.id,
      signingKey: params.signingKey,
      timestamp: params.timestamp,
      v,
    };

    const message = stringify(op);
    op.id1 = params.id1;
    op.id2 = params.id2;
    op.sig1 = params.sig1;
    op.sig2 = params.sig2;
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/operations`,
      op,
    );
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async linkContextId(context: string, contextId: string) {
    this.requiresCredentials();
    const name = 'Link ContextId';
    const timestamp = Date.now();

    const op: LinkContextIdOp = {
      name,
      id: this.id,
      context,
      contextId,
      timestamp,
      v: 5,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), this.secretKey),
    );
    const api = create({
      baseURL: `${this.baseUrl}/brightid/v5`,
      headers: { 'Cache-Control': 'no-cache' },
    });
    const res = await api.post<OperationPostRes, ErrRes>(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(
      res as ApiOkResponse<OperationPostRes>,
      message,
    );
    return op;
  }

  async getGroup(id: string) {
    const res = await this.api.get<GroupRes, ErrRes>(`/groups/${id}`);
    NodeApi.throwOnError(res);
    return (res.data as GroupRes).data;
  }

  async getProfile(id: string) {
    this.requiresCredentials();
    const requester = this.id;
    const res = await this.api.get<UserProfileRes, ErrRes>(
      `/users/${id}/profile/${requester}`,
    );
    NodeApi.throwOnError(res);
    return (res.data as UserProfileRes).data;
  }

  async getVerifications(id: string) {
    const res = await this.api.get<UserVerificationsRes, ErrRes>(
      `/users/${id}/verifications`,
    );
    NodeApi.throwOnError(res);
    return (res.data as UserVerificationsRes).data.verifications;
  }

  async getConnections(id: string, direction: 'inbound' | 'outbound') {
    const res = await this.api.get<UserConnectionsRes, ErrRes>(
      `/users/${id}/connections/${direction}`,
    );
    NodeApi.throwOnError(res);
    return (res.data as UserConnectionsRes).data?.connections;
  }

  async getMemberships(id: string) {
    const res = await this.api.get<UserMembershipsRes, ErrRes>(
      `/users/${id}/memberships`,
    );
    NodeApi.throwOnError(res);
    return (res.data as UserMembershipsRes).data?.memberships;
  }

  async getInvites(id: string) {
    const res = await this.api.get<UserInvitesRes, ErrRes>(
      `/users/${id}/invites`,
    );
    NodeApi.throwOnError(res);
    return (res.data as UserInvitesRes).data?.invites;
  }

  async getOperationState(opHash: string) {
    const res = await this.api.get<OperationRes, ErrRes>(
      `/operations/${opHash}`,
    );
    if (res.status === 404) {
      // operation is not existing on server. Don't throw an error, as a client might try to check
      // operations sent by other clients without knowing if they have been submitted already.
      return {
        state: 'unknown',
        result: '',
      };
    }
    NodeApi.throwOnError(res);
    return (res.data as OperationRes).data;
  }

  async getApps() {
    const res = await this.api.get<AppsRes, ErrRes>(`/apps`);
    NodeApi.throwOnError(res);
    return (res.data as AppsRes).data?.apps;
  }

  async getState() {
    const res = await this.api.get<StateRes, ErrRes>(`/state`);
    NodeApi.throwOnError(res);
    return (res.data as StateRes).data;
  }

  async getPublic(app: string, roundedTimestamp: number, verification: string) {
    console.log(15, app, roundedTimestamp, verification);
    const res = await this.api.get<PublicRes, ErrRes>(
      `/verifications/blinded/public`,
      { app, roundedTimestamp, verification },
    );
    NodeApi.throwOnError(res);
    return (res.data as PublicRes).data.public;
  }

  async getBlindedSig(pub: string, sig: string, e: string) {
    const res = await this.api.get<BlindSigRes, ErrRes>(
      `/verifications/blinded/sig/${this.id}`,
      { public: pub, sig, e },
    );
    NodeApi.throwOnError(res);
    return (res.data as BlindSigRes).data.response;
  }

  async linkAppId(sig: SigInfo, appId: string) {
    console.log(`/verifications/${sig.app}/${appId}`);
    console.log({
      sig: sig.sig,
      uid: sig.uid,
      verification: sig.verification,
      roundedTimestamp: sig.roundedTimestamp,
    });
    const res = await this.api.post<OperationPostRes, ErrRes>(
      `/verifications/${sig.app}/${appId}`,
      {
        sig: sig.sig,
        uid: sig.uid,
        verification: sig.verification,
        roundedTimestamp: sig.roundedTimestamp,
      },
    );

    NodeApi.throwOnError(res);
  }

  async sponsor(op: SponsorOp) {
    this.requiresCredentials();
    const res = await this.api.post<OperationRes, ErrRes>(`/operations`, op);
    NodeApi.throwOnError(res);
    delete op.sig;
    const message = stringify(op);
    op.hash = NodeApi.checkHash(res as ApiOkResponse<OperationRes>, message);
    return op;
  }
}
