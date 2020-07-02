// @flow

import { create, ApiSauceInstance } from 'apisauce';
import nacl from 'tweetnacl';
import { strToUint8Array, uInt8ArrayToB64, hash } from '@/utils/encoding';
import { obtainKeys } from '@/utils/keychain';
import store from '@/store';
import { addOperation } from '@/actions';

let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://test.brightid.org';
}
const v = 4;

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
    return `${this.baseUrl}/brightid/v4`;
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

  async createConnection(
    id1: string,
    sig1: string,
    id2: string,
    sig2: string,
    timestamp: number,
  ) {
    let name = 'Add Connection';
    let message = name + id1 + id2 + timestamp;

    let op = {
      _key: hash(message),
      name,
      id1,
      id2,
      sig1,
      sig2,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    console.log(`Initiator opMessage: ${message} - hash: ${hash(message)}`);
    BrightId.setOperation(op);
  }

  async removeConnection(id2: string, reason: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Remove Connection';
    let timestamp = Date.now();
    let message = name + username + id2 + reason + timestamp;

    let sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let op = {
      _key: hash(message),
      name,
      id1: username,
      id2,
      reason,
      sig1,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op);
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
    let { username, secretKey } = await obtainKeys();

    let name = 'Add Group';
    let timestamp = Date.now();
    let message =
      name +
      groupId +
      username +
      id2 +
      inviteData2 +
      id3 +
      inviteData3 +
      url +
      type +
      timestamp;

    let sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let op = {
      _key: hash(message),
      name,
      id1: username,
      id2,
      inviteData2,
      id3,
      inviteData3,
      group: groupId,
      url,
      sig1,
      type,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op);
  }

  async dismiss(id2: string, group: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Dismiss';
    let timestamp = Date.now();
    let message = name + username + id2 + group + timestamp;

    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let op = {
      _key: hash(message),
      name,
      dismisser: username,
      dismissee: id2,
      group,
      sig,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op);
  }

  async invite(id2: string, group: string, data: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Invite';
    let timestamp = Date.now();
    let message = name + username + id2 + group + data + timestamp;

    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let op = {
      _key: hash(message),
      name,
      inviter: username,
      invitee: id2,
      group,
      data,
      sig,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
  }

  async deleteGroup(group: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Remove Group';
    let timestamp = Date.now();
    let message = name + username + group + timestamp;

    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let op = {
      _key: hash(message),
      name,
      id: username,
      group,
      sig,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op);
  }

  async joinGroup(group: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Add Membership';
    let timestamp = Date.now();
    let message = name + username + group + timestamp;

    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let op = {
      _key: hash(message),
      name,
      id: username,
      group,
      sig,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op);
  }

  async leaveGroup(group: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Remove Membership';
    let timestamp = Date.now();
    let message = name + username + group + timestamp;

    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let op = {
      _key: hash(message),
      name,
      id: username,
      group,
      sig,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op);
  }

  async setTrusted(trusted: string[]) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Set Trusted Connections';
    let timestamp = Date.now();
    let message = name + username + trusted.join(',') + timestamp;

    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let op = {
      _key: hash(message),
      name,
      id: username,
      trusted,
      sig,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op);
  }

  async setSigningKey(op: {
    id: string,
    signingKey: string,
    timestamp: number,
    id1: string,
    id2: string,
    sig1: string,
    sig2: string,
  }) {
    // this should be consistent with the other API calls
    op.name = 'Set Signing Key';
    op._key = hash(op.name + op.id + op.signingKey + op.timestamp);
    op.v = v;

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op);
  }

  async linkContextId(context: string, contextId: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Link ContextId';
    let timestamp = Date.now();
    let message = `${name},${context},${contextId},${timestamp}`;

    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let op = {
      _key: hash(message),
      name,
      id: username,
      context,
      contextId,
      sig,
      timestamp,
      v,
    };

    let res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op);
  }

  async getUserInfo(id: string) {
    let res = await this.api.get(`/users/${id}`);
    BrightId.throwOnError(res);
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
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getContext(context: string) {
    let res = await this.api.get(`/contexts/${context}`);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async ip(): string {
    let res = await this.api.get('/ip');
    BrightId.throwOnError(res);
    return res.data.data.ip;
  }
}

const nodeApi = new NodeApi();

export default nodeApi;
