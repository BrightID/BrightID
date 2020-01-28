// @flow

import { create, ApiSauceInstance } from 'apisauce';
import nacl from 'tweetnacl';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  b64ToUrlSafeB64,
} from '../utils/encoding';
import store from '../store';
import { createHash } from 'react-native-crypto';

let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://test.brightid.org';
}

function hash(data) {
  const h = createHash('sha256')
    .update(data)
    .digest('hex');
  const b = Buffer.from(h, 'hex').toString('base64');
  return b64ToUrlSafeB64(b);
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
    return `${this.baseUrl}/brightid`;
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
    console.log(op._key);
    const res = await this.api.put(`/operations`, op);
    BrightId.throwOnError(res);
  }

  async deleteConnection(id2: string) {
    const { id, secretKey } = store.getState();
    const timestamp = Date.now();
    const message = 'Remove Connection' + id + id2 + timestamp;
    let sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const op = {
      _key: hash(message),
      name: 'Remove Connection',
      id1: id,
      id2,
      sig1,
      timestamp,
    };
    const res = await this.api.put(`/operations`, op);
    BrightId.throwOnError(res);
  }

  async createGroup(id2: string, id3: string) {
    const { id, secretKey } = store.getState().main;
    const timestamp = Date.now();
    const message = 'Add Group' + id + id2 + id3 + timestamp;

    const sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    const op = {
      _key: hash(message),
      name: 'Add Group',
      id1: id,
      id2,
      id3,
      sig1,
      timestamp,
    };
    const res = await this.api.put(`/operations`, op);
    BrightId.throwOnError(res);
    // we can have group id here if required by sorting and joining
    // the founders ids and getting sha256 hash from that
  }

  async deleteGroup(group: string) {
    let { id, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = 'Remove Group' + id + group + timestamp;
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
    const res = await this.api.put(`/operations`, op);
    BrightId.throwOnError(res);
  }

  async joinGroup(group: string) {
    const { id, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = 'Add Membership' + id + group + timestamp;
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
    const res = await this.api.put(`/operations`, op);
    BrightId.throwOnError(res);
  }

  async leaveGroup(group: string) {
    const { id, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = 'Remove Membership' + id + group + timestamp;
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
    const res = await this.api.put(`/operations`, op);
    BrightId.throwOnError(res);
  }

  async setTrusted(trusted: string[]) {
    let { id, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message =
      'Set Trusted Connections' + id + trusted.join(',') + timestamp;
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
    const res = await this.api.put(`/operations`, op);
    BrightId.throwOnError(res);
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
    const res = await this.api.put(`/operations`, op);
    BrightId.throwOnError(res);
  }

  async linkContextId(context: string, contextId: string) {
    let { id, secretKey } = store.getState().main;
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
    const res = await this.api.put(`/operations`, op);
    BrightId.throwOnError(res);
  }

  async getMembers(group: string) {
    const res = await this.api.get(`/memberships/${group}`);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getUserInfo() {
    let { id, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = 'Get User' + id + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.get(
      `/users/${id}`,
      {},
      {
        headers: {
          'x-brightid-signature': sig,
          'x-brightid-timestamp': timestamp,
        },
      },
    );
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
