// @flow

import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import verificationSticker from '@/static/verification-sticker.svg';
import { DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import { photoDirectory } from '@/utils/filesystem';
import ChannelAPI from '@/api/channelService';
import api from '@/api/brightId';
import { ConnectionStatus } from '@/components/Helpers/ConnectionStatus';
import { loadRecoveryData, uploadSig, uploadMutualInfo } from './helpers';

const RecoveryConnectionCard = (props) => {
  const {
    status,
    verifications,
    id,
    aesKey,
    photo,
    name,
    connectionDate,
    index,
    level,
    hiddenFlag,
    setUploadingData,
  } = props;

  const [imgErr, setImgErr] = useState(false);

  const { t } = useTranslation();
  const navigation = useNavigation();

  const brightidVerified = verifications?.includes('BrightID');

  const confirmConnectionSelection = () => {
    Alert.alert(
      'Please Confirm',
      `Is ${name} the account you are helping to recover?`,
      [
        {
          text: 'Yes',
          onPress: handleConnectionSelect,
        },
        {
          text: 'No',
          onPress: () => {},
        },
      ],
    );
  };

  const handleConnectionSelect = async () => {
    try {
      setUploadingData(true);
      const ipAddress = await api.ip();
      const channelApi = new ChannelAPI(`http://${ipAddress}/profile`);
      const { signingKey, timestamp } = await loadRecoveryData(
        channelApi,
        aesKey,
      );
      await uploadSig({ id, timestamp, signingKey, channelApi, aesKey });
      uploadMutualInfo(props, channelApi, aesKey).then(() => {
        Alert.alert(
          t('common.alert.info'),
          t('restore.alert.text.requestRecovering'),
          [
            {
              text: t('common.alert.ok'),
              onPress: () => navigation.navigate('Home'),
            },
          ],
        );
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const imageSource =
    photo?.filename && !imgErr
      ? {
          uri: `file://${photoDirectory()}/${photo?.filename}`,
        }
      : require('@/static/default_profile.jpg');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('FullScreenPhoto', { photo });
          }}
          accessibilityLabel={t('connections.accessibilityLabel.viewPhoto')}
          accessibilityRole="imagebutton"
        >
          <Image
            source={imageSource}
            style={styles.photo}
            accessibilityLabel={t(
              'connections.accessibilityLabel.connectionPhoto',
            )}
            onError={() => {
              console.log('settingImgErr');
              setImgErr(true);
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.info, { maxWidth: WIDTH * 0.56 }]}
          onPress={confirmConnectionSelection}
        >
          <View
            style={[styles.nameContainer]}
            testID={`connection_name-${index}`}
          >
            <Text
              numberOfLines={1}
              style={styles.name}
              testID={`connectionCardText-${index}`}
            >
              {name}
            </Text>
            {brightidVerified && (
              <SvgXml
                style={styles.verificationSticker}
                width="16"
                height="16"
                xml={verificationSticker}
              />
            )}
          </View>
          <ConnectionStatus
            index={index}
            status={status}
            hiddenFlag={hiddenFlag}
            connectionDate={connectionDate}
            level={level}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: DEVICE_LARGE ? 102 : 92,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  card: {
    width: '93%',
    height: DEVICE_LARGE ? 76 : 71,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: 'rgba(221, 179, 169, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    borderTopLeftRadius: DEVICE_LARGE ? 12 : 10,
    borderBottomLeftRadius: DEVICE_LARGE ? 12 : 10,
  },
  photo: {
    borderRadius: 55,
    width: DEVICE_LARGE ? 65 : 55,
    height: DEVICE_LARGE ? 65 : 55,
    marginLeft: DEVICE_LARGE ? 14 : 12,
    marginTop: -30,
  },
  info: {
    marginLeft: DEVICE_LARGE ? 22 : 19,
    flex: 1,
    height: DEVICE_LARGE ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  scoreRight: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 12,
    color: '#aba9a9',
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default RecoveryConnectionCard;
