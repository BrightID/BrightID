import * as React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTranslation, Trans } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { WHITE, BLUE, DARKER_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

const learnMoreUrl =
  'https://docs.google.com/document/d/1CEBWv4ImXsZYQ2Qll7BXojeKI9CGtzRXjB9aFIj00c4/edit#heading=h.nr1odgliy5nk';

const handleLearnMore = () => {
  Linking.openURL(learnMoreUrl).catch((err) =>
    console.log(`Failed to open "${learnMoreUrl}", error was: ${err}`),
  );
};

export const NoGroups = ({ navigation }: Props) => {
  const { t } = useTranslation();
  return (
    <View style={styles.noContainer} testID="noGroupsView">
      <View style={styles.noGroupsInfo}>
        <Image
          source={require('../../static/groups.png')}
          style={styles.smallGroupsLogo}
          resizeMode="cover"
          onError={(e) => {
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel={t('groups.accessibilityLabel.groupsLogo')}
        />
        <View>
          <Trans
            i18nKey="groups.text.noGroups"
            components={{ text: <Text style={styles.emptyGroupsText} /> }}
          />
        </View>
      </View>
      <View style={styles.emptyButtons}>
        <TouchableOpacity
          testID="groupsLearnMoreBtn"
          style={styles.learnMoreButton}
          onPress={handleLearnMore}
        >
          <Text style={styles.learnMoreText}>
            {t('groups.button.learnMore')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="groupsCreateGroupBtn"
          style={styles.createGroupButton}
          onPress={() => {
            navigation.navigate('GroupInfo');
          }}
        >
          <Text style={styles.createGroupText}>
            {t('groups.button.createGroup')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  noContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
    backgroundColor: WHITE,
  },
  noGroupsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 17,
  },
  emptyGroupsText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[18],
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: DARKER_GREY,
  },
  learnMoreButton: {
    borderRadius: 3,
    borderColor: BLUE,
    borderWidth: 1,
    width: DEVICE_LARGE ? 150 : 125,
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnMoreText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: fontSize[18],
    fontWeight: '500',
    textAlign: 'center',
    color: BLUE,
  },
  createGroupButton: {
    marginLeft: 14.5,
    borderRadius: 3,
    backgroundColor: BLUE,
    width: DEVICE_LARGE ? 150 : 125,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createGroupText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: fontSize[18],
    fontWeight: '500',
    color: WHITE,
    textAlign: 'center',
  },
  smallGroupsLogo: {
    width: 135,
    height: 135,
    marginRight: 20,
  },
});