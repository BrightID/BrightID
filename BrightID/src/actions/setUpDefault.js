// @flow

import nacl from 'tweetnacl';
import { userTrustScore, setGroupsCount, setUserData } from './index';
import {b64ToUint8Array} from '../utils/encoding';

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

export const sampleConnections: [
  {
    publicKey: Uint8Array,
    secreKey: Uint8Array,
    nameornym: string,
    avatar: string,
    connectionDate: string,
    trustScore: number,
  },
] = [
    {
        publicKey: b64ToUint8Array("Khtd3HxE9d7b2UNnHHuUYFuk3r+EGE7X8Iozx2UjYoQ="),
        secretKey: b64ToUint8Array("Fj3bXo4qauE8diJdLTgqkaol/fTMI7tYZ6iSx+pjla8qG13cfET13tvZQ2cce5RgW6Tev4QYTtfwijPHZSNihA=="),
        nameornym: "Jolie McVane",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1452035995000",
        trustScore: 94.2
    },
    {
        publicKey: b64ToUint8Array("jdOfVCFDBNX1Yj47Kn4c4xf3oB6p87V9Ja2xbuh5UHY="),
        secretKey: b64ToUint8Array("9FEzXoUeagCP84BSGWssd2ifUqTuGwMAWgjkYfcMm3yN059UIUME1fViPjsqfhzjF/egHqnztX0lrbFu6HlQdg=="),
        nameornym: "Georgette Brownhill",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1460122008000",
        trustScore: 80.5
    },
    {
        publicKey: b64ToUint8Array("bhksTtMHdPQkhZ6jWUEdH7uftOVMaN7Y7b7IpEnjlCQ="),
        secretKey: b64ToUint8Array("aSyJMQjp2+a5/zJJA9WrvR172cqFGWzpeh/33PR1+NluGSxO0wd09CSFnqNZQR0fu5+05Uxo3tjtvsikSeOUJA=="),
        nameornym: "Miquela Arden",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1468000912000",
        trustScore: 72.3
    },
    {
        publicKey: b64ToUint8Array("AvWJvoze928gxXEahsouwagM9aFmsZ1C6A6DkF94eDY="),
        secretKey: b64ToUint8Array("2CEQvKYO9a1sZdEtksCJ3nUQ0hMcg1SguRv4zR2JH34C9Ym+jN73byDFcRqGyi7BqAz1oWaxnULoDoOQX3h4Ng=="),
        nameornym: "Emory Liven",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1388433658000",
        trustScore: 75.8
    },
    {
        publicKey: b64ToUint8Array("B6dGI1Euhvp3LADSmxl9tH0pF6n12M1ml85xiweYYxk="),
        secretKey: b64ToUint8Array("iu+0H8I+YQRHhcKHtvqR8kTjZlGvmSuZnrsmYM8ihtkHp0YjUS6G+ncsANKbGX20fSkXqfXYzWaXznGLB5hjGQ=="),
        nameornym: "Halimeda Vignaux",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1384979985000",
        trustScore: 73.8
    },
    {
        publicKey: b64ToUint8Array("j7yCkluhCdXzWuW/gMe1Jtm0WoCd160CWTONMQs3zUo="),
        secretKey: b64ToUint8Array("Kl7gK418L7cXoLBB3XpaVI+AGaBtD80mK220LH448FaPvIKSW6EJ1fNa5b+Ax7Um2bRagJ3XrQJZM40xCzfNSg=="),
        nameornym: "Alyssa Langsdon",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1439836420000",
        trustScore: 53.4
    },
    {
        publicKey: b64ToUint8Array("HI7KdEP4sgJyo4SYsMs4RKgYGVpkwZLaTbGaMOlGeeM="),
        secretKey: b64ToUint8Array("GaVeSnpj/9plql/1EExGhwi16gdYfuV+10k6NylAT1Ucjsp0Q/iyAnKjhJiwyzhEqBgZWmTBktpNsZow6UZ54w=="),
        nameornym: "Judith Hriinchenko",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1372055295000",
        trustScore: 67.5
    },
    {
        publicKey: b64ToUint8Array("EoswXdcM6NkvadzTHd1dooW7ERwsgFDLvGoGlteL/DI="),
        secretKey: b64ToUint8Array("iVUEdCXsrcqw5RPVFyKHYIL5xj0UAdu5bJYhZlM4QKsSizBd1wzo2S9p3NMd3V2ihbsRHCyAUMu8agaW14v8Mg=="),
        nameornym: "Kele Ludwikiewicz",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1431542215000",
        trustScore: 81.7
    },
    {
        publicKey: b64ToUint8Array("1fL4kiPyDQEqfuuA6TY4U+/q4iv9ZjbnIhhauBm/jTc="),
        secretKey: b64ToUint8Array("VGY74wnwO1lINZaP8gOVzlMVu4/7/79ubCfXtO+dQHrV8viSI/INASp+64DpNjhT7+riK/1mNuciGFq4Gb+NNw=="),
        nameornym: "Pryce Hallatt",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1505229487000",
        trustScore: 51.8
    },
    {
        publicKey: b64ToUint8Array("yjKpaB2iXY+jkMRbJrC0j0jG6gXA1a5PUAd02gmEEfU="),
        secretKey: b64ToUint8Array("2Lxh3YB/1GGCzKpNnaPn1+jkrV1rfMdr+vFKHyJfZVHKMqloHaJdj6OQxFsmsLSPSMbqBcDVrk9QB3TaCYQR9Q=="),
        nameornym: "Alvy Gilman",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1374959168000",
        trustScore: 79.7
    },
    {
        publicKey: b64ToUint8Array("qgo/VSErh0NobUkbsF+gqRo83emW18Oa9FGUnieMavk="),
        secretKey: b64ToUint8Array("EwOY2RZZ8DW0Xt28iymvQz8E3h9p/8uLYA0dEsUpxMGqCj9VISuHQ2htSRuwX6CpGjzd6ZbXw5r0UZSeJ4xq+Q=="),
        nameornym: "Catriona Wasiel",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1379627892000",
        trustScore: 87.8
    },
    {
        publicKey: b64ToUint8Array("JxgCE6Bu4GaRuop4jvuoyaoCzn65HyLToBHzmMTdYXQ="),
        secretKey: b64ToUint8Array("cRHQm63HFHLy36vickgcMkUVdUEu7XElLTdej1HuLpsnGAIToG7gZpG6iniO+6jJqgLOfrkfItOgEfOYxN1hdA=="),
        nameornym: "Alikee Osbaldstone",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1359291224000",
        trustScore: 71
    },
    {
        publicKey: b64ToUint8Array("21yHiiO0otNyc72Ebe7iHcMlTXNalq0ubjgUZdN6QbU="),
        secretKey: b64ToUint8Array("retfHB49HnQQROWc4Uq5Jr2KpvBaI8ND2+y95QSuh7fbXIeKI7Si03JzvYRt7uIdwyVNc1qWrS5uOBRl03pBtQ=="),
        nameornym: "Hersch Campion",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1405409270000",
        trustScore: 63.8
    },
    {
        publicKey: b64ToUint8Array("olbLFd/6vlJPZKazFgRQfkdS0i8Sr5e1Fui65+SPX/c="),
        secretKey: b64ToUint8Array("PGnMiAldZpOZHp3Eq7BJTufgq+afKuS499wgtO7lOE+iVssV3/q+Uk9kprMWBFB+R1LSLxKvl7UW6Lrn5I9f9w=="),
        nameornym: "Darnall Jenyns",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1463122609000",
        trustScore: 99.1
    },
    {
        publicKey: b64ToUint8Array("6JMgUfY9qvwQBJd7jDo0zzXOoQq1SBYKyV3x9Rv38JQ="),
        secretKey: b64ToUint8Array("rjkif6ZQY6TE3xCvFxjwYZRsM8TAYs+PN1CDAt3oo9HokyBR9j2q/BAEl3uMOjTPNc6hCrVIFgrJXfH1G/fwlA=="),
        nameornym: "Elaine Braley",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1445648037000",
        trustScore: 76.7
    },
    {
        publicKey: b64ToUint8Array("7WtFYkGyPxpp8PkCiI2V0gn0Fz0LtTgaKrcUkaYSn7Q="),
        secretKey: b64ToUint8Array("l85igAyDqk7Xx3c1YEpQmXRd+7GYrYbFlpWti2/2WCHta0ViQbI/Gmnw+QKIjZXSCfQXPQu1OBoqtxSRphKftA=="),
        nameornym: "Bambie Bernot",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1408211906000",
        trustScore: 51.5
    },
    {
        publicKey: b64ToUint8Array("c6LyVv0iAi/TyzSAonykxzfbEHb7hZf0NrMePNFZATs="),
        secretKey: b64ToUint8Array("NXSX2U/1M4N1OgLeVFqpd2J/Xf/1FEEuySHLVHJ+TUdzovJW/SICL9PLNICifKTHN9sQdvuFl/Q2sx480VkBOw=="),
        nameornym: "Zak Conville",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1443710319000",
        trustScore: 57.9
    },
    {
        publicKey: b64ToUint8Array("8hUAiK/21efOtU00Zdu32ZXYxL8Kuki7l5rEJneoVts="),
        secretKey: b64ToUint8Array("ViwqzlDwImzWdQlS1hIU6PpgAAoMHW0dx70vYIHwOV/yFQCIr/bV5861TTRl27fZldjEvwq6SLuXmsQmd6hW2w=="),
        nameornym: "Gilbertine Olifard",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1430685304000",
        trustScore: 61.3
    },
    {
        publicKey: b64ToUint8Array("NQxypl8E21+cWs97aQ5JcTUdLszreE5qKYn+BjD9Qbk="),
        secretKey: b64ToUint8Array("d6gX5hh5Eg0dP+Cnx9wcWj/8hBdBUc0znkj0Th6c2mo1DHKmXwTbX5xaz3tpDklxNR0uzOt4Tmopif4GMP1BuQ=="),
        nameornym: "Vivia Stodart",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1469496922000",
        trustScore: 85.3
    },
    {
        publicKey: b64ToUint8Array("BtRN1vODFT189aDNHn7iLzDGTTiS6D7KAciacXq2p08="),
        secretKey: b64ToUint8Array("tM3Al0PRosjG//AUd/cYsG/pO8jxBBYUCffV2FK5DfEG1E3W84MVPXz1oM0efuIvMMZNOJLoPsoByJpxeranTw=="),
        nameornym: "Letizia Thomson",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1486453778000",
        trustScore: 74.9
    },
    {
        publicKey: b64ToUint8Array("JaWP3Ah5LrzBfq/b/Zr5CnrcNGIfgvUkGHBw1VbZ9OQ="),
        secretKey: b64ToUint8Array("WKgjWeC0t4c5z0jkBKDTpkhOCocQZGIY7jGK6osFzpElpY/cCHkuvMF+r9v9mvkKetw0Yh+C9SQYcHDVVtn05A=="),
        nameornym: "Emilee Sidney",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1441088359000",
        trustScore: 53.2
    },
    {
        publicKey: b64ToUint8Array("qG5P3BD8TtTiEXl1J7597yw9r2Zw4UHcPOroCapzjEQ="),
        secretKey: b64ToUint8Array("0x92FPc43em03ewzTDZuQhp9oS4vFNF3XiCJTwBmhjyobk/cEPxO1OIReXUnvn3vLD2vZnDhQdw86ugJqnOMRA=="),
        nameornym: "Augie Salvadore",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1477635766000",
        trustScore: 52.2
    },
    {
        publicKey: b64ToUint8Array("1xrvBtEk3iwtUjaxgp3drmY+VMLzdRgWGIpoFg47BwM="),
        secretKey: b64ToUint8Array("+8EO6g2n5yQK1tdR2Fw7G/4Ls7YjBK4pnNb9/lydEn/XGu8G0STeLC1SNrGCnd2uZj5UwvN1GBYYimgWDjsHAw=="),
        nameornym: "Cynde Danilchik",
        avatar: "https://loremflickr.com/180/180",
        connectionDate: "1434290503000",
        trustScore: 64.9
    }
];
