import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from '@/store/hooks';
import { CONNECTION_STALE_AGE, ORANGE } from '@/utils/constants';
import { photoDirectory } from '@/utils/filesystem';
import { staleConnection } from '@/actions';
import { DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import { WHITE, LIGHT_ORANGE, DARK_ORANGE, RED, BLUE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import Pencil from '@/components/Icons/Pencil';
import { ConnectionStatus } from '@/components/Helpers/ConnectionStatus';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop connectionTime
 * @prop photo
 */

type Props = Connection & {
  isSelectionActive?: boolean;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  isModify?: boolean;
  index: number;
  activeBefore: number;
  activeAfter: number;
};

const RecoveryConnectionCard = (props: Props) => {
  const stale_check_timer = useRef<TimeoutId>(null);
  const navigation = useNavigation();
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
    isModify,
    isSelectionActive,
    onSelect,
    isSelected,
    activeAfter,
    activeBefore,
  } = props;
  const { t } = useTranslation();

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
          // start timer to check if connection got verified after maximum channel lifetime
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

  const ModifyConnection = () => (
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => {
        navigation.navigate('SetTrustlevel', {
          connectionId: id,
        });
      }}
    >
      <Pencil highlight={WHITE} color={BLUE} />
    </TouchableOpacity>
  );

  const Selection = () => {
    return (
      <TouchableOpacity
        style={{
          flexGrow: 1,
          paddingRight: DEVICE_LARGE ? 15 : 13.5,
          alignItems: 'flex-end',
          justifyContent: 'center',
          alignSelf: 'center',
        }}
        onPress={() => onSelect(id)}
      >
        <IonIcons
          name={isSelected ? 'checkbox' : 'md-square-outline'}
          color={ORANGE}
          size={DEVICE_LARGE ? 26 : 24}
        />
      </TouchableOpacity>
    );
  };

  const imageSource =
    photo?.filename && !imgErr
      ? {
          uri: `file://${photoDirectory()}/${photo.filename}`,
        }
      : require('@/static/default_profile.jpg');

  const s1 = activeAfter
    ? `activates in ${moment.duration(activeAfter, 'milliseconds').humanize()}`
    : '';
  const s2 = activeBefore
    ? `deactivates in ${moment
        .duration(activeBefore, 'milliseconds')
        .humanize()}`
    : '';
  const activeTime = `${s1} ${s2}`;
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
            navigation.navigate('Connection', { connectionId: id });
          }}
          accessibilityLabel={t(
            'connections.accessibilityLabel.viewConnectionDetails',
          )}
        >
          <View style={[styles.info, { maxWidth: WIDTH * 0.56, flexGrow: 1 }]}>
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
              infoText={activeTime}
              level={level}
            />
          </View>
        </TouchableOpacity>
        {isSelectionActive && <Selection />}
        {isModify && <ModifyConnection />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: DEVICE_LARGE ? 102 : 92,
    alignItems: 'center',
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
  editButton: {
    width: DEVICE_LARGE ? 60 : 56,
    position: 'absolute',
    right: 0,
  },
  activeText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[12],
    color: RED,
    fontStyle: 'italic',
  },
});

export default RecoveryConnectionCard;
