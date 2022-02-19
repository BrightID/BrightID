import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { ORANGE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

type Props = {
  data: AppInfo[];
  onPress: () => void;
};

export default function ApplicationLinkedCard(props: Props) {
  const { apps, otherApps } = useMemo(() => {
    if (props.data.length > 3) {
      return { apps: props.data.slice(0, 2), otherApps: props.data.slice(2) };
    } else {
      return { apps: props.data, otherApps: [] };
    }
  }, [props.data]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.rowHeader} onPress={props.onPress}>
        <Text style={{ fontFamily: 'Poppins-Bold' }}>Application Linked</Text>
        <Material name="arrow-right" size={25} color={ORANGE} />
      </TouchableOpacity>

      <FlatList
        data={apps}
        style={{ flexGrow: 0 }}
        renderItem={({ item }) => (
          <View style={styles.rowDetail}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: item.logo !== '' ? item.logo : null }}
                style={styles.logo}
              />
            </View>
            <Text style={styles.appLabel}>{item.context}</Text>
            <View />
          </View>
        )}
      />

      {otherApps.length !== 0 && (
        <View style={styles.otherAppsContainer}>
          <View style={styles.absoluteLogoContainer}>
            <Image
              source={{
                uri: otherApps[1].logo !== '' ? otherApps[1].logo : null,
              }}
              style={styles.absoluteLogo}
            />
          </View>
          <View>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri: otherApps[0].logo !== '' ? otherApps[0].logo : null,
                }}
                style={styles.logo}
              />
            </View>
          </View>
          <Text style={styles.appLabel}>
            {otherApps.length} more linked apps
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 330,
    height: 250,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: 'rgba(0, 0, 1, 10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rowDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  appLabel: {
    marginLeft: DEVICE_LARGE ? 30 : 20,
    fontFamily: 'Poppins-Medium',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DEVICE_LARGE ? 30 : 25,
    padding: 5,
    backgroundColor: 'white',
    shadowColor: 'rgba(0, 0, 1, 10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 3,
    overflow: 'visible',
  },
  logo: {
    borderRadius: DEVICE_LARGE ? 25 : 20,
    width: DEVICE_LARGE ? 35 : 25,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  absoluteLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DEVICE_LARGE ? 30 : 25,
    padding: 5,
    backgroundColor: 'white',
    shadowColor: 'rgba(0, 0, 1, 10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 6,
    overflow: 'visible',
    position: 'absolute',
    left: 20,
    zIndex: 999,
  },
  absoluteLogo: {
    borderRadius: DEVICE_LARGE ? 25 : 20,
    width: DEVICE_LARGE ? 35 : 25,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  otherAppsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
