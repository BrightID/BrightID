import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LIGHT_BLACK, ORANGE, WHITE, DARK_RED } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import ChatBox from '@/components/Icons/ChatBox';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { discordUrl } from '@/utils/constants';

const MissingKeysScreen = ({ keyError }: { keyError: string }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {t('missingKeysScreen.header', 'Corrupt keypair')}
        </Text>
        <Text style={styles.subHeaderText}>
          {t(
            'missingKeysScreen.subHeader',
            'The signing keys on this device got lost or corrupted. You can not use the BrightID app unless this is fixed.',
          )}
        </Text>
      </View>
      <View style={styles.keyErrorContainer}>
        <Text style={styles.keyErrorText}>
          Error: <Text style={{ fontStyle: 'italic' }}>{keyError}</Text>
        </Text>
      </View>
      <ScrollView style={styles.resetInfoContainer} persistentScrollbar={true}>
        <View>
          <Text style={styles.optionHeaderText}>
            {t('missingKeysScreen.recoveryOptions', 'Recovery options')}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionHeaderText}>
            {t(
              'missingKeysScreen.options.socialRecovery',
              'Perform Social recovery',
            )}
          </Text>
          <Text style={styles.preconditionText}>
            {t(
              'missingKeysScreen.options.socialRecovery.notes',
              'Precondition: You have social recovery set up',
            )}
          </Text>

          <View style={styles.sectionItem}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.sectionItemText}>
              {t(
                'missingKeysScreen.options.reinstall',
                'Uninstall and reinstall BrightID app',
              )}
            </Text>
          </View>

          <View style={styles.sectionItem}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.sectionItemText}>
              {t(
                'missingKeysScreen.options.socialRecovery.selectRecovery',
                'Select "Recover" option at startup',
              )}
            </Text>
          </View>

          <View style={styles.sectionItem}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.sectionItemText}>
              {t(
                'missingKeysScreen.options.socialRecovery.followWorkflow',
                'Follow the Recovery workflow',
              )}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeaderText}>
            {t(
              'missingKeysScreen.options.import',
              'Import from another device',
            )}
          </Text>
          <Text style={styles.preconditionText}>
            {t(
              'missingKeysScreen.options.import.notes',
              'Precondition: You have your brightId installed on another device',
            )}
          </Text>
          <View style={styles.sectionItem}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.sectionItemText}>
              {t(
                'missingKeysScreen.options.reinstall',
                'Uninstall and reinstall BrightID app',
              )}
            </Text>
          </View>
          <View style={styles.sectionItem}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.sectionItemText}>
              {t(
                'missingKeysScreen.options.import.selectImport',
                'Select "Import" option at startup',
              )}
            </Text>
          </View>
          <View style={styles.sectionItem}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.sectionItemText}>
              {t(
                'missingKeysScreen.options.import.followWorkflow',
                'Follow the Import workflow',
              )}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeaderText}>
            {t('missingKeysScreen.options.restart', 'Start from scratch')}
          </Text>
          <Text style={styles.preconditionText}>
            {t(
              'missingKeysScreen.options.restart.notes',
              'This is the last-resort option. You will create a new BrightID and lose all existing connections and verifications.',
            )}
          </Text>
          <View style={styles.sectionItem}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.sectionItemText}>
              {t(
                'missingKeysScreen.options.reinstall',
                'Uninstall and reinstall BrightID app',
              )}
            </Text>
          </View>
          <View style={styles.sectionItem}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.sectionItemText}>
              {t(
                'missingKeysScreen.options.restart.selectCreate',
                'Select "Create my BrightID" option at startup',
              )}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.supportSection}>
        <View style={styles.supportHeader}>
          <Text style={styles.supportHeaderText}>Need help?</Text>
        </View>
        <TouchableOpacity
          testID="JoinCommunityBtn"
          style={styles.communityContainer}
          onPress={() => Linking.openURL(discordUrl)}
        >
          <ChatBox
            width={DEVICE_LARGE ? 22 : 20}
            height={DEVICE_LARGE ? 22 : 20}
            color={ORANGE}
          />
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: WHITE,
              marginLeft: 5,
            }}
          >
            <Text style={styles.communityLink}>{t('home.link.community')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    margin: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  header: {
    marginTop: 5,
    marginBottom: 5,
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[20],
    textAlign: 'center',
    color: LIGHT_BLACK,
    marginBottom: 10,
  },
  subHeaderText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: DARK_RED,
  },
  keyErrorContainer: {
    paddingTop: 4,
  },
  keyErrorText: {
    fontWeight: 'bold',
  },
  section: {
    marginTop: 10,
    marginBottom: 15,
  },
  optionHeaderText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[18],
    textAlign: 'center',
    color: LIGHT_BLACK,
  },
  sectionHeaderText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: LIGHT_BLACK,
  },
  sectionItem: {
    flexDirection: 'row',
    marginLeft: 20,
  },
  sectionItemText: {
    flex: 1,
    paddingLeft: 5,
  },
  preconditionText: {
    fontFamily: 'Poppins-Bold',
    fontStyle: 'italic',
    fontSize: fontSize[14],
    marginBottom: 4,
  },
  switchNodeButton: {
    width: '90%',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  switchNodeButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    color: WHITE,
  },
  resetInfoContainer: {
    marginBottom: 3,
    marginTop: 25,
  },
  resetInfoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: LIGHT_BLACK,
  },
  resetButton: {
    width: '70%',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  supportSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_LARGE ? 17 : 15,
  },
  supportHeader: {
    marginTop: 5,
    marginBottom: 5,
  },
  supportHeaderText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    textAlign: 'center',
    color: LIGHT_BLACK,
  },
  communityContainer: {
    marginTop: 5,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: WHITE,
  },
  communityLink: {
    color: ORANGE,
    fontSize: fontSize[14],
    fontFamily: 'Poppins-Bold',
  },
});

export default MissingKeysScreen;
