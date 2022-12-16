import nacl from 'tweetnacl';
import { verifyKeypair } from '@/utils/cryptoHelper';
import { uInt8ArrayToB64 } from '@/utils/encoding';

describe('verify keypair', () => {
  const validKeypair: Keypair = {
    publicKey: undefined,
    secretKey: undefined,
  };

  beforeAll(async () => {
    // prepare valid keypair, publicKey should be Base64-encoded
    const keypair = await nacl.sign.keyPair();
    validKeypair.publicKey = uInt8ArrayToB64(keypair.publicKey);
    validKeypair.secretKey = keypair.secretKey;
  });

  it('should fail with undefined publicKey', () => {
    const publicKey = undefined;
    const { secretKey } = validKeypair;
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).toThrowError(/publicKey undefined/);
  });

  it('should fail with non-base64 publicKey', () => {
    const publicKey = '123';
    const { secretKey } = validKeypair;
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).toThrowError(/publicKey is not base64-encoded/);
  });

  it('should fail with undefined secretKey', () => {
    const { publicKey } = validKeypair;
    const secretKey = undefined;
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).toThrowError(/secretKey undefined/);
  });

  it('should fail with undefined keypair', () => {
    const publicKey = undefined;
    const secretKey = undefined;
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).toThrowError(/undefined/);
  });

  it('should fail with short secretKey', () => {
    const { publicKey } = validKeypair;
    const secretKey = new Uint8Array(nacl.sign.secretKeyLength - 1);
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).toThrowError(/secretKey size wrong/);
  });

  it('should fail with long secretKey', () => {
    const { publicKey } = validKeypair;
    const secretKey = new Uint8Array(nacl.sign.secretKeyLength + 1);
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).toThrowError(/secretKey size wrong/);
  });

  it('should fail with short publicKey', () => {
    const { secretKey } = validKeypair;
    const publicKey = uInt8ArrayToB64(
      new Uint8Array(nacl.sign.publicKeyLength - 1),
    );
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).toThrowError(/publicKey size wrong/);
  });

  it('should fail with long publicKey', () => {
    const { secretKey } = validKeypair;
    const publicKey = uInt8ArrayToB64(
      new Uint8Array(nacl.sign.publicKeyLength + 1),
    );
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).toThrowError(/publicKey size wrong/);
  });

  it('should fail with valid but mismatched secret/public key', async () => {
    const otherKeypair = await nacl.sign.keyPair();
    const { publicKey } = validKeypair;
    const { secretKey } = otherKeypair;
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).toThrowError(/publicKey does not match secretKey/);
  });

  it('should succeed with valid keypair', () => {
    const { publicKey, secretKey } = validKeypair;
    expect(() => {
      verifyKeypair({ publicKey, secretKey });
    }).not.toThrowError();
  });
});
