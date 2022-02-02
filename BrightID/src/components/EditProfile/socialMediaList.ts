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

const isPhoneNumber = (profile: string): boolean => {
  const c = profile[0];
  return c === '+' || (c >= '0' && c <= '9');
};

export const socialMediaList: SocialMediaList = {
  'fab9a32f-e968-495e-807f-7f1b27642506': {
    name: 'Discord',
    shareType: 'username',
    shareTypeDisplay: 'username',
    icon: DiscordIcon,
    getShareAction: (profile: string): SocialMediaShareAction => {
      return {
        actionType: SocialMediaShareActionType.COPY,
        data: `${profile}`,
      };
    },
  },
  'efc5e269-195b-47e8-8634-b1899c00df9b': {
    name: 'Instagram',
    shareType: 'username',
    shareTypeDisplay: 'username',
    icon: InstagramIcon,
    getShareAction: (profile: string): SocialMediaShareAction => ({
      actionType: SocialMediaShareActionType.OPEN_LINK,
      data: `https://instagram.com/${profile}/`,
    }),
  },
  '607223cc-7fbc-4b44-a595-e84d62146f30': {
    name: 'Keybase',
    shareType: 'username',
    shareTypeDisplay: 'username',
    icon: KeybaseIcon,
    getShareAction: (profile: string): SocialMediaShareAction => ({
      actionType: SocialMediaShareActionType.OPEN_LINK,
      data: `https://keybase.io/${profile}/`,
    }),
  },
  'd750bd42-e2d3-465f-a3fd-40fde0080022': {
    name: 'LinkedIn',
    shareType: 'url',
    shareTypeDisplay: 'url',
    icon: LinkedinIcon,
    getShareAction: (profile: string): SocialMediaShareAction => ({
      actionType: SocialMediaShareActionType.OPEN_LINK,
      data: `https://www.linkedin.com/in/${profile}/`,
    }),
  },
  '50ea1e56-f53b-4fa9-bbcb-846a3f3ac7b6': {
    name: 'Medium',
    shareType: 'url',
    shareTypeDisplay: 'url',
    icon: MediumIcon,
    getShareAction: (profile: string): SocialMediaShareAction => ({
      actionType: SocialMediaShareActionType.OPEN_LINK,
      data: `${profile}`,
    }),
  },
  '65a174ff-b823-4abd-9dbb-ae0f46f7bc53': {
    name: 'Reddit',
    shareType: 'username',
    shareTypeDisplay: 'username',
    icon: RedditIcon,
    getShareAction: (profile: string): SocialMediaShareAction => ({
      actionType: SocialMediaShareActionType.OPEN_LINK,
      data: `https://www.reddit.com/user/${profile}/`,
    }),
  },
  '0e92b39b-e1b5-4236-be40-7377aadca4db': {
    name: 'Signal',
    shareType: 'telephone #',
    shareTypeDisplay: 'telephone #',
    icon: SignalIcon,
    getShareAction: (profile: string): SocialMediaShareAction => ({
      actionType: SocialMediaShareActionType.OPEN_LINK,
      data: `${profile}`,
    }),
  },
  '4fc96842-0d3d-40ba-bb39-1aaf59a48a59': {
    name: 'Telegram',
    shareType: 'telephone #',
    shareTypeDisplay: 'username or telephone',
    icon: TelegramIcon,
    getShareAction: (profile: string): SocialMediaShareAction =>
      isPhoneNumber(profile)
        ? {
            actionType: SocialMediaShareActionType.COPY,
            data: `${profile}`,
          }
        : {
            actionType: SocialMediaShareActionType.OPEN_LINK,
            data: `https://t.me/${profile}/`,
          },
  },
  'a8b188b1-f9f9-416d-b002-7b7faf6e2d41': {
    name: 'Twitter',
    shareType: 'username',
    shareTypeDisplay: 'username',
    icon: TwitterIcon,
    getShareAction: (profile: string): SocialMediaShareAction => ({
      actionType: SocialMediaShareActionType.OPEN_LINK,
      data: `https://twitter.com/${profile}/`,
    }),
  },
  '283ade8a-6ef1-4d38-a744-70ee2f478ba4': {
    name: 'Whatsapp',
    shareType: 'telephone #',
    shareTypeDisplay: 'telephone #',
    icon: WhatsappIcon,
    getShareAction: (profile: string): SocialMediaShareAction => ({
      actionType: SocialMediaShareActionType.OPEN_LINK,
      data: `https://wa.me/${profile}/`,
    }),
  },
} as const;

export enum SocialMediaShareActionType {
  OPEN_LINK = 'OPEN_LINK',
  COPY = 'COPY',
}

export default Object.freeze(socialMediaList);
