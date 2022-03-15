// uuid's generated via npx uuid
import RedditIcon from '@/static/socialmedia/icons8-reddit.svg';
import LinkedinIcon from '@/static/socialmedia/icons8-linkedin.svg';
import WhatsappIcon from '@/static/socialmedia/icons8-whatsapp.svg';
import InstagramIcon from '@/static/socialmedia/icons8-instagram.svg';
import SignalIcon from '@/static/socialmedia/icons8-signal-app.svg';
import TelegramIcon from '@/static/socialmedia/icons8-telegram-app.svg';
import DiscordIcon from '@/static/socialmedia/icons8-discord-bubble.svg';
import KeybaseIcon from '@/static/socialmedia/Keybase_logo_official.svg';
import MediumIcon from '@/static/socialmedia/icons8-medium-monogram.svg';
import TwitterIcon from '@/static/socialmedia/icons8-twitter-circled.svg';

export enum SocialMediaType {
  SOCIAL_PROFILE = 'so',
  CONTACT_INFO = 'co',
}

export enum SocialMediaShareActionType {
  OPEN_LINK = 'ol',
  COPY = 'cp',
  COPY_IF_PHONE_LINK_IF_USERNAME = 'cl',
}

export enum SocialMediaShareType {
  USERNAME = 'username',
  TELEPHONE = 'telephone #',
  URL = 'url',
  EMAIL = 'email',
}

export enum SocialMediaShareTypeDisplay {
  USERNAME = 'username',
  TELEPHONE = 'telephone #',
  URL = 'url',
  EMAIL = 'email',
  USERNAME_OR_TELEPHONE = 'username or telephone',
}

export enum SocialMediaVariationIds {
  DISCORD = 'fab9a32f-e968-495e-807f-7f1b27642506',
  INSTAGRAM = 'efc5e269-195b-47e8-8634-b1899c00df9b',
  KEYBASE = '607223cc-7fbc-4b44-a595-e84d62146f30',
  LINKEDIN = 'd750bd42-e2d3-465f-a3fd-40fde0080022',
  MEDIUM = '50ea1e56-f53b-4fa9-bbcb-846a3f3ac7b6',
  REDDIT = '65a174ff-b823-4abd-9dbb-ae0f46f7bc53',
  SIGNAL = '0e92b39b-e1b5-4236-be40-7377aadca4db',
  TELEGRAM = '4fc96842-0d3d-40ba-bb39-1aaf59a48a59',
  TWITTER = 'a8b188b1-f9f9-416d-b002-7b7faf6e2d41',
  WHATSAPP = '283ade8a-6ef1-4d38-a744-70ee2f478ba4',
  PHONE_NUMBER = '9d79c2ec-632c-4a5f-a04f-73d8e06024ec',
  EMAIL = 'c01bee17-6f89-477f-8cd4-fe5505691a9a',
}

export const socialMediaVariations: SocialMediaVariations = [
  {
    id: SocialMediaVariationIds.DISCORD,
    name: 'Discord',
    icon: DiscordIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.COPY,
    shareActionDataFormat: `%%PROFILE%%`,
    brightIdAppName: null,
  },
  {
    id: SocialMediaVariationIds.INSTAGRAM,
    name: 'Instagram',
    icon: InstagramIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://instagram.com/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: SocialMediaVariationIds.KEYBASE,
    name: 'Keybase',
    icon: KeybaseIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://keybase.io/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: SocialMediaVariationIds.LINKEDIN,
    name: 'LinkedIn',
    icon: LinkedinIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.URL,
    shareTypeDisplay: SocialMediaShareTypeDisplay.URL,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://www.linkedin.com/in/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: SocialMediaVariationIds.MEDIUM,
    name: 'Medium',
    icon: MediumIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.URL,
    shareTypeDisplay: SocialMediaShareTypeDisplay.URL,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `%%PROFILE%%`,
    brightIdAppName: null,
  },
  {
    id: SocialMediaVariationIds.REDDIT,
    name: 'Reddit',
    icon: RedditIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://www.reddit.com/user/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: SocialMediaVariationIds.SIGNAL,
    name: 'Signal',
    icon: SignalIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.TELEPHONE,
    shareTypeDisplay: SocialMediaShareTypeDisplay.TELEPHONE,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `%%PROFILE%%`,
    brightIdAppName: null,
  },
  {
    id: SocialMediaVariationIds.TELEGRAM,
    name: 'Telegram',
    icon: TelegramIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME_OR_TELEPHONE,
    shareActionType: SocialMediaShareActionType.COPY_IF_PHONE_LINK_IF_USERNAME,
    shareActionDataFormat: `https://t.me/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: SocialMediaVariationIds.TWITTER,
    name: 'Twitter',
    icon: TwitterIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://twitter.com/%%PROFILE%%/`,
    brightIdAppName: 'twitterRegistry',
  },
  {
    id: SocialMediaVariationIds.WHATSAPP,
    name: 'Whatsapp',
    icon: WhatsappIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.TELEPHONE,
    shareTypeDisplay: SocialMediaShareTypeDisplay.TELEPHONE,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://wa.me/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: SocialMediaVariationIds.PHONE_NUMBER,
    name: 'Phone Number',
    icon: null,
    type: SocialMediaType.CONTACT_INFO,
    shareType: SocialMediaShareType.TELEPHONE,
    shareTypeDisplay: SocialMediaShareTypeDisplay.TELEPHONE,
    shareActionType: SocialMediaShareActionType.COPY,
    shareActionDataFormat: `%%PROFILE%%`,
    brightIdAppName: 'phoneRegistry',
  },
  {
    id: SocialMediaVariationIds.EMAIL,
    name: 'Email',
    icon: null,
    type: SocialMediaType.CONTACT_INFO,
    shareType: SocialMediaShareType.EMAIL,
    shareTypeDisplay: SocialMediaShareTypeDisplay.EMAIL,
    shareActionType: SocialMediaShareActionType.COPY,
    shareActionDataFormat: `%%PROFILE%%`,
    brightIdAppName: 'emailRegistry',
  },
];

export default Object.freeze(socialMediaVariations);
