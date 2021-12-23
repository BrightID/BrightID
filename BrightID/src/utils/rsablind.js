"use strict";

var CryptoJS = require('crypto-js');
var BigInteger = require('jsbn').BigInteger;
var sha256 = require('js-sha256');

function keyProperties(key) {
  return {
    E: new BigInteger(key.keyPair.e.toString()),
    N: key.keyPair.n,
    D: key.keyPair.d
  };
}

function messageToHash(message) {
  var messageHash = sha256(message);
  return messageHash;
}

function messageToHashInt(message) {
  var messageHash = messageToHash(message);
  var messageBig = new BigInteger(messageHash, 16);
  return messageBig;
}

function blind(_ref) {
  var message = _ref.message,
    key = _ref.key,
    N = _ref.N,
    E = _ref.E;
  var messageHash = messageToHashInt(message);
  N = key ? key.keyPair.n : new BigInteger(N.toString());
  E = key ? new BigInteger(key.keyPair.e.toString()) : new BigInteger(E.toString());
  var bigOne = new BigInteger('1');
  var gcd;
  var r;

  do {
    r = new BigInteger(CryptoJS.lib.WordArray.random(64).toString(CryptoJS.enc.Hex), 16).mod(N);
    gcd = r.gcd(N);
  } while (!gcd.equals(bigOne) || r.compareTo(N) >= 0 || r.compareTo(bigOne) <= 0);

  var blinded = messageHash.multiply(r.modPow(E, N)).mod(N);
  return {
    blinded: blinded,
    r: r
  };
}

function sign(_ref2) {
  var blinded = _ref2.blinded,
    key = _ref2.key;

  var _keyProperties = keyProperties(key),
    N = _keyProperties.N,
    D = _keyProperties.D;

  blinded = new BigInteger(blinded.toString());
  var signed = blinded.modPow(D, N);
  return signed;
}

function unblind(_ref3) {
  var signed = _ref3.signed,
    key = _ref3.key,
    r = _ref3.r,
    N = _ref3.N;
  r = new BigInteger(r.toString());
  N = key ? key.keyPair.n : new BigInteger(N.toString());
  signed = new BigInteger(signed.toString());
  var unblinded = signed.multiply(r.modInverse(N)).mod(N);
  return unblinded;
}

function verify(_ref4) {
  var unblinded = _ref4.unblinded,
    key = _ref4.key,
    message = _ref4.message,
    E = _ref4.E,
    N = _ref4.N;
  unblinded = new BigInteger(unblinded.toString());
  var messageHash = messageToHashInt(message);
  N = key ? key.keyPair.n : new BigInteger(N.toString());
  E = key ? new BigInteger(key.keyPair.e.toString()) : new BigInteger(E.toString());
  var originalMsg = unblinded.modPow(E, N);
  var result = messageHash.equals(originalMsg);
  return result;
}

function verify2(_ref5) {
  var unblinded = _ref5.unblinded,
    key = _ref5.key,
    message = _ref5.message;
  unblinded = new BigInteger(unblinded.toString());
  var messageHash = messageToHashInt(message);

  var _keyProperties2 = keyProperties(key),
    D = _keyProperties2.D,
    N = _keyProperties2.N;

  var msgSig = messageHash.modPow(D, N);
  var result = unblinded.equals(msgSig);
  return result;
}

function verifyBlinding(_ref6) {
  var blinded = _ref6.blinded,
    r = _ref6.r,
    unblinded = _ref6.unblinded,
    key = _ref6.key,
    E = _ref6.E,
    N = _ref6.N;
  var messageHash = messageToHashInt(unblinded);
  r = new BigInteger(r.toString());
  N = key ? key.keyPair.n : new BigInteger(N.toString());
  E = key ? new BigInteger(key.keyPair.e.toString()) : new BigInteger(E.toString());
  var blindedHere = messageHash.multiply(r.modPow(E, N)).mod(N);
  var result = blindedHere.equals(blinded);
  return result;
}

module.exports = {
  messageToHash: messageToHash,
  blind: blind,
  sign: sign,
  unblind: unblind,
  verify: verify,
  verify2: verify2,
  verifyBlinding: verifyBlinding
};
