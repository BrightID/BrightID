// @flow

import { create, ApiSauceInstance } from 'apisauce';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import { strToUint8Array, uInt8ArrayToB64, hash } from '@/utils/encoding';
import { obtainKeys } from '@/utils/keychain';
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

  static checkHash(response, op) {
    if (response.data.data._key != op._key) {
      throw new Error('Invalid operation hash returned from server');
    }
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
    let op = {
      name,
      id1,
      id2,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig1 = sig1;
    op.sig2 = sig2;
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
    console.log(`Initiator opMessage: ${message} - hash: ${hash(message)}`);
    NodeApi.setOperation(op);
  }

  async removeConnection(id2: string, reason: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Remove Connection';
    let timestamp = Date.now();
    let op = {
      name,
      id1: username,
      id2,
      reason,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
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
    let { username, secretKey } = await obtainKeys();

    let name = 'Add Group';
    let timestamp = Date.now();

    let op = {
      name,
      id1: username,
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
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
    NodeApi.setOperation(op);
  }

  async dismiss(id2: string, group: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Dismiss';
    let timestamp = Date.now();

    let op = {
      name,
      dismisser: username,
      dismissee: id2,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
    NodeApi.setOperation(op);
  }

  async invite(id2: string, group: string, data: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Invite';
    let timestamp = Date.now();
    let op = {
      name,
      inviter: username,
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
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.checkHash(res, op);
    NodeApi.throwOnError(res);
  }

  async deleteGroup(group: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Remove Group';
    let timestamp = Date.now();
    let op = {
      name,
      id: username,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
    NodeApi.setOperation(op);
  }

  async joinGroup(group: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Add Membership';
    let timestamp = Date.now();
    let op = {
      name,
      id: username,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
    NodeApi.setOperation(op);
  }

  async leaveGroup(group: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Remove Membership';
    let timestamp = Date.now();
    let op = {
      name,
      id: username,
      group,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
    NodeApi.setOperation(op);
  }

  async setTrusted(trusted: string[]) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Set Trusted Connections';
    let timestamp = Date.now();
    let op = {
      name,
      id: username,
      trusted,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
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
    op._key = hash(message);
    op.id1 = params.id1;
    op.id2 = params.id2;
    op.sig1 = params.sig1;
    op.sig2 = params.sig2;
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
    NodeApi.setOperation(op);
  }

  async linkContextId(context: string, contextId: string) {
    let { username, secretKey } = await obtainKeys();

    let name = 'Link ContextId';
    let timestamp = Date.now();
    let op = {
      name,
      id: username,
      context,
      contextId,
      timestamp,
      v,
    };

    const message = stringify(op);
    op.sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    op._key = hash(message);
    let res = await this.api.post(`/operations`, op);
    NodeApi.throwOnError(res);
    NodeApi.checkHash(res, op);
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

  async getContext(context: string) {
    let res = await this.api.get(`/contexts/${context}`);
    NodeApi.throwOnError(res);
    return res.data.data;
  }

  async ip(): string {
    let res = await this.api.get('/ip');
    NodeApi.throwOnError(res);
    return res.data.data.ip;
  }
}

const brightId = new NodeApi();

export default brightId;
