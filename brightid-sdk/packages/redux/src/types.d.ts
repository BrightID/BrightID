// TODO: find a better solution for this issue https://github.com/microsoft/TypeScript/issues/47663#issuecomment-1962129199
/// <reference types="immer" />

type KeypairState = {
  publicKey: string;
  secretKey: Uint8Array;
};

interface WithKeypairState {
  keypair: KeypairState;
}
