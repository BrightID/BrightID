import nacl from 'tweetnacl';
import api from '../../../Api/BrightIdApi';
import { obj2b64, objToUint8, strToUint8Array } from '../../../utils/encoding';

export const connectUsers = async (userA, userB) => {
  try {
    // return alert(JSON.stringify(objToUint8(userA.secretKey)));
    let timestamp = Date.now();
    let publicKeyStr1 = api.urlSafe(obj2b64(userA.publicKey));
    let publicKeyStr2 = api.urlSafe(obj2b64(userB.publicKey));

    let message = publicKeyStr1 + publicKeyStr2 + timestamp;
    let sig1 = obj2b64(
      nacl.sign.detached(strToUint8Array(message), objToUint8(userA.secretKey)),
    );
    // return alert(sig1);

    let sig2 = obj2b64(
      nacl.sign.detached(strToUint8Array(message), objToUint8(userB.secretKey)),
    );

    let result = await api.createConnection(
      userA.publicKey,
      sig1,
      userB.publicKey,
      sig2,
      timestamp,
    );
    console.log(result);
    return timestamp;
  } catch (err) {
    alert(
      JSON.stringify(
        {
          message: err.message,
          stack: err.stack,
          err,
        },
        null,
        4,
      ),
    );
  }
};
