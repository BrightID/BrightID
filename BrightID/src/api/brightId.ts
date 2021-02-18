import { create, ApisauceInstance } from 'apisauce';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  hash,
  b64ToUint8Array,
} from '@/utils/encoding';
import store from '@/store';
import { addOperation } from '@/actions';
import BrightidError from '@/api/brightidError';

let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://test.brightid.org';
}
const v = 5;

class NodeApi {
  api: ApisauceInstance;

  baseUrlInternal: string;

  constructor() {
    // for now set the baseUrl to the seedUrl since there is only one server
    this.baseUrlInternal = seedUrl;
    this.api = create({
      baseURL: this.apiUrl,
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  get baseUrl() {
    return this.baseUrlInternal;
  }

  set baseUrl(url) {
    this.baseUrlInternal = url;
    this.api.setBaseURL(this.apiUrl);
  }

  get apiUrl() {
    return `${this.baseUrl}/brightid/v5`;
  }

  static checkHash(response, message) {
    if (response.data.data.hash !== hash(message)) {
      throw new Error('Invalid operation hash returned from server');
    }
    return response.data.data.hash;
  }

  static throwOnError(response) {
    if (response.ok) {
      return;
    }
    if (response.data && response.data.error) {
      throw new BrightidError(response.data);
    }
    throw new Error(response.problem);
  }

  static setOperation(op) {
    store.dispatch(addOperation(op));
  }

  async addConnection(
    id1: string,
    id2: string,
    level: string,
    timestamp: number,
    reportReason?: string,
    fakeUser?: FakeUser,
  ) {
    let secretKey;
    if (fakeUser) {
      secretKey = b64ToUint8Array(fakeUser.secretKey);
    } else {
      // use real user data
      secretKey = store.getState().keypair.secretKey;
    }

    interface ConnectOp {
      name: 'Connect';
      id1: string;
      id2: string;
      level: string;
      timestamp: number;
      v: number;
      sig1?: string;
      reportReason?: string;
      replacedWith?: string;
      requestProof?: string;
      hash?: string;
    }

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
    op.sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async createGroup(
    groupId: string,
    id2: string,
    inviteData2: string,
    id3: string,
    inviteData3: string,
    url: string,
    type: string,
  ) {
    const {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    const name = 'Add Group';
    const timestamp = Date.now();

    interface AddGroupOp {
      name: 'Add Group';
      group: string;
      id1: string;
      id2: string;
      id3: string;
      inviteData2: string;
      inviteData3: string;
      url: string;
      type: string;
      timestamp: number;
      v: number;
      sig1?: string;
      hash?: string;
    }

    const op: AddGroupOp = {
      name,
      id1: id,
      id2,
      inviteData2,
      id3,
      inviteData3,
      group: groupId,
      url,
      type,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async dismiss(id2: string, group: string) {
    const {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    const name = 'Dismiss';
    const timestamp = Date.now();

    interface DismissOp {
      name: string;
      dismisser: string;
      dismissee: string;
      group: string;
      timestamp: number;
      v: number;
      sig?: string;
      hash?: string;
    }

    const op: DismissOp = {
      name,
      dismisser: id,
      dismissee: id2,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async invite(id2: string, group: string, data: string) {
    const {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    const name = 'Invite';
    const timestamp = Date.now();

    interface InviteOp {
      name: 'Invite';
      inviter: string;
      invitee: string;
      group: string;
      data: string;
      timestamp: number;
      v: number;
      sig?: string;
      hash?: string;
    }

    const op: InviteOp = {
      name,
      inviter: id,
      invitee: id2,
      group,
      data,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post(`/operations`, op);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.throwOnError(res);
  }

  async addAdmin(newAdmin: string, group: string) {
    const {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    const name = 'Add Admin';
    const timestamp = Date.now();

    interface AddAdminOp {
      name: 'Add Admin';
      id: string;
      admin: string;
      group: string;
      timestamp: number;
      v: number;
      sig?: string;
      hash?: string;
    }

    const op: AddAdminOp = {
      name,
      id,
      admin: newAdmin,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    const res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async deleteGroup(group: string) {
    const {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    const name = 'Remove Group';
    const timestamp = Date.now();

    interface RemoveGroupOp {
      name: 'Remove Group';
      id: string;
      group: string;
      timestamp: number;
      v: number;
      sig?: string;
      hash?: string;
    }

    const op: RemoveGroupOp = {
      name,
      id,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async joinGroup(group: string, fakeUser?: FakeUser) {
    let brightId, secretKey;
    if (fakeUser) {
      brightId = fakeUser.id;
      secretKey = b64ToUint8Array(fakeUser.secretKey);
    } else {
      // use real user data
      brightId = store.getState().user.id;
      secretKey = store.getState().keypair.secretKey;
    }

    const name = 'Add Membership';
    const timestamp = Date.now();

    interface AddMembershipOp {
      name: string;
      id: string;
      group: string;
      timestamp: number;
      v: number;
      sig?: string;
      hash?: string;
    }

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
    const res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async leaveGroup(group: string) {
    const {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    const name = 'Remove Membership';
    const timestamp = Date.now();

    interface RemoveMembershipOp {
      name: string;
      id: string;
      group: string;
      timestamp: number;
      v: number;
      sig?: string;
      hash?: string;
    }

    const op: RemoveMembershipOp = {
      name,
      id,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async setSigningKey(params: {
    id: string;
    signingKey: string;
    timestamp: number;
    id1: string;
    id2: string;
    sig1: string;
    sig2: string;
  }) {
    interface SetSigningKeyOp {
      name: 'Set Signing Key';
      id: string;
      signingKey: string;
      timestamp: number;
      v: number;
      id1?: string;
      id2?: string;
      sig1?: string;
      sig2?: string;
      hash?: string;
    }

    const op: SetSigningKeyOp = {
      name: 'Set Signing Key',
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
    const res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async linkContextId(context: string, contextId: string) {
    const {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    const name = 'Link ContextId';
    const timestamp = Date.now();

    interface LinkContextIdOp {
      name: 'Link ContextId';
      timestamp: number;
      v: number;
      context: string;
      contextId?: string;
      encrypted?: string;
      id?: string;
      sig?: string;
      hash?: string;
    }

    const op: LinkContextIdOp = {
      name,
      id,
      context,
      contextId,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async getUserInfo(id: string) {
    const res = await this.api.get<{ data: any }>(`/users/${id}`);
    NodeApi.throwOnError(res);
    return res.data.data;
  }

  async getUserProfile(id: string) {
    const requester = store.getState().user.id;
    const res = await this.api.get<{ data: any }>(
      `/users/${id}/profile/${requester}`,
    );
    NodeApi.throwOnError(res);
    return res.data.data;
  }

  async getConnections(id: string, direction: string) {
    const res = await this.api.get<{ data: any }>(
      `/users/${id}/connections/${direction}`,
    );
    NodeApi.throwOnError(res);
    return res.data.data.connections;
  }

  async getOperationState(opHash: string) {
    const res = await this.api.get<{ data: any }>(`/operations/${opHash}`);
    if (res.status === 404) {
      // operation is not existing on server. Don't throw an error, as a client might try to check
      // operations sent by other clients without knowing if they have been submitted already.
      return {
        state: 'unknown',
        result: '',
      };
    }
    NodeApi.throwOnError(res);
    return res.data.data;
  }

  async getApps() {
    const res = await this.api.get<{ data: any }>(`/apps`);
    NodeApi.throwOnError(res);
    return res.data.data.apps;
  }
}

const brightId = new NodeApi();

export default brightId;
