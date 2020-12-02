// @flow

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  FlatList,
  Text,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import EmptyList from '@/components/Helpers/EmptyList';
import Spinner from 'react-native-spinkit';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
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
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const refreshApps = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchApps())
      .then(() => {
        setRefreshing(false);
      })
      .catch((err) => {
        console.log(err.message);
        setRefreshing(false);
      });
  }, [dispatch]);

  useFocusEffect(refreshApps);

  useEffect(() => {
    if (apps.length > 0 && route.params?.context) {
      handleDeepLink();
    }
  }, [apps, handleDeepLink, route.params]);

  const handleDeepLink = useCallback(() => {
    const context = route.params?.context;
    const isValidContext = any(propEq('context', context))(apps);
    if (isValidContext) {
      handleAppContext(route.params);
    } else {
      Alert.alert(
        t('apps.alert.title.invalidContext'), 
        t('apps.alert.text.invalidContext', {context: `${context}`})
      )
    }
    // reset params
    navigation.setParams({
      baseUrl: '',
      context: '',
      contextId: '',
    });
  }, [navigation, route.params, apps]);

  const AppStatus = () => {
    const pendingLink = find(propEq('state', 'pending'))(linkedContexts);
    let msg, waiting;
    if (pendingLink) {
      msg = t('apps.text.pendingLink', {context: `${pendingLink.context}`});
      waiting = true;
    } else if (!isSponsored) {
      msg = t('apps.text.notSponsored');
      waiting = false;
    } else {
      msg = '';
      waiting = false;
    }
    return msg ? (
      <View style={styles.statusContainer}>
        <Text style={styles.statusMessage}>{msg}</Text>
        <Spinner
          isVisible={waiting}
          size={DEVICE_LARGE ? 48 : 42}
          type="Wave"
          color="#4a90e2"
        />
      </View>
    ) : (
      <View style={{ height: DEVICE_LARGE ? 12 : 10 }} />
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
          testID="appsList"
          data={apps}
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
          keyExtractor={({ name }, index) => name + index}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <AppCard {...item} />}
          ListEmptyComponent={<EmptyList title={t('apps.text.noApps')} iconType="flask" />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshApps} />
          }
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
    fontFamily: 'Poppins-Medium',
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
