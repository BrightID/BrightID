import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import i18next from 'i18next';
import { useDispatch, useSelector } from '@/store/hooks';
import { connection_levels, CONNECTION_STALE_AGE } from '@/utils/constants';
import { photoDirectory } from '@/utils/filesystem';
import { addOperation, deleteConnection, staleConnection } from '@/actions';
import { DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import {
  DARK_ORANGE,
  LIGHT_BLACK,
  LIGHT_ORANGE,
  RED,
  WHITE,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { ConnectionStatus } from '@/components/Helpers/ConnectionStatus';
import { backupUser } from '@/components/Onboarding/RecoveryFlow/thunks/backupThunks';
import { encryptAesKey } from '@/utils/invites';
import { useNodeApiContext } from '@/context/NodeApiContext';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop connectionTime
 * @prop photo
 */
type Props = Connection & { index: number };

const ConnectionCard = (props: Props) => {
  const stale_check_timer = useRef<TimeoutId>(null);
  const { backupCompleted } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const route: { params?: { group: Group } } = useRoute() as {
    params?: { group: Group };
  };
  const { api } = useNodeApiContext();
  const dispatch = useDispatch();
  const {
    status,
    connectionDate,
    id,
    name,
    photo,
    reportReason,
    index,
    level,
  } = props;
  const { t } = useTranslation();
  const { secretKey } = useSelector((state) => state.keypair);
  const group = route.params?.group;
  const [imgErr, setImgErr] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // if we have a "waiting" connection, start timer to handle stale connection requests
      if (status === 'initiated') {
        const checkStale = () => {
          const ageMs = Date.now() - connectionDate;
          if (ageMs > CONNECTION_STALE_AGE) {
            console.log(`Connection ${name} is stale (age: ${ageMs} ms)`);
            return true;
          }
          return false;
        };
        if (checkStale()) {
          // this is already old. Immediately mark as "stale", no need for a timer.
          dispatch(staleConnection(id));
        } else {
          // start timer to check if connection got verified after waiting CONNECTION_STALE_AGE ms
          let checkTime =
            connectionDate + CONNECTION_STALE_AGE + 5000 - Date.now(); // add 5 seconds buffer
          if (checkTime < 0) {
            console.log(`Warning - checkTime in past: ${checkTime}`);
            checkTime = 1000; // check in 1 second
          }

          if (stale_check_timer.current) {
            clearTimeout(stale_check_timer.current);
          }
          console.log(`Marking connection as stale in ${checkTime}ms.`);
          stale_check_timer.current = setTimeout(() => {
            if (checkStale()) {
              dispatch(staleConnection(id));
            }
          }, checkTime);
        }
      }
      return () => {
        // clear timer if it is set
        if (stale_check_timer.current) {
          clearTimeout(stale_check_timer.current);
          stale_check_timer.current = null;
        }
      };
    }, [connectionDate, dispatch, id, name, status]),
  );

  useEffect(() => {
    if (stale_check_timer.current && status === 'verified') {
      console.log(
        `Connection ${name} changed 'initiated' -> 'verified'. Stopping stale_check_timer ID ${stale_check_timer.current}.`,
      );
      clearTimeout(stale_check_timer.current);
      stale_check_timer.current = null;
    }
  }, [name, status]);

  const { showActionSheetWithOptions } = useActionSheet();

  const removeOptions = [
    t('connections.removeActionSheet.remove'),
    t('common.actionSheet.cancel'),
  ];

  const showRemove =
    status === 'deleted' ||
    status === 'stale' ||
    level === connection_levels.REPORTED;

  const RemoveConnection = () =>
    showRemove ? (
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          showActionSheetWithOptions(
            {
              options: removeOptions,
              cancelButtonIndex: removeOptions.length - 1,
              destructiveButtonIndex: 0,
              title: t('connections.removeActionSheet.title'),
              message: t('connections.removeActionSheet.info', { name }),
              showSeparators: true,
              textStyle: {
                textAlign: 'center',
                width: '100%',
              },
            },
            async (index) => {
              if (index === 0) {
                dispatch(deleteConnection(id));
                if (backupCompleted) {
                  await dispatch(backupUser());
                }
              }
            },
          );
        }}
      >
        <Material
          color={LIGHT_BLACK}
          name="close"
          size={DEVICE_LARGE ? 22 : 18}
        />
      </TouchableOpacity>
    ) : (
      <View />
    );

  const imageSource =
    photo?.filename && !imgErr
      ? {
          uri: `file://${photoDirectory()}/${photo?.filename}`,
        }
      : require('@/static/default_profile.jpg');

  const handlePress = async (id: string) => {
    if (group) {
      console.log(`Inviting connection ${id} to group ${group.id}`);
      try {
        const { signingKeys } = await api.getProfile(id);
        const data = await encryptAesKey(
          group?.aesKey,
          signingKeys[0],
          secretKey,
        );
        const op = await api.invite(id, group?.id, data);
        dispatch(addOperation(op));
        Alert.alert(
          i18next.t('groups.alert.title.inviteSuccess'),
          i18next.t('groups.alert.text.inviteSuccess', { name }),
        );
        navigation.goBack();
      } catch (err) {
        Alert.alert(i18next.t('common.alert.error'), err.message);
      }
    } else {
      navigation.navigate('Connection', { connectionId: id });
    }
  };

  return (
    <View style={styles.container} testID="connectionCardContainer">
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
          testID={`ConnectionCard-${index}`}
          onPress={() => {
            handlePress(id);
          }}
          accessibilityLabel={t(
            'connections.accessibilityLabel.viewConnectionDetails',
          )}
        >
          <View style={[styles.info, { maxWidth: WIDTH * 0.56 }]}>
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
            </View>
            <ConnectionStatus
              index={index}
              status={status}
              reportReason={reportReason}
              connectionDate={connectionDate}
              level={level}
            />
          </View>
        </TouchableOpacity>
        <RemoveConnection />
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
    width: '90%',
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
  statusContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  connectionLevel: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[12],
    marginTop: DEVICE_LARGE ? 3 : 1,
  },
  connectionTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[10],
    color: DARK_ORANGE,
  },
  moreIcon: {
    marginRight: DEVICE_LARGE ? 26 : 23,
  },
  waitingMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[13],
    color: LIGHT_ORANGE,
    marginTop: DEVICE_LARGE ? 2 : 0,
  },
  deletedMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: RED,
    marginTop: DEVICE_LARGE ? 5 : 2,
    textTransform: 'capitalize',
  },
  removeButton: {
    width: DEVICE_LARGE ? 36 : 32,
    position: 'absolute',
    right: 0,
  },
});

export default ConnectionCard;
