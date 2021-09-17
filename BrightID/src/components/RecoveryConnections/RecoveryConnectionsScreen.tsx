import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
// Redux
import { useSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import { recoveryConnectionsSelector } from '@/reducer/connectionsSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useHeaderHeight } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  DEVICE_LARGE,
  DEVICE_IOS,
  DEVICE_ANDROID,
} from '@/utils/deviceConstants';
import { ORANGE, BLACK, WHITE, BLUE, GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

// Import Components Local
import RecoveryConnectionCard from './RecoverConnectionsCard';

// Create Custom Local Componenets
const EmptyList = () => {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '10%',
      }}
    >
      <MaterialCommunityIcons
        size={DEVICE_LARGE ? 48 : 38}
        name="alert-outline"
        color={GREY}
      />
      <Text style={styles.emptyText}>
        {t('recoveryConnections.text.emptyList')}
      </Text>
    </View>
  );
};

export const RecoveryConnectionsScreen = (props) => {
  const { navigation } = props;
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
  const { t } = useTranslation();
  const recoveryConnections = useSelector(recoveryConnectionsSelector);

  const RecoveryConnectionList = useMemo(() => {
    return (
      <FlatList
        data={recoveryConnections}
        style={styles.recoveryConnectionContainer}
        contentContainerStyle={{
          paddingBottom: '35%',
          paddingTop: 20,
          flexGrow: 1,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <RecoveryConnectionCard {...item} index={index} isModify={true} />
        )}
        ListEmptyComponent={<EmptyList />}
      />
    );
  }, [recoveryConnections]);

  return (
    <View
      style={[styles.container, styles.shadow, { marginTop: headerHeight }]}
    >
      {recoveryConnections.length > 0 && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {t('recoveryConnections.text.currentRecoveryConnections')}
          </Text>
        </View>
      )}
      {RecoveryConnectionList}

      <View style={styles.buttonContainer}>
        {recoveryConnections.length === 0 ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('RecoveryConnectionsList')}
            style={styles.orangeButton}
          >
            <Text style={styles.orangeButtonLabel}>
              {t('recoveryConnections.text.addRecoveryConnections')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('RecoveryConnectionsList')}
            style={styles.transparentBtn}
          >
            <Text style={styles.transparentBtnText}>
              {t('recoveryConnections.text.addMoreRecovery')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    flex: 1,
    width: '100%',
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
  },
  shadow: {
    shadowColor: 'rgba(196, 196, 196, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // flex: 1,
    marginTop: '20%',
    marginBottom: '5%',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
  },
  recoveryConnectionContainer: {
    flex: 1,
    // flexGrow: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    zIndex: 10,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    paddingTop: '8%',
    paddingBottom: DEVICE_ANDROID ? '9%' : '11%',
    backgroundColor: WHITE,
  },
  transparentBtn: {
    backgroundColor: WHITE,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    paddingLeft: '10%',
  },
  transparentBtnText: {
    fontFamily: 'Poppins-Medium',
    color: BLUE,
    fontSize: fontSize[16],
  },
  orangeButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: ORANGE,
    width: '85%',
  },
  orangeButtonLabel: {
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    fontSize: fontSize[15],
  },
  hollowButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: GREY,
    backgroundColor: WHITE,
  },
  hollowButtonLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    color: GREY,
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: fontSize[18],
    color: GREY,
    marginVertical: 15,
  },
});

export default RecoveryConnectionsScreen;
