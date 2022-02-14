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
  PHONE_NUMBER = 'ph',
}

export enum SocialMediaShareActionType {
  OPEN_LINK = 'ol',
  COPY = 'cp',
  COPY_IF_PHONE_LINK_IF_USERNAME = 'cl',
}

export enum ShareType {
  USERNAME = 'username',
  TELEPHONE = 'telephone #',
  URL = 'url',
}

export enum ShareTypeDisplay {
  USERNAME = 'username',
  TELEPHONE = 'telephone #',
  URL = 'url',
  USERNAME_OR_TELEPHONE = 'username or telephone',
}

export const socialMediaVariationList: SocialMediaVariationList = [
  {
    id: 'fab9a32f-e968-495e-807f-7f1b27642506',
    name: 'Discord',
    icon: DiscordIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.USERNAME,
    shareTypeDisplay: ShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.COPY,
    shareActionDataFormat: `%%PROFILE%%`,
  },
  {
    id: 'efc5e269-195b-47e8-8634-b1899c00df9b',
    name: 'Instagram',
    icon: InstagramIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.USERNAME,
    shareTypeDisplay: ShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://instagram.com/%%PROFILE%%/`,
  },
  {
    id: '607223cc-7fbc-4b44-a595-e84d62146f30',
    name: 'Keybase',
    icon: KeybaseIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.USERNAME,
    shareTypeDisplay: ShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://keybase.io/%%PROFILE%%/`,
  },
  {
    id: 'd750bd42-e2d3-465f-a3fd-40fde0080022',
    name: 'LinkedIn',
    icon: LinkedinIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.URL,
    shareTypeDisplay: ShareTypeDisplay.URL,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://www.linkedin.com/in/%%PROFILE%%/`,
  },
  {
    id: '50ea1e56-f53b-4fa9-bbcb-846a3f3ac7b6',
    name: 'Medium',
    icon: MediumIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.URL,
    shareTypeDisplay: ShareTypeDisplay.URL,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `%%PROFILE%%`,
  },
  {
    id: '65a174ff-b823-4abd-9dbb-ae0f46f7bc53',
    name: 'Reddit',
    icon: RedditIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.USERNAME,
    shareTypeDisplay: ShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://www.reddit.com/user/%%PROFILE%%/`,
  },
  {
    id: '0e92b39b-e1b5-4236-be40-7377aadca4db',
    name: 'Signal',
    icon: SignalIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.TELEPHONE,
    shareTypeDisplay: ShareTypeDisplay.TELEPHONE,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `%%PROFILE%%`,
  },
  {
    id: '4fc96842-0d3d-40ba-bb39-1aaf59a48a59',
    name: 'Telegram',
    icon: TelegramIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.USERNAME,
    shareTypeDisplay: ShareTypeDisplay.USERNAME_OR_TELEPHONE,
    shareActionType: SocialMediaShareActionType.COPY_IF_PHONE_LINK_IF_USERNAME,
    shareActionDataFormat: `https://t.me/%%PROFILE%%/`,
  },
  {
    id: 'a8b188b1-f9f9-416d-b002-7b7faf6e2d41',
    name: 'Twitter',
    icon: TwitterIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.USERNAME,
    shareTypeDisplay: ShareTypeDisplay.USERNAME,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://twitter.com/%%PROFILE%%/`,
  },
  {
    id: '283ade8a-6ef1-4d38-a744-70ee2f478ba4',
    name: 'Whatsapp',
    icon: WhatsappIcon,
    type: SocialMediaType.SOCIAL_PROFILE,
    shareType: ShareType.TELEPHONE,
    shareTypeDisplay: ShareTypeDisplay.TELEPHONE,
    shareActionType: SocialMediaShareActionType.OPEN_LINK,
    shareActionDataFormat: `https://wa.me/%%PROFILE%%/`,
  },
];

export default Object.freeze(socialMediaVariationList);
