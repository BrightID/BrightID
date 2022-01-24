// uuid's generated via npx uuid
import RedditIcon from '@/static/socialmedia/icons8-reddit.svg'
import RedditIconGrayscale from '@/static/socialmedia/grayscale/icons8-reddit-grayscale.svg'
import LinkedinIcon from '@/static/socialmedia/icons8-linkedin.svg'
import LinkedinIconGrayscale from '@/static/socialmedia/grayscale/icons8-linkedin-grayscale.svg'
import WhatsappIcon from '@/static/socialmedia/icons8-whatsapp.svg'
import WhatsappIconGrayscale from '@/static/socialmedia/grayscale/icons8-whatsapp-grayscale.svg'
import InstagramIcon from '@/static/socialmedia/icons8-instagram.svg'
import InstagramIconGrayscale from '@/static/socialmedia/grayscale/icons8-instagram-grayscale.svg'
import SignalIcon from '@/static/socialmedia/icons8-signal-app.svg'
import SignalIconGrayscale from '@/static/socialmedia/grayscale/icons8-signal-app-grayscale.svg'
import TelegramIcon from '@/static/socialmedia/icons8-telegram-app.svg'
import TelegramIconGrayscale from '@/static/socialmedia/grayscale/icons8-telegram-app-grayscale.svg'
import DiscordIcon from '@/static/socialmedia/icons8-discord-bubble.svg'
import DiscordIconGrayscale from '@/static/socialmedia/grayscale/icons8-discord-bubble-grayscale.svg'
import KeybaseIcon from '@/static/socialmedia/Keybase_logo_official.svg'
import KeybaseIconGrayscale from '@/static/socialmedia/grayscale/Keybase_logo_official-grayscale.svg'
import MediumIcon from '@/static/socialmedia/icons8-medium-monogram.svg'
import MediumIconGrayscale from '@/static/socialmedia/grayscale/icons8-medium-monogram-grayscale.svg'
import TwitterIcon from '@/static/socialmedia/icons8-twitter-circled.svg'
import TwitterIconGrayscale from '@/static/socialmedia/grayscale/icons8-twitter-circled-grayscale.svg'

export const socialMediaList : SocialMediaList = {
  'fab9a32f-e968-495e-807f-7f1b27642506': {
    name: 'Discord',
    shareType: 'username',
    icon: DiscordIcon,
    iconGrayscale: DiscordIconGrayscale,
    urlBuilder: (profile: string) => `${profile}`,
  },
  'efc5e269-195b-47e8-8634-b1899c00df9b': {
    name: 'Instagram',
    shareType: 'username',
    icon: InstagramIcon,
    iconGrayscale: InstagramIconGrayscale,
    urlBuilder: (profile: string) => `https://instagram.com/${profile}/`,
  },
  '607223cc-7fbc-4b44-a595-e84d62146f30': {
    name: 'Keybase',
    shareType: 'username',
    icon: KeybaseIcon,
    iconGrayscale: KeybaseIconGrayscale,
    urlBuilder: (profile: string) => `https://keybase.io/${profile}/`,
  },
  'd750bd42-e2d3-465f-a3fd-40fde0080022': {
    name: 'LinkedIn',
    shareType: 'url',
    icon: LinkedinIcon,
    iconGrayscale: LinkedinIconGrayscale,
    urlBuilder: (profile: string) => `https://www.linkedin.com/in/${profile}/`,
  },
  '50ea1e56-f53b-4fa9-bbcb-846a3f3ac7b6': {
    name: 'Medium',
    shareType: 'url',
    icon: MediumIcon,
    iconGrayscale: MediumIconGrayscale,
    urlBuilder: (profile: string) => `${profile}`,
  },
  '65a174ff-b823-4abd-9dbb-ae0f46f7bc53': {
    name: 'Reddit',
    shareType: 'username',
    icon: RedditIcon,
    iconGrayscale: RedditIconGrayscale,
    urlBuilder: (profile: string) => `https://www.reddit.com/user/${profile}/`,
  },
  '0e92b39b-e1b5-4236-be40-7377aadca4db': {
    name: 'Signal',
    shareType: 'telephone #',
    icon: SignalIcon,
    iconGrayscale: SignalIconGrayscale,
    urlBuilder: (profile: string) => `${profile}`,
  },
  '4fc96842-0d3d-40ba-bb39-1aaf59a48a59': {
    name: 'Telegram',
    shareType: 'telephone #',
    icon: TelegramIcon,
    iconGrayscale: TelegramIconGrayscale,
    urlBuilder: (profile: string) => `https://t.me/${profile}/`,
  },
  'a8b188b1-f9f9-416d-b002-7b7faf6e2d41': {
    name: 'Twitter',
    shareType: 'username',
    icon: TwitterIcon,
    iconGrayscale: TwitterIconGrayscale,
    urlBuilder: (profile: string) => `https://twitter.com/${profile}/`,
  },
  '283ade8a-6ef1-4d38-a744-70ee2f478ba4': {
    name: 'Whatsapp',
    shareType: 'telephone #',
    icon: WhatsappIcon,
    iconGrayscale: WhatsappIconGrayscale,
    urlBuilder: (profile: string) => `https://wa.me/${profile}/`,
  },
} as const;

export default Object.freeze(socialMediaList);
