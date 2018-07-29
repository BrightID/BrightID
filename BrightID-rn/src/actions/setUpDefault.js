// @flow

import {
  userTrustScore,
  setGroupsCount,
  setConnections,
  setUserData,
} from './index';

/**
 * Sets the app up with dummy data
 * based on the project's spec found in the wiki
 * Using https://mockaroo.com/ to mock data
 *
 * This function is called in App.js
 */

export const setUpDefault = (userData: Object) => async (
  dispatch: Function,
) => {
  // async is unncessary here, but this is a useful template for handling the API
  try {
    // disptaches the getUserData action from actions/storage.js
    // this is an async action will a lot of important functionality for the app
    // dispatch(getUserData());
    // console.warn(userData);
    if (
      userData.hasOwnProperty('publicKey') &&
      userData.hasOwnProperty('secretKey') &&
      userData.hasOwnProperty('nameornym') &&
      userData.hasOwnProperty('userAvatar')
    ) {
      dispatch(setUserData(userData));
    }

    // populate the app with dummy data for now
    dispatch(userTrustScore('99.9'));
    dispatch(setGroupsCount(64));
    dispatch(
      setConnections([
        {
          publicKey: '6f4a37bf-09f8-4167-b306-ce6ad3526d3a',
          secretKey:
            'b2d16e7d2350502f6f274d76a9557793069af573d75d6719c3a2b68275da6bff',
          nameornym: 'Jolie McVane',
          avatar:
            'https://robohash.org/undeofficiisnon.png?size=145x145&set=set1',
          connectionDate: '1452035995',
          trustScore: 94.2,
        },
        {
          publicKey: '8e0f9bcc-3aed-4ddf-aaa3-e508e5297ed0',
          secretKey:
            '433dc03f55c62639c7834ce0340f15a294094ddc0356bf2f9803a1bbf77f92f7',
          nameornym: 'Georgette Brownhill',
          avatar:
            'https://robohash.org/temporibussitdolor.jpg?size=145x145&set=set1',
          connectionDate: '1460122008',
          trustScore: 80.5,
        },
        {
          publicKey: '86243fda-ab10-4d79-a950-86f787cfe33e',
          secretKey:
            '9de997f6a8a4f9e7e95754fe28f9074d716a1b721f555e17f9d0a9ffab603e1b',
          nameornym: 'Miquela Arden',
          avatar:
            'https://robohash.org/evenietautexcepturi.bmp?size=145x145&set=set1',
          connectionDate: '1468000912',
          trustScore: 72.3,
        },
        {
          publicKey: 'f761e34b-a42b-4b6f-a0ef-3561dc719925',
          secretKey:
            '636b07c46fd93576dd4fa8ec2b82f655b28efa23f604c7638694dad237af18a0',
          nameornym: 'Emory Liven',
          avatar:
            'https://robohash.org/quisrerumsint.jpg?size=145x145&set=set1',
          connectionDate: '1388433658',
          trustScore: 75.8,
        },
        {
          publicKey: '79ad3a18-af86-4cd1-8d4a-0f25183af88d',
          secretKey:
            '5707f2d4448d4f304f0d2c609e7e33ccafe0c4ea5e6a66cfe0ddfb6eae310f5c',
          nameornym: 'Halimeda Vignaux',
          avatar:
            'https://robohash.org/voluptatemetaperiam.jpg?size=145x145&set=set1',
          connectionDate: '1384979985',
          trustScore: 73.8,
        },
        {
          publicKey: 'dc1df32e-a805-433e-84d7-49d8f920b6ee',
          secretKey:
            '8efabd3194871513b7ea06354132cdb82af9ed6b9829411cde9c516c708736c2',
          nameornym: 'Alyssa Langsdon',
          avatar:
            'https://robohash.org/velitestrepudiandae.bmp?size=145x145&set=set1',
          connectionDate: '1439836420',
          trustScore: 53.4,
        },
        {
          publicKey: '3038798b-1134-437c-8e6c-138d59e7567e',
          secretKey:
            'e32a26b21c3f8902b59f9fb43a1d11e9f9cfb6a0d50a1f0766f9ef1bf30318e4',
          nameornym: 'Judith Hriinchenko',
          avatar:
            'https://robohash.org/totamporroodio.bmp?size=145x145&set=set1',
          connectionDate: '1372055295',
          trustScore: 67.5,
        },
        {
          publicKey: '2d59ff27-5d9c-4b45-9fc1-a7696f37ccef',
          secretKey:
            'fc7ac82cb5f886a5233e116174d934db8f910e2bed5487636e8094f523f3b410',
          nameornym: 'Kele Ludwikiewicz',
          avatar:
            'https://robohash.org/quisquamofficiisnon.png?size=145x145&set=set1',
          connectionDate: '1431542215',
          trustScore: 81.7,
        },
        {
          publicKey: '91ac0c90-d190-459b-b323-f11884f762aa',
          secretKey:
            '8ca15fa795d064946335c45f016c773ee1bbfc88b2eb861911d23759c6c92c96',
          nameornym: 'Pryce Hallatt',
          avatar: 'https://robohash.org/idsitnon.png?size=145x145&set=set1',
          connectionDate: '1505229487',
          trustScore: 51.8,
        },
        {
          publicKey: '2c2e3f7c-07cb-472c-84cf-c311979d7bb7',
          secretKey:
            '087a40934a926a54cbbad82bb044081cbc4dd4ee2483e5d3c1d8f7ede02b7db6',
          nameornym: 'Alvy Gilman',
          avatar:
            'https://robohash.org/accusantiumveritatisest.bmp?size=145x145&set=set1',
          connectionDate: '1374959168',
          trustScore: 79.7,
        },
        {
          publicKey: 'a692c88f-a4da-43df-a012-d7f0cab491a2',
          secretKey:
            '89923f63a0609929d116dced0c78f7ac3fe17cdf016bed5a6a985c578f7b9be3',
          nameornym: 'Catriona Wasiel',
          avatar:
            'https://robohash.org/modilaborumsed.bmp?size=145x145&set=set1',
          connectionDate: '1379627892',
          trustScore: 87.8,
        },
        {
          publicKey: '4c7e56a5-94cb-4c3f-bd55-4a92b8bc1c97',
          secretKey:
            '4c2bb1ff1f93a69c8c4c148a6e1e546e91db08cceb85cd149884a56ee593069b',
          nameornym: 'Alikee Osbaldstone',
          avatar:
            'https://robohash.org/doloremodioquam.bmp?size=145x145&set=set1',
          connectionDate: '1359291224',
          trustScore: 71.0,
        },
        {
          publicKey: 'a50bdc33-5965-40a8-8c9c-34a8d355018c',
          secretKey:
            '353f02c082d6f8318d7b178232da6058e0a84c08f2f648f534b969e227eeedcf',
          nameornym: 'Hersch Campion',
          avatar:
            'https://robohash.org/itaqueplaceatexplicabo.jpg?size=145x145&set=set1',
          connectionDate: '1405409270',
          trustScore: 63.8,
        },
        {
          publicKey: 'c6b6e9ed-0141-4729-b748-9f76bed30fc7',
          secretKey:
            '9c0d30ab75acc38f1346b6ea77f267f43f81bbb7300fce74306110dae3a63e73',
          nameornym: 'Darnall Jenyns',
          avatar:
            'https://robohash.org/eiussequivoluptatum.jpg?size=145x145&set=set1',
          connectionDate: '1463122609',
          trustScore: 99.1,
        },
        {
          publicKey: '4b392e6e-d6c1-45dd-98ac-5aec3167ee39',
          secretKey:
            'd320e37cbd0d20e320b69defd15aa634a899b83e4db7af7fa4097bcb2cd5a492',
          nameornym: 'Elaine Braley',
          avatar:
            'https://robohash.org/mollitiaexsed.png?size=145x145&set=set1',
          connectionDate: '1445648037',
          trustScore: 76.7,
        },
        {
          publicKey: 'df9072db-c0fa-4f92-9a69-b91a710069ee',
          secretKey:
            'acdfb773079d46ce01d65a17f79b1030cdda0cef6bb47cd833142c79aa725dc1',
          nameornym: 'Bambie Bernot',
          avatar:
            'https://robohash.org/atquesintvoluptates.jpg?size=145x145&set=set1',
          connectionDate: '1408211906',
          trustScore: 51.5,
        },
        {
          publicKey: '2d1c677b-624b-4b94-9c29-641810b4ad29',
          secretKey:
            '2c4768b6870c292d58611bfddc0f837ca27ccc08a0da2be73866fb45f0353f3d',
          nameornym: 'Zak Conville',
          avatar:
            'https://robohash.org/inciduntmolestiasoptio.png?size=145x145&set=set1',
          connectionDate: '1443710319',
          trustScore: 57.9,
        },
        {
          publicKey: '9f7803aa-f5d3-4e16-9191-307a125c8742',
          secretKey:
            '9fbb04da75471471e9ad4dc4735288c2625fa8e56233ae36b163d59c6a727d3d',
          nameornym: 'Gilbertine Olifard',
          avatar:
            'https://robohash.org/ametsolutanisi.jpg?size=145x145&set=set1',
          connectionDate: '1430685304',
          trustScore: 61.3,
        },
        {
          publicKey: '912a8617-f716-4b25-978d-543eddb6078c',
          secretKey:
            'fc7a6d15c6e72240221c55c19e9c941bc7dec68e63ad6674b1835e77fa5d09b8',
          nameornym: 'Vivia Stodart',
          avatar:
            'https://robohash.org/blanditiisinvero.jpg?size=145x145&set=set1',
          connectionDate: '1469496922',
          trustScore: 85.3,
        },
        {
          publicKey: 'aa707876-a0c1-4e23-9d18-5805fd81674b',
          secretKey:
            '43afbdc4a4e97e1b8fdde253d48d6b80805103b8254aa157aae19f7995529a0f',
          nameornym: 'Letizia Thomson',
          avatar:
            'https://robohash.org/doloremnihileligendi.bmp?size=145x145&set=set1',
          connectionDate: '1486453778',
          trustScore: 74.9,
        },
        {
          publicKey: 'f89ea350-bed8-4a6f-ac70-de169f121dd7',
          secretKey:
            'b0fd4c8cc64e26d6af969b0ad3dc68a15828151dfb8736c9331371184b79cb5c',
          nameornym: 'Emilee Sidney',
          avatar:
            'https://robohash.org/illumadistinctio.bmp?size=145x145&set=set1',
          connectionDate: '1441088359',
          trustScore: 53.2,
        },
        {
          publicKey: '2383b0ae-3351-4c6a-8c11-62639626dfe1',
          secretKey:
            '38bda739db0f01265232117b7d10cc3646acc1b3ee77d5dc20d15649224f1f45',
          nameornym: 'Augie Salvadore',
          avatar:
            'https://robohash.org/eosaccusamuseos.jpg?size=145x145&set=set1',
          connectionDate: '1477635766',
          trustScore: 52.2,
        },
        {
          publicKey: 'f8aad9f6-a446-4dba-ae40-d37f02e8fd7a',
          secretKey:
            'fa8e1f3932b102a3bae91e628d0d10c0822b8e17ee402c96b7299a9c79aad29d',
          nameornym: 'Cynde Danilchik',
          avatar:
            'https://robohash.org/eaquelaboriosamvelit.jpg?size=145x145&set=set1',
          connectionDate: '1434290503',
          trustScore: 64.9,
        },
      ]),
    );
    // dispatch(
    //   setConnections([
    //     {
    //       id: 1,
    //       firstName: 'Keslie',
    //       lastName: 'Klimko',
    //       avatar: 'https://robohash.org/etquosit.jpg?size=145x145&set=set1',
    //       connectionDate: '2016-03-20T03:08:33Z',
    //       trustScore: 83.8,
    //     },
    //     {
    //       id: 2,
    //       firstName: 'Heath',
    //       lastName: 'Miall',
    //       avatar:
    //         'https://robohash.org/autrepellenduscommodi.png?size=145x145&set=set1',
    //       connectionDate: '2013-11-17T06:07:44Z',
    //       trustScore: 89.1,
    //     }
    //   ]),
    // );
  } catch (err) {
    console.log(err);
  }
};

export const whatever = 'whatever';
