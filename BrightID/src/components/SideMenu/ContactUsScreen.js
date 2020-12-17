// @flow

import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { DARK_ORANGE, BLUE, WHITE, BLACK } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import keybaseLogo from '@/static/keybase_logo.svg';
import { useTranslation } from 'react-i18next';

const SocialItem = ({ name, icon, color, url }) => {
  return (
    <TouchableOpacity
      style={styles.socialItem}
      onPress={() => Linking.openURL(url)}
    >
      <Material name={icon} size={DEVICE_LARGE ? 36 : 32} color={color} />
    </TouchableOpacity>
  );
};

const KeybaseItem = () => (
  <TouchableOpacity
    style={styles.socialItem}
    onPress={() => Linking.openURL('https://keybase.io/team/brightid')}
  >
    <SvgXml
      xml={keybaseLogo}
      width={DEVICE_LARGE ? 36 : 32}
      height={DEVICE_LARGE ? 36 : 32}
    />
  </TouchableOpacity>
);

export const ContactUsScreen = function () {
  const { t } = useTranslation();
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
  const isDrawerOpen = useIsDrawerOpen();

  return (
    <View
      style={[
        styles.container,
        { marginTop: headerHeight },
        !isDrawerOpen && styles.shadow,
      ]}
      testID="graphExplorerScreen"
    >
      <Text style={styles.title}>{t('contact.title.contactUs')}</Text>
      <View style={styles.itemList}>
        <Text style={styles.listHeader}>{t('contact.label.email')}</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:support@brightid.org')}
        >
          <Text style={styles.link}>support@brightid.org</Text>
        </TouchableOpacity>
        <Text style={styles.listHeader}>{t('contact.label.website')}</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://brightid.org')}
        >
          <Text style={styles.link}>https://brightid.org</Text>
        </TouchableOpacity>
        <Text style={styles.listHeader}>{t('contact.label.meet')}</Text>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL('https://www.brightid.org/meet');
          }}
        >
          <Text style={styles.link}>{t('contact.text.meet')}</Text>
        </TouchableOpacity>
        <Text style={styles.listHeader}>{t('contact.label.socialMedia')}</Text>
        <View style={styles.socialMedia}>
          <SocialItem
            name="github"
            icon="github"
            color={BLACK}
            url="https://github.com/brightid"
          />
          <KeybaseItem />
          <SocialItem
            name="discord"
            icon="discord"
            color="#6E84D3"
            url="https://discord.gg/GkYM5Jy"
          />
          <SocialItem
            name="telegram"
            icon="telegram"
            color="#39A0DA"
            url="https://t.me/brightid"
          />
          <SocialItem
            name="twitter"
            icon="twitter"
            color="#52A7E7"
            url="https://twitter.com/BrightIDProject"
          />
        </View>

        <Text style={styles.bottomText}>
          {t('contact.text.weAre')}
          <Text
            onPress={() => {
              Linking.openURL('https://github.com/BrightID/BrightID/releases');
            }}
            style={styles.link}
          >
            {t('contact.text.openSource')}
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
  },
  shadow: {
    shadowColor: 'rgba(196, 196, 196, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    marginTop: DEVICE_LARGE ? 23 : 20,
  },
  itemList: {
    marginHorizontal: 'auto',
    flex: 1,
    marginTop: DEVICE_LARGE ? 20 : 15,
    width: '100%',
    paddingLeft: DEVICE_LARGE ? 50 : 40,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: DEVICE_LARGE ? 8 : 6,
    marginRight: 10,
  },
  socialName: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    marginLeft: DEVICE_LARGE ? 15 : 12,
  },
  listHeader: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: DARK_ORANGE,
    marginVertical: DEVICE_LARGE ? 20 : 18,
  },
  socialMedia: {
    flexDirection: 'row',
    width: '100%',
  },
  bottomText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    marginVertical: DEVICE_LARGE ? 20 : 18,
  },
  link: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: BLUE,
  },
});

export default ContactUsScreen;
