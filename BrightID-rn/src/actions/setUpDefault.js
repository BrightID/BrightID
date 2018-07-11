// @flow

import { trustScore, groupsCount, allConnections, setUserData } from './index';

/**
 * Sets the app up with dummy data
 * based on the project's spec found in the wiki
 * Using https://mockaroo.com/ to mock data
 *
 * This function is called in App.js
 */

export const whatever = 'whatever';

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
      userData.hasOwnProperty('avatarUri')
    ) {
      dispatch(setUserData(userData));
    }

    // populate the app with dummy data for now
    dispatch(trustScore('99.9'));
    dispatch(groupsCount(4));
    dispatch(
      allConnections([
        {
          id: 1,
          firstName: 'Keslie',
          lastName: 'Klimko',
          avatar: 'https://robohash.org/etquosit.jpg?size=145x145&set=set1',
          connectionDate: '2016-03-20T03:08:33Z',
          trustScore: 83.8,
        },
        {
          id: 2,
          firstName: 'Heath',
          lastName: 'Miall',
          avatar:
            'https://robohash.org/autrepellenduscommodi.png?size=145x145&set=set1',
          connectionDate: '2013-11-17T06:07:44Z',
          trustScore: 89.1,
        },
        {
          id: 3,
          firstName: 'Devin',
          lastName: 'Bartomieu',
          avatar:
            'https://robohash.org/temporesolutaeos.bmp?size=145x145&set=set1',
          connectionDate: '2008-04-27T14:02:30Z',
          trustScore: 68.3,
        },
        {
          id: 4,
          firstName: 'Olenolin',
          lastName: 'Pasquale',
          avatar:
            'https://robohash.org/temporibusetrerum.bmp?size=145x145&set=set1',
          connectionDate: '2013-02-20T09:27:47Z',
          trustScore: 91.6,
        },
        {
          id: 5,
          firstName: 'Gisele',
          lastName: 'Darinton',
          avatar: 'https://robohash.org/quiquised.bmp?size=145x145&set=set1',
          connectionDate: '2014-12-14T12:57:34Z',
          trustScore: 98.6,
        },
        {
          id: 6,
          firstName: 'Crissy',
          lastName: 'Zanetto',
          avatar: 'https://robohash.org/nemovelvelit.bmp?size=145x145&set=set1',
          connectionDate: '2016-08-03T04:58:12Z',
          trustScore: 86.0,
        },
        {
          id: 7,
          firstName: 'Gail',
          lastName: 'Maddrell',
          avatar: 'https://robohash.org/atoptioet.png?size=145x145&set=set1',
          connectionDate: '2015-06-21T22:32:34Z',
          trustScore: 65.3,
        },
        {
          id: 8,
          firstName: 'Cindelyn',
          lastName: 'Cullin',
          avatar:
            'https://robohash.org/aliquidveritatisearum.bmp?size=145x145&set=set1',
          connectionDate: '2014-07-12T11:00:20Z',
          trustScore: 89.1,
        },
        {
          id: 9,
          firstName: 'Louise',
          lastName: 'Brignall',
          avatar:
            'https://robohash.org/cumqueerrormaxime.png?size=145x145&set=set1',
          connectionDate: '2012-06-28T09:06:27Z',
          trustScore: 65.4,
        },
        {
          id: 10,
          firstName: 'Sybila',
          lastName: 'Hathorn',
          avatar:
            'https://robohash.org/nobislaboriosamporro.jpg?size=145x145&set=set1',
          connectionDate: '2013-09-13T08:51:22Z',
          trustScore: 66.7,
        },
        {
          id: 11,
          firstName: 'Fabien',
          lastName: 'Casella',
          avatar:
            'https://robohash.org/molestiaeillosunt.bmp?size=145x145&set=set1',
          connectionDate: '2012-10-30T03:43:25Z',
          trustScore: 98.9,
        },
        {
          id: 12,
          firstName: 'Sterling',
          lastName: 'Huggon',
          avatar:
            'https://robohash.org/illumplaceatmolestiae.png?size=145x145&set=set1',
          connectionDate: '2017-03-30T01:32:07Z',
          trustScore: 83.6,
        },
        {
          id: 13,
          firstName: 'Dasya',
          lastName: 'Wiffield',
          avatar:
            'https://robohash.org/velitrepellatvel.jpg?size=145x145&set=set1',
          connectionDate: '2012-01-19T01:09:52Z',
          trustScore: 75.3,
        },
        {
          id: 14,
          firstName: 'Barbey',
          lastName: 'Greer',
          avatar:
            'https://robohash.org/inametfacilis.jpg?size=145x145&set=set1',
          connectionDate: '2018-04-19T10:21:24Z',
          trustScore: 63.6,
        },
        {
          id: 15,
          firstName: 'Lonny',
          lastName: 'Geach',
          avatar:
            'https://robohash.org/doloreaccusantiumsoluta.bmp?size=145x145&set=set1',
          connectionDate: '2014-02-15T12:06:22Z',
          trustScore: 69.7,
        },
        {
          id: 16,
          firstName: 'Merla',
          lastName: 'Milne',
          avatar:
            'https://robohash.org/inciduntvoluptatemtemporibus.jpg?size=145x145&set=set1',
          connectionDate: '2012-01-27T14:54:10Z',
          trustScore: 82.2,
        },
        {
          id: 17,
          firstName: 'Kinsley',
          lastName: 'Hasluck',
          avatar:
            'https://robohash.org/uteveniettenetur.png?size=145x145&set=set1',
          connectionDate: '2007-10-05T13:56:20Z',
          trustScore: 72.4,
        },
        {
          id: 18,
          firstName: 'Virgil',
          lastName: 'Pyner',
          avatar:
            'https://robohash.org/autautemconsequatur.jpg?size=145x145&set=set1',
          connectionDate: '2014-01-23T10:21:57Z',
          trustScore: 70.7,
        },
        {
          id: 19,
          firstName: 'Trev',
          lastName: 'Heaphy',
          avatar:
            'https://robohash.org/expeditaautdoloremque.jpg?size=145x145&set=set1',
          connectionDate: '2014-11-09T14:37:20Z',
          trustScore: 62.9,
        },
        {
          id: 20,
          firstName: 'Mercedes',
          lastName: 'Boncore',
          avatar:
            'https://robohash.org/alaborumquaerat.png?size=145x145&set=set1',
          connectionDate: '2009-08-25T22:39:08Z',
          trustScore: 84.7,
        },
        {
          id: 21,
          firstName: 'Whitney',
          lastName: 'Vobes',
          avatar:
            'https://robohash.org/autemquamcorrupti.jpg?size=145x145&set=set1',
          connectionDate: '2012-11-26T14:34:49Z',
          trustScore: 99.0,
        },
        {
          id: 22,
          firstName: 'Baudoin',
          lastName: 'Paolacci',
          avatar: 'https://robohash.org/totameterror.jpg?size=145x145&set=set1',
          connectionDate: '2012-06-27T17:43:53Z',
          trustScore: 80.1,
        },
        {
          id: 23,
          firstName: 'Perceval',
          lastName: 'Kaley',
          avatar:
            'https://robohash.org/evenietvelitexpedita.bmp?size=145x145&set=set1',
          connectionDate: '2015-09-09T05:18:23Z',
          trustScore: 95.4,
        },
        {
          id: 24,
          firstName: 'Claresta',
          lastName: 'Seniour',
          avatar:
            'https://robohash.org/sedseddistinctio.png?size=145x145&set=set1',
          connectionDate: '2011-04-03T09:15:44Z',
          trustScore: 76.5,
        },
        {
          id: 25,
          firstName: 'Donelle',
          lastName: 'Puddephatt',
          avatar:
            'https://robohash.org/ipsamofficiisunde.jpg?size=145x145&set=set1',
          connectionDate: '2012-05-28T01:10:38Z',
          trustScore: 72.5,
        },
        {
          id: 26,
          firstName: 'Gussi',
          lastName: 'Langelay',
          avatar: 'https://robohash.org/quisunteos.png?size=145x145&set=set1',
          connectionDate: '2016-08-17T09:13:01Z',
          trustScore: 91.3,
        },
        {
          id: 27,
          firstName: 'Wynne',
          lastName: 'Autin',
          avatar:
            'https://robohash.org/illumsuntofficiis.jpg?size=145x145&set=set1',
          connectionDate: '2016-07-24T11:53:25Z',
          trustScore: 86.9,
        },
        {
          id: 28,
          firstName: 'Fredek',
          lastName: 'Theml',
          avatar:
            'https://robohash.org/nequeofficiisab.jpg?size=145x145&set=set1',
          connectionDate: '2010-01-14T13:55:40Z',
          trustScore: 74.8,
        },
        {
          id: 29,
          firstName: 'Dewain',
          lastName: 'Clayson',
          avatar:
            'https://robohash.org/liberodoloremquerepudiandae.jpg?size=145x145&set=set1',
          connectionDate: '2014-06-19T10:24:50Z',
          trustScore: 81.8,
        },
        {
          id: 30,
          firstName: 'Lincoln',
          lastName: 'Thornborrow',
          avatar:
            'https://robohash.org/liberoperspiciatisquas.png?size=145x145&set=set1',
          connectionDate: '2014-07-29T13:59:38Z',
          trustScore: 93.9,
        },
        {
          id: 31,
          firstName: 'Cordie',
          lastName: 'Skalls',
          avatar: 'https://robohash.org/utminimaeos.bmp?size=145x145&set=set1',
          connectionDate: '2014-11-07T16:14:46Z',
          trustScore: 96.9,
        },
        {
          id: 32,
          firstName: 'Sibyl',
          lastName: 'Berni',
          avatar:
            'https://robohash.org/saepetotamodit.png?size=145x145&set=set1',
          connectionDate: '2017-06-13T20:33:28Z',
          trustScore: 78.3,
        },
        {
          id: 33,
          firstName: 'Englebert',
          lastName: 'Dyett',
          avatar:
            'https://robohash.org/consequunturquasipraesentium.jpg?size=145x145&set=set1',
          connectionDate: '2013-03-22T08:43:01Z',
          trustScore: 85.4,
        },
        {
          id: 34,
          firstName: 'Dorolisa',
          lastName: 'Spennock',
          avatar: 'https://robohash.org/quasautet.bmp?size=145x145&set=set1',
          connectionDate: '2008-04-28T01:02:53Z',
          trustScore: 76.4,
        },
        {
          id: 35,
          firstName: 'Stace',
          lastName: 'Fawlks',
          avatar:
            'https://robohash.org/faciliseligendicumque.png?size=145x145&set=set1',
          connectionDate: '2008-02-18T03:26:11Z',
          trustScore: 64.7,
        },
        {
          id: 36,
          firstName: 'Maggie',
          lastName: 'Wanless',
          avatar:
            'https://robohash.org/remdoloreligendi.jpg?size=145x145&set=set1',
          connectionDate: '2010-11-10T21:06:08Z',
          trustScore: 85.2,
        },
        {
          id: 37,
          firstName: 'Jelene',
          lastName: 'Dackombe',
          avatar:
            'https://robohash.org/quiacorruptiofficia.png?size=145x145&set=set1',
          connectionDate: '2013-09-03T06:01:17Z',
          trustScore: 68.9,
        },
        {
          id: 38,
          firstName: 'Corie',
          lastName: 'Igglesden',
          avatar:
            'https://robohash.org/veroexcepturiquibusdam.jpg?size=145x145&set=set1',
          connectionDate: '2009-04-08T16:34:07Z',
          trustScore: 80.8,
        },
        {
          id: 39,
          firstName: 'Bettina',
          lastName: 'Paolucci',
          avatar:
            'https://robohash.org/repudiandaeconsecteturab.bmp?size=145x145&set=set1',
          connectionDate: '2009-06-25T17:36:51Z',
          trustScore: 87.5,
        },
        {
          id: 40,
          firstName: 'Trixy',
          lastName: 'Killough',
          avatar:
            'https://robohash.org/repellatminimaquis.png?size=145x145&set=set1',
          connectionDate: '2014-06-23T14:26:47Z',
          trustScore: 93.1,
        },
        {
          id: 41,
          firstName: 'Meridith',
          lastName: 'Heimann',
          avatar:
            'https://robohash.org/facilisfugitdeleniti.jpg?size=145x145&set=set1',
          connectionDate: '2015-07-22T23:30:10Z',
          trustScore: 86.8,
        },
        {
          id: 42,
          firstName: 'Osmond',
          lastName: 'Slyde',
          avatar:
            'https://robohash.org/essesequidolore.jpg?size=145x145&set=set1',
          connectionDate: '2008-06-12T23:16:09Z',
          trustScore: 96.5,
        },
        {
          id: 43,
          firstName: 'Yvor',
          lastName: 'Masterson',
          avatar:
            'https://robohash.org/consequaturquipariatur.png?size=145x145&set=set1',
          connectionDate: '2013-06-06T11:16:04Z',
          trustScore: 93.4,
        },
        {
          id: 44,
          firstName: 'Aurilia',
          lastName: 'Cardinale',
          avatar:
            'https://robohash.org/minimaessemodi.jpg?size=145x145&set=set1',
          connectionDate: '2015-09-10T01:50:56Z',
          trustScore: 83.8,
        },
        {
          id: 45,
          firstName: 'Priscilla',
          lastName: 'Reith',
          avatar: 'https://robohash.org/idsuntquia.bmp?size=145x145&set=set1',
          connectionDate: '2010-10-22T15:51:33Z',
          trustScore: 71.4,
        },
        {
          id: 46,
          firstName: 'Marcellina',
          lastName: 'Humm',
          avatar:
            'https://robohash.org/omnisminusaut.jpg?size=145x145&set=set1',
          connectionDate: '2012-02-12T03:54:07Z',
          trustScore: 85.8,
        },
        {
          id: 47,
          firstName: 'Chick',
          lastName: 'Baudasso',
          avatar:
            'https://robohash.org/molestiaesiteveniet.png?size=145x145&set=set1',
          connectionDate: '2008-11-29T07:41:23Z',
          trustScore: 67.5,
        },
        {
          id: 48,
          firstName: 'Prince',
          lastName: 'Paske',
          avatar:
            'https://robohash.org/evenietofficiisdeleniti.jpg?size=145x145&set=set1',
          connectionDate: '2012-02-26T04:01:50Z',
          trustScore: 87.6,
        },
        {
          id: 49,
          firstName: 'Kurtis',
          lastName: 'Curley',
          avatar:
            'https://robohash.org/quioditexcepturi.jpg?size=145x145&set=set1',
          connectionDate: '2007-08-11T19:36:30Z',
          trustScore: 60.5,
        },
        {
          id: 50,
          firstName: 'Nertie',
          lastName: 'Cesconi',
          avatar: 'https://robohash.org/odionobiseum.png?size=145x145&set=set1',
          connectionDate: '2015-03-29T08:51:33Z',
          trustScore: 77.7,
        },
        {
          id: 51,
          firstName: 'Saunderson',
          lastName: 'Rapper',
          avatar:
            'https://robohash.org/dolorestemporibusreiciendis.png?size=145x145&set=set1',
          connectionDate: '2009-09-26T15:04:02Z',
          trustScore: 94.0,
        },
        {
          id: 52,
          firstName: 'Sonny',
          lastName: 'Ivens',
          avatar:
            'https://robohash.org/accusantiumquisquamquae.jpg?size=145x145&set=set1',
          connectionDate: '2011-06-13T17:24:40Z',
          trustScore: 86.0,
        },
        {
          id: 53,
          firstName: 'Tabb',
          lastName: 'Oag',
          avatar:
            'https://robohash.org/nobisrationetotam.png?size=145x145&set=set1',
          connectionDate: '2017-08-01T14:41:37Z',
          trustScore: 60.1,
        },
        {
          id: 54,
          firstName: 'Celinka',
          lastName: 'Bastiman',
          avatar:
            'https://robohash.org/quiatexercitationem.jpg?size=145x145&set=set1',
          connectionDate: '2011-06-15T03:13:15Z',
          trustScore: 84.3,
        },
        {
          id: 55,
          firstName: 'Cameron',
          lastName: 'Lovat',
          avatar: 'https://robohash.org/eosinplaceat.png?size=145x145&set=set1',
          connectionDate: '2008-01-08T12:23:14Z',
          trustScore: 83.4,
        },
        {
          id: 56,
          firstName: 'Nickie',
          lastName: 'Roblett',
          avatar:
            'https://robohash.org/etadipiscinatus.png?size=145x145&set=set1',
          connectionDate: '2012-10-15T08:09:53Z',
          trustScore: 78.0,
        },
        {
          id: 57,
          firstName: 'Dehlia',
          lastName: 'Cleeton',
          avatar: 'https://robohash.org/quietin.bmp?size=145x145&set=set1',
          connectionDate: '2009-07-29T16:00:12Z',
          trustScore: 87.4,
        },
        {
          id: 58,
          firstName: 'Worden',
          lastName: 'Ullyatt',
          avatar:
            'https://robohash.org/numquamnamconsequatur.png?size=145x145&set=set1',
          connectionDate: '2011-10-13T13:27:51Z',
          trustScore: 89.5,
        },
        {
          id: 59,
          firstName: 'Viviana',
          lastName: 'Managh',
          avatar:
            'https://robohash.org/repellendusveritatisab.bmp?size=145x145&set=set1',
          connectionDate: '2014-06-07T18:18:03Z',
          trustScore: 86.0,
        },
        {
          id: 60,
          firstName: 'Grange',
          lastName: 'Ossenna',
          avatar:
            'https://robohash.org/maioresdignissimosfacilis.bmp?size=145x145&set=set1',
          connectionDate: '2011-01-11T16:59:25Z',
          trustScore: 63.0,
        },
        {
          id: 61,
          firstName: 'Galen',
          lastName: 'Eagleton',
          avatar:
            'https://robohash.org/veritatisperspiciatisautem.bmp?size=145x145&set=set1',
          connectionDate: '2015-12-09T15:28:22Z',
          trustScore: 62.2,
        },
        {
          id: 62,
          firstName: 'Nancey',
          lastName: 'Mansfield',
          avatar: 'https://robohash.org/numquamnonet.bmp?size=145x145&set=set1',
          connectionDate: '2016-07-27T00:11:34Z',
          trustScore: 90.9,
        },
        {
          id: 63,
          firstName: 'Gaspar',
          lastName: 'Duckhouse',
          avatar:
            'https://robohash.org/quivoluptasullam.jpg?size=145x145&set=set1',
          connectionDate: '2014-10-03T02:29:53Z',
          trustScore: 63.6,
        },
        {
          id: 64,
          firstName: 'Fairlie',
          lastName: 'Rickerby',
          avatar: 'https://robohash.org/velitquiin.bmp?size=145x145&set=set1',
          connectionDate: '2012-02-01T20:21:43Z',
          trustScore: 73.4,
        },
        {
          id: 65,
          firstName: 'Jyoti',
          lastName: 'Yong',
          avatar:
            'https://robohash.org/repudiandaeporromaiores.jpg?size=145x145&set=set1',
          connectionDate: '2016-08-23T01:50:27Z',
          trustScore: 85.8,
        },
        {
          id: 66,
          firstName: 'Mano',
          lastName: "O'Loughane",
          avatar:
            'https://robohash.org/nihiletsoluta.png?size=145x145&set=set1',
          connectionDate: '2009-03-22T16:53:24Z',
          trustScore: 93.7,
        },
        {
          id: 67,
          firstName: 'Riva',
          lastName: 'Nazer',
          avatar:
            'https://robohash.org/quiaaperiamut.jpg?size=145x145&set=set1',
          connectionDate: '2008-03-09T07:57:42Z',
          trustScore: 76.8,
        },
        {
          id: 68,
          firstName: 'Cecelia',
          lastName: 'Sames',
          avatar:
            'https://robohash.org/maximeexpeditaquia.jpg?size=145x145&set=set1',
          connectionDate: '2016-01-26T05:08:13Z',
          trustScore: 93.5,
        },
        {
          id: 69,
          firstName: 'Hakeem',
          lastName: 'Payley',
          avatar:
            'https://robohash.org/distinctioutaut.jpg?size=145x145&set=set1',
          connectionDate: '2008-12-01T12:29:37Z',
          trustScore: 62.5,
        },
        {
          id: 70,
          firstName: 'Sollie',
          lastName: 'Scohier',
          avatar:
            'https://robohash.org/culpanecessitatibuseum.jpg?size=145x145&set=set1',
          connectionDate: '2012-09-27T08:36:36Z',
          trustScore: 97.4,
        },
        {
          id: 71,
          firstName: 'Leta',
          lastName: 'Driutti',
          avatar:
            'https://robohash.org/involuptatemid.jpg?size=145x145&set=set1',
          connectionDate: '2016-12-12T10:33:19Z',
          trustScore: 87.7,
        },
        {
          id: 72,
          firstName: 'Harper',
          lastName: 'Minot',
          avatar:
            'https://robohash.org/eosmollitiaenim.jpg?size=145x145&set=set1',
          connectionDate: '2018-01-04T12:29:24Z',
          trustScore: 85.4,
        },
        {
          id: 73,
          firstName: 'Alix',
          lastName: 'Borrie',
          avatar:
            'https://robohash.org/rationeestnon.jpg?size=145x145&set=set1',
          connectionDate: '2010-02-19T20:45:04Z',
          trustScore: 67.0,
        },
        {
          id: 74,
          firstName: 'Chrysa',
          lastName: 'Itscowics',
          avatar:
            'https://robohash.org/aliasveritatisqui.jpg?size=145x145&set=set1',
          connectionDate: '2008-04-05T03:17:59Z',
          trustScore: 72.4,
        },
        {
          id: 75,
          firstName: 'Ezmeralda',
          lastName: 'Ianilli',
          avatar:
            'https://robohash.org/autetasperiores.jpg?size=145x145&set=set1',
          connectionDate: '2015-02-05T10:18:58Z',
          trustScore: 86.9,
        },
        {
          id: 76,
          firstName: 'Rina',
          lastName: 'MacRury',
          avatar:
            'https://robohash.org/nihilmaximemagni.bmp?size=145x145&set=set1',
          connectionDate: '2015-07-31T18:08:51Z',
          trustScore: 73.7,
        },
        {
          id: 77,
          firstName: 'Cacilia',
          lastName: 'Ordelt',
          avatar:
            'https://robohash.org/quisapientequia.jpg?size=145x145&set=set1',
          connectionDate: '2008-12-03T01:50:24Z',
          trustScore: 86.3,
        },
        {
          id: 78,
          firstName: 'Tybalt',
          lastName: 'Mair',
          avatar:
            'https://robohash.org/voluptatemetaut.bmp?size=145x145&set=set1',
          connectionDate: '2016-03-04T15:14:08Z',
          trustScore: 87.2,
        },
        {
          id: 79,
          firstName: 'Ruprecht',
          lastName: 'Shaxby',
          avatar:
            'https://robohash.org/adquidemcorrupti.jpg?size=145x145&set=set1',
          connectionDate: '2015-01-18T13:10:59Z',
          trustScore: 74.3,
        },
        {
          id: 80,
          firstName: 'Hailey',
          lastName: 'Fallowfield',
          avatar:
            'https://robohash.org/nemoconsequaturest.jpg?size=145x145&set=set1',
          connectionDate: '2009-11-03T15:11:49Z',
          trustScore: 90.1,
        },
        {
          id: 81,
          firstName: 'Mufi',
          lastName: 'McCandie',
          avatar:
            'https://robohash.org/autvoluptasmollitia.jpg?size=145x145&set=set1',
          connectionDate: '2017-07-17T16:58:28Z',
          trustScore: 89.6,
        },
        {
          id: 82,
          firstName: 'Tammie',
          lastName: 'Dunstone',
          avatar:
            'https://robohash.org/corporissintaut.png?size=145x145&set=set1',
          connectionDate: '2007-11-27T10:00:01Z',
          trustScore: 76.9,
        },
        {
          id: 83,
          firstName: 'Stern',
          lastName: 'Rees',
          avatar:
            'https://robohash.org/fugitquicorporis.bmp?size=145x145&set=set1',
          connectionDate: '2015-02-24T14:05:41Z',
          trustScore: 81.4,
        },
        {
          id: 84,
          firstName: 'Ilario',
          lastName: 'Spon',
          avatar: 'https://robohash.org/idametiste.png?size=145x145&set=set1',
          connectionDate: '2011-03-01T16:44:34Z',
          trustScore: 62.1,
        },
        {
          id: 85,
          firstName: 'Ivar',
          lastName: 'Phlipon',
          avatar: 'https://robohash.org/sitquiased.png?size=145x145&set=set1',
          connectionDate: '2017-02-27T14:12:08Z',
          trustScore: 71.5,
        },
        {
          id: 86,
          firstName: 'Jaclyn',
          lastName: 'Kelcher',
          avatar:
            'https://robohash.org/aliquidsaepecommodi.jpg?size=145x145&set=set1',
          connectionDate: '2012-02-15T23:59:03Z',
          trustScore: 72.9,
        },
        {
          id: 87,
          firstName: 'Thorvald',
          lastName: 'Rebillard',
          avatar:
            'https://robohash.org/voluptatemvoluptatessimilique.bmp?size=145x145&set=set1',
          connectionDate: '2010-11-14T17:35:33Z',
          trustScore: 66.5,
        },
        {
          id: 88,
          firstName: 'Ara',
          lastName: 'Buchanan',
          avatar:
            'https://robohash.org/eumvelitbeatae.png?size=145x145&set=set1',
          connectionDate: '2016-12-25T08:46:38Z',
          trustScore: 66.7,
        },
        {
          id: 89,
          firstName: 'Charo',
          lastName: 'Kingston',
          avatar:
            'https://robohash.org/omnisvoluptatemiusto.png?size=145x145&set=set1',
          connectionDate: '2008-12-13T01:28:00Z',
          trustScore: 90.9,
        },
        {
          id: 90,
          firstName: 'Niel',
          lastName: 'Dulinty',
          avatar:
            'https://robohash.org/fugitmagnamnisi.png?size=145x145&set=set1',
          connectionDate: '2011-01-01T16:50:12Z',
          trustScore: 98.1,
        },
        {
          id: 91,
          firstName: 'Carlee',
          lastName: 'Van der Merwe',
          avatar:
            'https://robohash.org/veniamidautem.png?size=145x145&set=set1',
          connectionDate: '2017-08-06T11:03:12Z',
          trustScore: 60.4,
        },
        {
          id: 92,
          firstName: 'Eloise',
          lastName: 'Noriega',
          avatar:
            'https://robohash.org/sintdoloresculpa.bmp?size=145x145&set=set1',
          connectionDate: '2017-03-17T16:24:58Z',
          trustScore: 76.9,
        },
        {
          id: 93,
          firstName: 'Fabien',
          lastName: 'Harron',
          avatar:
            'https://robohash.org/liberoducimusab.bmp?size=145x145&set=set1',
          connectionDate: '2012-04-07T09:01:40Z',
          trustScore: 71.0,
        },
        {
          id: 94,
          firstName: 'Denny',
          lastName: 'Furmedge',
          avatar:
            'https://robohash.org/totamlaborummolestias.bmp?size=145x145&set=set1',
          connectionDate: '2008-05-04T02:26:43Z',
          trustScore: 91.6,
        },
        {
          id: 95,
          firstName: 'Jessey',
          lastName: 'Maciejak',
          avatar:
            'https://robohash.org/aperiametadipisci.bmp?size=145x145&set=set1',
          connectionDate: '2009-06-15T06:56:13Z',
          trustScore: 65.2,
        },
        {
          id: 96,
          firstName: 'Shannon',
          lastName: 'Daal',
          avatar:
            'https://robohash.org/cupiditateeosblanditiis.bmp?size=145x145&set=set1',
          connectionDate: '2012-05-27T02:57:28Z',
          trustScore: 94.2,
        },
        {
          id: 97,
          firstName: 'Tina',
          lastName: 'Jarmyn',
          avatar:
            'https://robohash.org/nequevelperspiciatis.png?size=145x145&set=set1',
          connectionDate: '2014-05-17T15:16:55Z',
          trustScore: 87.5,
        },
        {
          id: 98,
          firstName: 'Jamesy',
          lastName: 'Brear',
          avatar: 'https://robohash.org/quisautsint.png?size=145x145&set=set1',
          connectionDate: '2007-07-04T21:40:27Z',
          trustScore: 66.9,
        },
        {
          id: 99,
          firstName: 'Kristina',
          lastName: 'Sabben',
          avatar:
            'https://robohash.org/asperioresculpaqui.bmp?size=145x145&set=set1',
          connectionDate: '2010-05-05T18:54:46Z',
          trustScore: 68.2,
        },
        {
          id: 100,
          firstName: 'Cirilo',
          lastName: "O'Towey",
          avatar:
            'https://robohash.org/suscipitdistinctioperspiciatis.bmp?size=145x145&set=set1',
          connectionDate: '2012-03-31T07:44:21Z',
          trustScore: 93.9,
        },
      ]),
    );
  } catch (err) {
    console.log(err);
  }
};
