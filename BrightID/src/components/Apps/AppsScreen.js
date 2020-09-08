// @flow

import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  View,
  FlatList,
  Text,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import EmptyList from '@/components/Helpers/EmptyList';
import Spinner from 'react-native-spinkit';
import { ORANGE, DEVICE_LARGE } from '@/utils/constants';
import { any, find, propEq } from 'ramda';
import { fetchApps } from '@/actions';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AppCard from './AppCard';
import { handleAppContext } from './model';

export const AppsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const apps = useSelector((state) => state.apps.apps);
  const isSponsored = useSelector((state) => state.user.isSponsored);
  const linkedContexts = useSelector((state) => state.apps.linkedContexts);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchApps());
    }, [dispatch]),
  );

  useEffect(() => {
    if (apps.length > 0) {
      handleDeepLink();
      Linking.addEventListener('url', handleDeepLink);
      return () => {
        Linking.removeEventListener('url', handleDeepLink);
      };
    }
  }, [apps, handleDeepLink]);

  const handleDeepLink = useCallback(() => {
    const isValidContext = (context) => {
      return any(propEq('context', context))(apps);
    };

    if (route.params?.context) {
      const { context } = route.params;
      if (isValidContext(context)) {
        handleAppContext(route.params);
      } else {
        Alert.alert('Failed', `${context} is not a valid context!`);
      }
      // reset params
      navigation.setParams({
        baseUrl: '',
        context: '',
        contextId: '',
      });
    }
  }, [navigation, route.params, apps]);

  const AppStatus = () => {
    const pendingLink = find(propEq('state', 'pending'))(linkedContexts);
    let msg, waiting;
    if (pendingLink) {
      msg = `Linking your account in ${pendingLink.context}\n to your BrightID ...`;
      waiting = true;
    } else if (!isSponsored) {
      msg = "You're not sponsored.\nPlease find an app below to sponsor you.";
      waiting = false;
    } else {
      msg = '';
      waiting = false;
    }
    return msg ? (
      <View style={styles.statusContainer}>
        <Text style={styles.statusMessage}>{msg}</Text>
        <Spinner isVisible={waiting} size={48} type="Wave" color="#4a90e2" />
      </View>
    ) : (
      <View />
    );
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="appsScreen">
        <AppStatus />
        <FlatList
          data={apps}
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
          keyExtractor={({ name }, index) => name + index}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <AppCard {...item} />}
          ListEmptyComponent={<EmptyList title="No Apps" iconType="flask" />}
        />
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
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  centerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  statusMessage: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#4a90e2',
  },
  linkingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default AppsScreen;
