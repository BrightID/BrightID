import i18next from 'i18next';
import {
  connectionTotal,
  recoveryConnectionsSelector,
} from '@/reducer/connectionsSlice';
import { MIN_RECOVERY_CONNECTIONS } from '@/utils/constants';
import { linkedContextTotal } from '@/reducer/appsSlice';

export const UserTasks = {
  make_first_connection: {
    id: 'make_first_connection',
    sortValue: 10,
    title: i18next.t(`achievements.makeFirstConnection.title`),
    description: i18next.t(`achievements.makeFirstConnection.description`),
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return connectionTotal(state) > 0;
    },
  },
  link_app: {
    id: 'link_app',
    sortValue: 20,
    title: i18next.t(`achievements.linkApp.title`),
    description: i18next.t(`achievements.linkApp.description`),
    url: 'https://apps.brightid.org/',
    checkFn(state) {
      // is there at least one linked context?
      const linkedContexts = linkedContextTotal(state);
      return linkedContexts > 0;
    },
  },
  get_sponsored: {
    id: 'get_sponsored',
    sortValue: 30,
    title: i18next.t(`achievements.getSponsored.title`),
    description: i18next.t(`achievements.getSponsored.description`),
    url: 'https://apps.brightid.org/',
    checkFn(state) {
      return state.user.isSponsored;
    },
  },
  make_two_connection: {
    id: 'make_two_connection',
    sortValue: 50,
    title: i18next.t(`achievements.makeTwoConnection.title`),
    description: i18next.t(`achievements.makeTwoConnection.description`),
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return connectionTotal(state) > 1;
    },
  },
  make_three_connection: {
    id: 'make_three_connection',
    sortValue: 60,
    title: i18next.t(`achievements.makeThreeConnection.title`),
    description: i18next.t(`achievements.makeThreeConnection.description`),
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return connectionTotal(state) > 2;
    },
  },
  setup_backup: {
    id: 'setup_backup',
    sortValue: 65,
    title: i18next.t(`achievements.setupBackup.title`, 'Set backup password'),
    description: i18next.t(
      `achievements.setupBackup.description`,
      'Set password to enable encrypted backup of your data',
    ),
    url: 'https://brightid.gitbook.io/brightid/#backup-your-brightid',
    checkFn(state) {
      return !!state.user.password;
    },
  },
  setup_trusted_connections: {
    id: 'setup_trusted_connections',
    sortValue: 70,
    title: i18next.t(`achievements.setupTrustedConnections.title`),
    description: i18next.t(`achievements.setupTrustedConnections.description`),
    url: 'https://brightid.gitbook.io/brightid/#backup-your-brightid',
    checkFn(state) {
      return (
        recoveryConnectionsSelector(state).length >= MIN_RECOVERY_CONNECTIONS
      );
    },
  },
  join_connection_party: {
    id: 'join_connection_party',
    sortValue: 110,
    title: i18next.t(`achievements.joinConnectionParty.title`),
    description: i18next.t(`achievements.joinConnectionParty.description`),
    url: 'https://www.brightid.org/meet',
    checkFn(state) {
      state.user.verifications.find(
        (verification) =>
          verification.name === 'SeedConnected' &&
          (verification as SeedConnectedVerification).rank > 0,
      );
    },
  },
};
