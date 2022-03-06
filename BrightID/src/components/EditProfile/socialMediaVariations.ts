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

export enum SocialMediaVariationName {
  DISCORD = 'Discord',
  INSTAGRAM = 'Instagram',
  KEYBASE = 'Keybase',
  LINKEDIN = 'LinkedIn',
  MEDIUM = 'Medium',
  SIGNAL = 'Signal',
  TELEGRAM = 'Telegram',
  TWITTER = 'Twitter',
  WHATSAPP = 'Whatsapp',
  PHONE_NUMBER = 'Phone Number',
  EMAIL = 'Email',
}

export const socialMediaVariations: SocialMediaVariations = [
  {
    id: 'fab9a32f-e968-495e-807f-7f1b27642506',
    name: SocialMediaVariationName.DISCORD,
    icon: DiscordIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.COPY,
    shareActionDataFormat: `%%PROFILE%%`,
    brightIdAppName: null,
  },
  {
    id: 'efc5e269-195b-47e8-8634-b1899c00df9b',
    name: SocialMediaVariationName.INSTAGRAM,
    icon: InstagramIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://instagram.com/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: '607223cc-7fbc-4b44-a595-e84d62146f30',
    name: SocialMediaVariationName.KEYBASE,
    icon: KeybaseIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://keybase.io/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: 'd750bd42-e2d3-465f-a3fd-40fde0080022',
    name: SocialMediaVariationName.LINKEDIN,
    icon: LinkedinIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.URL,
    shareTypeDisplay: SocialMediaShareTypeDisplay.URL,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://www.linkedin.com/in/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: '50ea1e56-f53b-4fa9-bbcb-846a3f3ac7b6',
    name: SocialMediaVariationName.MEDIUM,
    icon: MediumIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.URL,
    shareTypeDisplay: SocialMediaShareTypeDisplay.URL,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `%%PROFILE%%`,
    brightIdAppName: null,
  },
  {
    id: '65a174ff-b823-4abd-9dbb-ae0f46f7bc53',
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
    id: '0e92b39b-e1b5-4236-be40-7377aadca4db',
    name: SocialMediaVariationName.SIGNAL,
    icon: SignalIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.TELEPHONE,
    shareTypeDisplay: SocialMediaShareTypeDisplay.TELEPHONE,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `%%PROFILE%%`,
    brightIdAppName: null,
  },
  {
    id: '4fc96842-0d3d-40ba-bb39-1aaf59a48a59',
    name: SocialMediaVariationName.TELEGRAM,
    icon: TelegramIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME_OR_TELEPHONE,
    shareActionType: SocialMediaShareActionType.COPY_IF_PHONE_LINK_IF_USERNAME,
    shareActionDataFormat: `https://t.me/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: 'a8b188b1-f9f9-416d-b002-7b7faf6e2d41',
    name: SocialMediaVariationName.TWITTER,
    icon: TwitterIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.USERNAME,
    shareTypeDisplay: SocialMediaShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://twitter.com/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: '283ade8a-6ef1-4d38-a744-70ee2f478ba4',
    name: SocialMediaVariationName.WHATSAPP,
    icon: WhatsappIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: SocialMediaShareType.TELEPHONE,
    shareTypeDisplay: SocialMediaShareTypeDisplay.TELEPHONE,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://wa.me/%%PROFILE%%/`,
    brightIdAppName: null,
  },
  {
    id: '9d79c2ec-632c-4a5f-a04f-73d8e06024ec',
    name: SocialMediaVariationName.PHONE_NUMBER,
    icon: null,
    type: SocialMediaType.CONTACT_INFO,
    shareType: SocialMediaShareType.TELEPHONE,
    shareTypeDisplay: SocialMediaShareTypeDisplay.TELEPHONE,
    shareActionType: SocialMediaShareActionType.COPY,
    shareActionDataFormat: `%%PROFILE%%`,
    brightIdAppName: 'phoneRegistry',
  },
  {
    id: 'c01bee17-6f89-477f-8cd4-fe5505691a9a',
    name: SocialMediaVariationName.EMAIL,
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
