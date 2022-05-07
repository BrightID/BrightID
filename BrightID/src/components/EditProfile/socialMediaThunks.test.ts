import {
  linkSocialMediaApp,
  syncSocialMedia,
} from '@/components/EditProfile/socialMediaThunks';
import socialMediaService, {
  SOCIAL_API_AUTHENTICATION_ERROR,
} from '@/api/socialMediaService';
import * as AppModule from '@/components/Apps/model';
import {
  SocialMediaVariationIds,
  socialMediaVariations,
} from '@/components/EditProfile/socialMediaVariations';
import { CreateSocialMediaResponse } from '@/api/socialMediaService_types.d';
import { BrightIdNetwork } from '@/components/Apps/types.d';

const mockApp: AppInfo = {
  id: 'phoneRegistry',
  name: 'Phone Registry',
  context: '',
  verifications: ['SeedConnected and SeedConnected.rank>0'],
  verificationUrl: '',
  logo: 'data:image/png;base64,iVBORw0K...',
  url: 'https://brightid.org/',
  assignedSponsorships: 0,
  unusedSponsorships: 0,
  testing: true,
  idsAsHex: false,
  usingBlindSig: true,
  verificationExpirationLength: 2592000000,
  sponsorPublicKey: '5aGu5lG1cvnOeGCZyIXFbpaxa5y06LqkGe59by96ojw=',
  nodeUrl: '',
  callbackUrl:
    'https://finder.brightid.org/api/v1/social-media/check-verification/',
};
const socialMediaVariation = socialMediaVariations.find(
  (variation) => variation.id === SocialMediaVariationIds.PHONE_NUMBER,
);
const socialMediaNotSyncedNotLinked: SocialMedia = {
  id: socialMediaVariation.id,
  company: {
    name: socialMediaVariation.name,
    shareType: socialMediaVariation.shareType,
  },
  order: 0,
  profile: '+989999999999',
  profileDisplayWidth: 141.3333282470703,
};
const profileHashes = [
  'e0ec043b3f9e198ec09041687e4d4e8d',
  '6d21246897c15f4ef26278ec0b421e8d',
  '283f42764da6dba2522412916b031080',
];
const appUserId = 'db84185b-a204-424a-a58c-1424fec1bec3';
const apiToken = 'SAMPLE_TOKEN';

const socialMediaSyncedNotLinked: SocialMedia = {
  ...socialMediaNotSyncedNotLinked,
  brightIdSocialAppData: {
    synced: true,
    linked: false,
    appUserId,
    token: apiToken,
  },
};

jest.mock('store', () => ({
  getState() {
    return {};
  },
}));
const appId = mockApp.id;

jest.mock('reducer/appsSlice', () => ({
  selectAllApps: (state: any): AppInfo[] => [mockApp],
}));

export const SIG_WAIT_TIME = 86400000;

jest.mock('utils/constants', () => ({
  SOCIAL_MEDIA_SIG_WAIT_TIME: SIG_WAIT_TIME,
}));

jest.mock('components/Apps/model', () => ({
  getSignedTimestamp: jest.fn(),
  linkAppId: jest.fn().mockReturnValue(Promise.resolve(true)),
}));

function mockRightLinkingTime() {
  jest
    .spyOn(AppModule, 'getSignedTimestamp')
    .mockReturnValue(Date.now() - SIG_WAIT_TIME - 1000);
}

function mockWrongLinkingTime() {
  jest
    .spyOn(AppModule, 'getSignedTimestamp')
    .mockReturnValue(Date.now() - SIG_WAIT_TIME + 1000);
}

describe('linkSocialMediaApp', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('links when current time is SIG_WAIT_TIME ahead of blindSig time', async () => {
    mockRightLinkingTime();
    const spy = jest.spyOn(AppModule, 'linkAppId');
    const ret = await linkSocialMediaApp(appId, appUserId);
    expect(ret).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('does not link when current time is SIG_WAIT_TIME before blindSig time', async () => {
    mockWrongLinkingTime();
    const spy = jest.spyOn(AppModule, 'linkAppId');
    const ret = await linkSocialMediaApp(appId, appUserId);
    expect(ret).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('syncSocialMedia', () => {
  beforeAll(() => {
    mockRightLinkingTime();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createSocialMediaResponse: CreateSocialMediaResponse = {
    appUserId,
    token: apiToken,
    network: BrightIdNetwork.TEST,
    variation: socialMediaVariation.id,
  };

  const returnData = {
    token: apiToken,
    synced: true,
    appUserId,
  };

  function makeCreateSocialMediaSpy() {
    return jest
      .spyOn(socialMediaService, 'createSocialMedia')
      .mockReturnValue(Promise.resolve(createSocialMediaResponse));
  }

  it('sends create social media request', async () => {
    const spy = makeCreateSocialMediaSpy();

    const ret = await syncSocialMedia(
      '',
      socialMediaNotSyncedNotLinked,
      socialMediaVariation,
    );
    expect(ret).toEqual(returnData);
    expect(spy).toHaveBeenCalledWith({
      network: BrightIdNetwork.TEST,
      profileHashes,
      variation: socialMediaVariation.id,
    });
  });

  it('sends update social media request', async () => {
    const spy = jest
      .spyOn(socialMediaService, 'updateSocialMedia')
      .mockReturnValue(Promise.resolve());

    const ret = await syncSocialMedia(
      apiToken,
      socialMediaSyncedNotLinked,
      socialMediaVariation,
    );
    expect(ret).toEqual(returnData);
    expect(spy).toHaveBeenCalled();
  });

  it('sends create social media request if update token is invalid', async () => {
    const spy = makeCreateSocialMediaSpy();
    jest
      .spyOn(socialMediaService, 'updateSocialMedia')
      .mockReturnValue(
        Promise.reject(new Error(SOCIAL_API_AUTHENTICATION_ERROR)),
      );

    const ret = await syncSocialMedia(
      apiToken,
      socialMediaSyncedNotLinked,
      socialMediaVariation,
    );
    expect(ret).toEqual(returnData);
    expect(spy).toHaveBeenCalled();
  });
});
