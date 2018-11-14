// @flow

import nacl from 'tweetnacl';
import { userTrustScore, setGroupsCount, setUserData } from './index';

/**
 * Sets the app up with dummy data
 * based on the project's spec found in the wiki
 * Using https://mockaroo.com/ to mock data
 *
 * This function is called in App.js
 */

export const setUpDefault = (userData: Object) => async (
  dispatch: () => null,
) => {
  // async is unncessary here, but this is a useful template for handling the API
  try {
    // disptaches the getUserData action from actions/storage.js
    // this is an async action will a lot of important functionality for the app
    // dispatch(getUserData());
    // console.log(userData);
    if (
      userData.hasOwnProperty('publicKey') &&
      userData.hasOwnProperty('secretKey') &&
      userData.hasOwnProperty('nameornym')
    ) {
      dispatch(setUserData(userData));
    }

    // populate the app with dummy data for now
    dispatch(userTrustScore('99.9'));
    dispatch(setGroupsCount(64));
  } catch (err) {
    console.log(err);
  }
};

export const sampleConnections: Array<{}> = [
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      'b2d16e7d2350502f6f274d76a9557793069af573d75d6719c3a2b68275da6bff',
    nameornym: 'Jolie McVane',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1452035995000',
    trustScore: 94.2,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '433dc03f55c62639c7834ce0340f15a294094ddc0356bf2f9803a1bbf77f92f7',
    nameornym: 'Georgette Brownhill',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1460122008000',
    trustScore: 80.5,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '9de997f6a8a4f9e7e95754fe28f9074d716a1b721f555e17f9d0a9ffab603e1b',
    nameornym: 'Miquela Arden',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1468000912000',
    trustScore: 72.3,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '636b07c46fd93576dd4fa8ec2b82f655b28efa23f604c7638694dad237af18a0',
    nameornym: 'Emory Liven',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1388433658000',
    trustScore: 75.8,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '5707f2d4448d4f304f0d2c609e7e33ccafe0c4ea5e6a66cfe0ddfb6eae310f5c',
    nameornym: 'Halimeda Vignaux',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1384979985000',
    trustScore: 73.8,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '8efabd3194871513b7ea06354132cdb82af9ed6b9829411cde9c516c708736c2',
    nameornym: 'Alyssa Langsdon',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1439836420000',
    trustScore: 53.4,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      'e32a26b21c3f8902b59f9fb43a1d11e9f9cfb6a0d50a1f0766f9ef1bf30318e4',
    nameornym: 'Judith Hriinchenko',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1372055295000',
    trustScore: 67.5,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      'fc7ac82cb5f886a5233e116174d934db8f910e2bed5487636e8094f523f3b410',
    nameornym: 'Kele Ludwikiewicz',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1431542215000',
    trustScore: 81.7,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '8ca15fa795d064946335c45f016c773ee1bbfc88b2eb861911d23759c6c92c96',
    nameornym: 'Pryce Hallatt',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1505229487000',
    trustScore: 51.8,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '087a40934a926a54cbbad82bb044081cbc4dd4ee2483e5d3c1d8f7ede02b7db6',
    nameornym: 'Alvy Gilman',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1374959168000',
    trustScore: 79.7,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '89923f63a0609929d116dced0c78f7ac3fe17cdf016bed5a6a985c578f7b9be3',
    nameornym: 'Catriona Wasiel',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1379627892000',
    trustScore: 87.8,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '4c2bb1ff1f93a69c8c4c148a6e1e546e91db08cceb85cd149884a56ee593069b',
    nameornym: 'Alikee Osbaldstone',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1359291224000',
    trustScore: 71.0,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '353f02c082d6f8318d7b178232da6058e0a84c08f2f648f534b969e227eeedcf',
    nameornym: 'Hersch Campion',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1405409270000',
    trustScore: 63.8,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '9c0d30ab75acc38f1346b6ea77f267f43f81bbb7300fce74306110dae3a63e73',
    nameornym: 'Darnall Jenyns',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1463122609000',
    trustScore: 99.1,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      'd320e37cbd0d20e320b69defd15aa634a899b83e4db7af7fa4097bcb2cd5a492',
    nameornym: 'Elaine Braley',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1445648037000',
    trustScore: 76.7,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      'acdfb773079d46ce01d65a17f79b1030cdda0cef6bb47cd833142c79aa725dc1',
    nameornym: 'Bambie Bernot',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1408211906000',
    trustScore: 51.5,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '2c4768b6870c292d58611bfddc0f837ca27ccc08a0da2be73866fb45f0353f3d',
    nameornym: 'Zak Conville',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1443710319000',
    trustScore: 57.9,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '9fbb04da75471471e9ad4dc4735288c2625fa8e56233ae36b163d59c6a727d3d',
    nameornym: 'Gilbertine Olifard',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1430685304000',
    trustScore: 61.3,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      'fc7a6d15c6e72240221c55c19e9c941bc7dec68e63ad6674b1835e77fa5d09b8',
    nameornym: 'Vivia Stodart',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1469496922000',
    trustScore: 85.3,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '43afbdc4a4e97e1b8fdde253d48d6b80805103b8254aa157aae19f7995529a0f',
    nameornym: 'Letizia Thomson',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1486453778000',
    trustScore: 74.9,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      'b0fd4c8cc64e26d6af969b0ad3dc68a15828151dfb8736c9331371184b79cb5c',
    nameornym: 'Emilee Sidney',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1441088359000',
    trustScore: 53.2,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      '38bda739db0f01265232117b7d10cc3646acc1b3ee77d5dc20d15649224f1f45',
    nameornym: 'Augie Salvadore',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1477635766000',
    trustScore: 52.2,
  },
  {
    publicKey: nacl.sign.keyPair().publicKey,
    secretKey:
      'fa8e1f3932b102a3bae91e628d0d10c0822b8e17ee402c96b7299a9c79aad29d',
    nameornym: 'Cynde Danilchik',
    avatar: 'https://loremflickr.com/180/180',
    connectionDate: '1434290503000',
    trustScore: 64.9,
  },
];
