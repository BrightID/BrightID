// @flow

import { create, ApiSauceInstance } from 'apisauce';
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

let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://test.brightid.org';
}
const v = 5;

class NodeApi {
  api: ApiSauceInstance;

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
    if (response.data.data.hash != hash(message)) {
      throw new Error('Invalid operation hash returned from server');
    }
    return response.data.data.hash;
  }

  static throwOnError(response) {
    if (response.ok) {
      return;
    }
    if (response.data && response.data.errorMessage) {
      throw new Error(response.data.errorMessage);
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
    reportReason?: string,
    timestamp: number,
    requestProof?: string,
    fakeUser?: FakeUser,
  ) {
    let secretKey;
    if (fakeUser) {
      secretKey = b64ToUint8Array(fakeUser.secretKey);
    } else {
      // use real user data
      secretKey = store.getState().keypair.secretKey;
    }

    let name = 'Connect';
    let op = {
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
    if (requestProof) {
      op.requestProof = requestProof;
    }

    const message = stringify(op);
    console.log(`Connect message: ${message}`);
    op.sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async removeConnection(id2: string, reason: string) {
    let {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    let name = 'Remove Connection';
    let timestamp = Date.now();
    let op = {
      name,
      id1: id,
      id2,
      reason,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    let res = await this.api.post(`/operations`, op);
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
    let {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    let name = 'Add Group';
    let timestamp = Date.now();

    let op = {
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
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async dismiss(id2: string, group: string) {
    let {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    let name = 'Dismiss';
    let timestamp = Date.now();

    let op = {
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
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async invite(id2: string, group: string, data: string) {
    let {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    let name = 'Invite';
    let timestamp = Date.now();
    let op = {
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
    let res = await this.api.post(`/operations`, op);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.throwOnError(res);
  }

  async addAdmin(newAdmin: string, group: string) {
    let {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    let name = 'Add Admin';
    let timestamp = Date.now();
    let op = {
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
    let {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    let name = 'Remove Group';
    let timestamp = Date.now();
    let op = {
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
    let res = await this.api.post(`/operations`, op);
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

    let name = 'Add Membership';
    let timestamp = Date.now();
    let op = {
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
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async leaveGroup(group: string) {
    let {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    let name = 'Remove Membership';
    let timestamp = Date.now();
    let op = {
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
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async setTrusted(trusted: string[]) {
    let {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    let name = 'Set Trusted Connections';
    let timestamp = Date.now();
    let op = {
      name,
      id,
      trusted,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async setSigningKey(params: {
    id: string,
    signingKey: string,
    timestamp: number,
    id1: string,
    id2: string,
    sig1: string,
    sig2: string,
  }) {
    let op = {
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
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async linkContextId(context: string, contextId: string) {
    let {
      user: { id },
      keypair: { secretKey },
    } = store.getState();

    let name = 'Link ContextId';
    let timestamp = Date.now();
    let op = {
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
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    op.hash = NodeApi.checkHash(res, message);
    NodeApi.setOperation(op);
  }

  async getUserInfo(id: string) {
    let res = await this.api.get(`/users/${id}`);
    NodeApi.throwOnError(res);
    return res.data.data;
  }

  async getOperationState(opHash: string) {
    let res = await this.api.get(`/operations/${opHash}`);
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
    let res = await this.api.get(`/apps`);
    NodeApi.throwOnError(res);
    return res.data.data.apps;
  }

  async ip(): string {
    let res = await this.api.get('/ip');
    NodeApi.throwOnError(res);
    return res.data.data.ip;
  }
}

const brightId = new NodeApi();

export default brightId;
