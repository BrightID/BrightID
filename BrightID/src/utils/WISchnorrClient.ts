/**
	-- WISchnorrClient.js --
	Author : Christof Torres <christof.ferreira.001@student.uni.lu>
	Date   : September 2016
* */
// import modPow from 'react-native-modpow';
import CryptoJS from 'crypto-js';
import { BigInteger } from 'jsbn';

// if (!__DEV__) {
//   console.log(`Monkey-patching BigNumber.modPow to use react-native-modpow`);
// BigInteger.prototype.modPow = function nativeModPow(e, m) {
//   const result = modPow({
//     target: this.toString(16),
//     value: e.toString(16),
//     modifier: m.toString(16),
//   });
//   return new BigInteger(result, 16);
//   };
// } else {
// console.log(`Using js implementation of BigNumber.modPow`);
// }

function sha256(s) {
  return new BigInteger(CryptoJS.SHA256(s).toString(CryptoJS.enc.Hex), 16);
}

/* Initializes the WISchnorClient based on a given public key */
function WISchnorrClient(
  this: { p: BigInteger; q: BigInteger; g: BigInteger; y: BigInteger },
  publicKey,
) {
  // Discrete logarithm parameters
  this.p = new BigInteger(publicKey.p);
  this.q = new BigInteger(publicKey.q);
  this.g = new BigInteger(publicKey.g);
  // Public key
  this.y = new BigInteger(publicKey.y);
}

/* Generates a cryptographically secure random number modulo q */
WISchnorrClient.prototype.GenerateRandomNumber = function () {
  const bytes =
    Math.floor(Math.random() * (this.q.bitLength() / 8 - 1 + 1)) + 1;
  const r = CryptoJS.lib.WordArray.random(bytes);
  const rhex = CryptoJS.enc.Hex.stringify(r);
  return new BigInteger(rhex, 16).mod(this.q);
};

/* Generates a challenge 'e' for the server */
WISchnorrClient.prototype.GenerateWISchnorrClientChallenge = function (
  params,
  info,
  msg,
): WISchnorrChallenge {
  const t1: BigInteger = this.GenerateRandomNumber();
  const t2: BigInteger = this.GenerateRandomNumber();
  const t3: BigInteger = this.GenerateRandomNumber();
  const t4: BigInteger = this.GenerateRandomNumber();

  const F = sha256(info);
  // z = F^((p-1)/q) mod p
  const z = F.modPow(
    this.p.subtract(new BigInteger('1')).divide(this.q),
    this.p,
  );
  // alpha = a * g^t1 * y^t2
  const a = new BigInteger(params.a);
  const alpha = a
    .multiply(this.g.modPow(t1, this.p))
    .multiply(this.y.modPow(t2, this.p))
    .mod(this.p);

  // beta = b * g^t3 * z^t4
  const b = new BigInteger(params.b);
  const beta = b
    .multiply(this.g.modPow(t3, this.p))
    .multiply(z.modPow(t4, this.p))
    .mod(this.p);

  const H = sha256(alpha.toString() + beta.toString() + z.toString() + msg);
  // epsilon = H mod q
  const epsilon = H.mod(this.q);

  // e = eplison - t2 - t4 mod q
  const e = epsilon.subtract(t2).subtract(t4).mod(this.q);

  return { e: e.toString(), t: { t1, t2, t3, t4 } };
};

/* Generates a WISchnorr partially blind signature based on the response from the server */
WISchnorrClient.prototype.GenerateWISchnorrBlindSignature = function (
  challenge,
  response,
): WISchnorrBlindSignature {
  // rho = r + t1 mod q
  const r = new BigInteger(response.r);
  const rho = r.add(challenge.t1).mod(this.q);

  // omega = c + t2 mod q
  const c = new BigInteger(response.c);
  const omega = c.add(challenge.t2).mod(this.q);

  // sigma = s + t3 mod q
  const s = new BigInteger(response.s);
  const sigma = s.add(challenge.t3).mod(this.q);

  // delta = d + t4 mod q
  const d = new BigInteger(response.d);
  const delta = d.add(challenge.t4).mod(this.q);

  return {
    rho: rho.toString(),
    omega: omega.toString(),
    sigma: sigma.toString(),
    delta: delta.toString(),
  };
};

/* Verifies a WISchnorr partially blind signature */
WISchnorrClient.prototype.VerifyWISchnorrBlindSignature = function (
  signature,
  info,
  msg,
) {
  const F = sha256(info);
  // z = F^((p-1)/q) mod p
  const z = F.modPow(
    this.p.subtract(new BigInteger('1')).divide(this.q),
    this.p,
  );

  // g^rho mod p
  const gp = this.g.modPow(new BigInteger(signature.rho), this.p);
  // y^omega mod p
  const yw = this.y.modPow(new BigInteger(signature.omega), this.p);
  // g^rho * y^omega mod p
  const gpyw = gp.multiply(yw).mod(this.p);

  // g^sigma mod p
  const gs = this.g.modPow(new BigInteger(signature.sigma), this.p);
  // z^delta mod p
  const zd = z.modPow(new BigInteger(signature.delta), this.p);
  // g^sigma * z^delta mod p
  const gszd = gs.multiply(zd).mod(this.p);

  const H = sha256(gpyw.toString() + gszd.toString() + z.toString() + msg);
  // hsig = H mod q
  const hsig = H.mod(this.q);

  // vsig = omega + delta mod q
  const vsig = new BigInteger(signature.omega)
    .add(new BigInteger(signature.delta))
    .mod(this.q);

  return vsig.compareTo(hsig) === 0;
};

module.exports = WISchnorrClient;
