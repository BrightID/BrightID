// @flow

import { create, ApiSauceInstance } from 'apisauce';
import nacl from 'tweetnacl';
import { strToUint8Array, uInt8ArrayToB64, hash } from '../utils/encoding';
import store from '../store';
import { addOperation } from '../actions';

let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://test.brightid.org';
}

class BrightId {
  api: ApiSauceInstance;

  baseUrlInternal: string;

  constructor() {
    // for now set the baseUrl to the seedUrl since there is only one server
    this.baseUrlInternal = seedUrl;
    this.api = create({
      baseURL: this.apiUrl,
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

  static setOperation(opHash: string) {
    store.dispatch(addOperation(opHash));
  }

  async createConnection(
    id1: string,
    sig1: string,
    id2: string,
    sig2: string,
    timestamp: number,
  ) {
    const op = {
      name: 'Add Connection',
      id1,
      id2,
      sig1,
      sig2,
      timestamp,
    };
    op._key = hash(op.name + op.id1 + op.id2 + op.timestamp);
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op._key);
  }

  async removeConnection(id2: string, reason: string) {
    const { id, secretKey } = store.getState();
    const timestamp = Date.now();
    const message = `Remove Connection${id}${id2}${reason}${timestamp}`;

    let sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const op = {
      _key: hash(message),
      name: 'Remove Connection',
      id1: id,
      id2,
      reason,
      sig1,
      timestamp,
    };
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op._key);
  }

  async createGroup(group: string, id2: string, inviteData2: string, id3: string, inviteData3: string, url: string, type: string) {
    const { id, secretKey } = store.getState();
    const timestamp = Date.now();
    const message = `Add Group${group}${id}${id2}${inviteData2}${id3}${inviteData3}${url}${type}${timestamp}`;

    const sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    const op = {
      _key: hash(message),
      name: 'Add Group',
      id1: id,
      id2,
      inviteData2,
      id3,
      inviteData3,
      group,
      url,
      sig1,
      type,
      timestamp,
    };
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op._key);
  }

  async dismiss(id2: string, group: string) {
    const { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = `Dismiss${id}${id2}${group}${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    const op = {
      _key: hash(message),
      name: 'Dismiss',
      dismisser: id,
      dismissee: id2,
      group,
      sig,
      timestamp,
    };
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op._key);
  }

  async invite(id2: string, group: string, data: string) {
    const { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = `Invite${id}${id2}${group}${data}${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    const op = {
      _key: hash(message),
      name: 'Invite',
      inviter: id,
      invitee: id2,
      group,
      data,
      sig,
      timestamp,
    };
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
  }

  async deleteGroup(group: string) {
    let { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = `Remove Group${id}${group}${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    const op = {
      _key: hash(message),
      name: 'Remove Group',
      id,
      group,
      sig,
      timestamp,
    };
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op._key);
  }

  async joinGroup(group: string) {
    const { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = `Add Membership${id}${group}${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    const op = {
      _key: hash(message),
      name: 'Add Membership',
      id,
      group,
      sig,
      timestamp,
    };
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op._key);
  }

  async leaveGroup(group: string) {
    const { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = `Remove Membership${id}${group}${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    const op = {
      _key: hash(message),
      name: 'Remove Membership',
      id,
      group,
      sig,
      timestamp,
    };
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op._key);
  }

  async setTrusted(trusted: string[]) {
    let { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = `Set Trusted Connections${id}${trusted.join(
      ',',
    )}${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const op = {
      _key: hash(message),
      name: 'Set Trusted Connections',
      id,
      trusted,
      sig,
      timestamp,
    };
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op._key);
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
    op.name = 'Set Signing Key';
    op._key = hash(op.name + op.id + op.signingKey + op.timestamp);
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
    BrightId.setOperation(op._key);
  }

  async linkContextId(context: string, contextId: string) {
    let { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = `Link ContextId,${context},${contextId},${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const op = {
      _key: hash(message),
      name: 'Link ContextId',
      id,
      context,
      contextId,
      sig,
      timestamp,
    };
    const res = await this.api.put(`/operations/${op._key}`, op);
    BrightId.throwOnError(res);
  }

  async getUserInfo(id: string) {
    const res = await this.api.get(`/users/${id}`);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getOperationState(opHash: string) {
    const res = await this.api.get(`/operations/${opHash}`);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getContext(context: string) {
    const res = await this.api.get(`/contexts/${context}`);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async ip(): string {
    const res = await this.api.get('/ip');
    BrightId.throwOnError(res);
    return res.data.data.ip;
  }
}

const brightId = new BrightId();

export default brightId;
