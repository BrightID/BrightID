import { linkSocialMediaApp } from '@/components/EditProfile/socialMediaThunks';
import * as AppModule from '@/components/Apps/model';
import { socialMediaVariations } from '@/components/EditProfile/socialMediaVariations';

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
const socialMediaVariation = socialMediaVariations[0];
const socialMedia: SocialMedia = {
  id: socialMediaVariation.id,
  company: socialMediaVariation,
  order: 0,
  profile: '+989999999999',
  profileDisplayWidth: 141.3333282470703,
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
    const appUserId = 'db84185b-a204-424a-a58c-1424fec1bec3';
    const ret = await linkSocialMediaApp(appId, appUserId);
    expect(ret).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('does not link when current time is SIG_WAIT_TIME before blindSig time', async () => {
    mockWrongLinkingTime();
    const spy = jest.spyOn(AppModule, 'linkAppId');
    const appUserId = 'db84185b-a204-424a-a58c-1424fec1bec3';
    const ret = await linkSocialMediaApp(appId, appUserId);
    expect(ret).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });
});
