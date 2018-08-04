import nacl from 'tweetnacl';
import store from './store';
import { setKeys } from './actions';

export default function() {
  const userAKeys = nacl.sign.keyPair();
  const userBKeys = nacl.sign.keyPair();

  store.dispatch(setKeys({ ...userAKeys, user: 'userA' }));

  store.dispatch(setKeys({ ...userBKeys, user: 'userB' }));
}
