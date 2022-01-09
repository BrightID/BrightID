import React, { useState, useContext } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert
} from 'react-native';
import Material from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from '@/store';
import { selectActiveDevices, addDevice } from '@/reducer/devicesSlice';
import { useNavigation } from '@react-navigation/native';
import { fontSize } from '@/theme/fonts';
import { WHITE, ORANGE, BLUE, BLACK } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { NodeApiContext } from '@/components/NodeApiGate';
import { removeDevice } from '@/actions';


/* Description */

/* ======================================== */

/**
 * Screen for listing devices
 */

/* Devices Screen */

/* ======================================== */
export const DevicesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const api = useContext(NodeApiContext);
  const devices = useSelector(selectActiveDevices);
  const shortenSigningKey = (s) => `${s.slice(0, 6)}...${s.slice(-6)}`;
  const signingKey = useSelector((state) => state.keypair.publicKey);
  const isCurrentDevice = (d) => d.signingKey === signingKey
  const getName = (d) => isCurrentDevice(d) ? 'Current device' : d.name || 'Unknown';

  const remove = (device) => {
    Alert.alert(
      t("devices.text.confirmRemoveTitle"),
      t("devices.text.confirmRemove", { name: getName(device) }),
      [{
        text: "Yes",
        onPress: () => {
          api.removeSigningKey(device.signingKey).then(() => {
            dispatch(removeDevice(device.signingKey));
          });
        },
      }, {
        text: "No",
      }]
    );
  }

  const renderItem = ({ item: device, index }) => (
    <View testID={`device-${index}`} style={styles.deviceContainer}>
      <View style={styles.deviceLabel}>
        <Text style={styles.deviceName}>{getName(device)}</Text>
        <Text style={styles.deviceSigningKey}>{ shortenSigningKey(device.signingKey) }</Text>
      </View>
      <View style={{ flex: 1 }} />
      {!isCurrentDevice(device) && (
        <TouchableOpacity
          style={styles.removeBtn}
          testID={`RemoveDeviceBtn-${index}`}
          onPress={() => remove(device)}
        >
          <Material name="delete" size={DEVICE_LARGE ? 22 : 20} color={BLUE} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="DevicesScreen">
        <View style={styles.devicesContainer}>
          <Text style={styles.description}>{t('devices.text.listDescription')}</Text>
          <FlatList
            data={devices}
            renderItem={renderItem}
            keyExtractor={(item) => item.signingKey}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    overflow: 'hidden',
    zIndex: 2,
  },
  devicesContainer: {
    padding: 30,
  },
  deviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  deviceName: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: BLACK,
  },
  deviceSigningKey: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: BLUE,
  },
  description: {
    fontSize: fontSize[16],
    padding: 10,
    marginBottom: 20,
  }
});

export default DevicesScreen;
