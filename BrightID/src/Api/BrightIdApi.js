import {create} from 'apisauce';
import {obj2b64, strToUint8Array} from "../utils/encoding";
import store from "../store";
import nacl from 'tweetnacl';

const api = create({
    baseURL: 'http://anti-sybil.eastus2.cloudapp.azure.com/brightid/',
    // baseURL: 'http://104.207.144.107/brightid/',

    // headers: {'Accept': 'application/json'}
})

function urlSafe(str) {
    return str.replace(/\=/g, "").replace(/\//g, "_").replace(/\+/g, "-");
}

function noContentResponse(response) {
    return {
        success: response.status == 204,
        ok: response.ok,
        status: response.status,
        data: response.data
    }
}

function createConnection(publicKey1, sig1, publicKey2, sig2, timestamp) {
    let requestParams = {
        publicKey1: urlSafe(obj2b64(publicKey1)),
        publicKey2: urlSafe(obj2b64(publicKey2)),
        sig1,
        sig2,
        timestamp
    };
    return api.put(`/connections`, requestParams)
        .then(response => noContentResponse(response))
        .catch(error => {
            return error.data ? error.data : error;
        });
}

function deleteConnection(publicKey1, publicKey2) {
    let sig1 = 'sample sig';
    let requestParams = {
        publicKey1: urlSafe(obj2b64(publicKey1)),
        publicKey2: urlSafe(obj2b64(publicKey2)),
        sig1,
        timestamp: Date.now()
    };
    return api.delete(`/connections`, {}, {data: requestParams})
        .then(response => noContentResponse(response))
        .catch(error => {
            return error.data ? error.data : error;
        });
}

function joinAGroup(groupId) {
    let {publicKey, secretKey} = store.getState().main;
    let timestamp = Date.now();
    let publicKeyStr = urlSafe(obj2b64(publicKey));
    let message = publicKeyStr + groupId + timestamp;
    let sig = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));

    let requestParams = {
        publicKey: publicKeyStr,
        group: groupId,
        sig,
        timestamp
    };
    console.log("====================",requestParams);
    return api.put(`/membership`, requestParams)
        .then(response => noContentResponse(response))
        .catch(error => {
            return error.data ? error.data : error;
        });
}

function leaveAGroup(groupId) {
    let {publicKey, secretKey} = store.getState().main;
    let timestamp = Date.now();
    let publicKeyStr = urlSafe(obj2b64(publicKey));
    let message = publicKeyStr + timestamp;
    let sig = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));

    let requestParams = {
        publicKey: publicKeyStr,
        group: groupId,
        sig,
        timestamp
    };
    return api.delete(`/membership`, {}, {data: requestParams})
        .then(response => noContentResponse(response))
        .catch(error => {
            return error.data ? error.data : error;
        });
}

function createUser(publicKey) {
    let b64PublicKey = urlSafe(obj2b64(publicKey))
    return api.post('/users', {publicKey: b64PublicKey})
        .then(response => response.data)
        .catch(error => {
            return error.data ? error.data : error;
        });
}

function getUserInfo() {
    let {publicKey, secretKey} = store.getState().main;
    let timestamp = Date.now();
    let publicKeyStr = urlSafe(obj2b64(publicKey));
    let message = publicKeyStr + timestamp;
    let sig = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));
    return api.post(`/fetchUserInfo`, {publicKey: publicKeyStr, sig, timestamp})
        .then(response => response.data)
        .catch(error => {
            return error.data ? error.data : error;
        });
}

function createGroup(publicKey1, publicKey2, publicKey3) {
    let {publicKey, secretKey} = store.getState().main;
    let timestamp = Date.now();
    let message = urlSafe(obj2b64(publicKey1)) + urlSafe(obj2b64(publicKey2)) + urlSafe(obj2b64(publicKey3)) + timestamp;
    let sig1 = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));

    let requestParams = {
        publicKey1: urlSafe(obj2b64(publicKey1)),
        publicKey2: urlSafe(obj2b64(publicKey2)),
        publicKey3: urlSafe(obj2b64(publicKey3)),
        sig1,
        timestamp
    };
    return api.post(`/groups`, requestParams)
        .then(response => response.data)
        .catch(error => {
            return error.data ? error.data : error;
        });
}

function deleteGroup(groupId) {
    let {publicKey, secretKey} = store.getState().main;
    let timestamp = Date.now();
    let publicKeyStr = urlSafe(obj2b64(publicKey));
    let message = publicKeyStr + groupId + timestamp;
    let sig = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));

    let requestParams = {
        publicKey: publicKeyStr,
        group: groupId,
        sig,
        timestamp
    };
    return api.delete(`/groups`, {}, {data: requestParams})
        .then(response => noContentResponse(response))
        .catch(error => {
            return error.data ? error.data : error;
        });
}

export default {
    urlSafe: urlSafe,
    createConnection: createConnection,
    deleteConnection: deleteConnection,
    joinAGroup: joinAGroup,
    leaveAGroup: leaveAGroup,
    createGroup: createGroup,
    deleteGroup: deleteGroup,
    getUserInfo: getUserInfo,
    createUser: createUser,
}