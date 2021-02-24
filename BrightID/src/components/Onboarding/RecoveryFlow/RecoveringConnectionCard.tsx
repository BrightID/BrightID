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
import { useDispatch } from '@/store';
import { DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import { photoDirectory } from '@/utils/filesystem';
import { GREY, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { ConnectionStatus } from '@/components/Helpers/ConnectionStatus';
import ChannelAPI from '@/api/channelService';
import api from '@/api/brightId';
import VerifiedSticker from '@/components/Icons/VerifiedSticker';
import { uploadSig, uploadMutualInfo } from './thunks/channelUploadThunks';

const RecoveringConnectionCard = (props) => {
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
  const dispatch = useDispatch();

  const brightidVerified = verifications?.includes('BrightID');

  const confirmConnectionSelection = () => {
    Alert.alert(
      t('common.alert.title.pleaseConfirm'),
      t('restore.alert.text.restoreConfirm', { name }),
      [
        {
          text: 'Yes',
          onPress: handleConnectionSelect,
        },
        {
          text: 'No',
          onPress: () => null,
        },
      ],
    );
  };

  const handleConnectionSelect = async () => {
    try {
      setUploadingData(true);

      const url = new URL(`${api.baseUrl}/profile`);
      const channelApi = new ChannelAPI(url.href);

      // it's important to upload mutal connections first so that we can guarantee the other user downloads them when they recieve the sig
      await dispatch(
        uploadMutualInfo({
          conn: props,
          aesKey,
          channelApi,
        }),
      );

      await dispatch(uploadSig({ id, aesKey, channelApi }));

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
    } catch (err) {
      Alert.alert(t('common.alert.error'), err.message);
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
              <View style={styles.verificationSticker}>
                <VerifiedSticker width={16} height={16} />
              </View>
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
    backgroundColor: WHITE,
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
    fontSize: fontSize[16],
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[12],
    color: GREY,
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 16,
  },
  verificationSticker: {
    marginLeft: DEVICE_LARGE ? 7 : 3.5,
  },
});

export default RecoveringConnectionCard;
