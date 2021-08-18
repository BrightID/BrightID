import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DEVICE_LARGE, DEVICE_IOS, WIDTH } from '@/utils/deviceConstants';
import { ORANGE, BLACK, WHITE, GREEN, DARKER_GREY, GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

// Import Components Local
import RecoveryConnectionCard from './RecoverConnectionsCard';

// Redux
import { useSelector } from '@/store';
import { recoveryConnectionsSelector } from '@/reducer/connectionsSlice';

// Create Custom Local Componenets
const EmptyList = () => {
  return (
    <View
      style={{
        flex: 1,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: '10%',
      }}
    >
      <Text style={{ fontFamily: 'Poppins-Medium', marginBottom: '5%' }}>
        You have not setup your Recovery Connection.
      </Text>
      <Text style={{ fontFamily: 'Poppins-Medium' }}>
        Please select your Recovery Connection to enable social recovery of your
        BrightID
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
  const recoveryConnections = useSelector(recoveryConnectionsSelector);

  const [isModifyOn, setModifyStatus] = useState<Boolean>(false);

  const RecoveryConnectionList = useMemo(() => {
    return (
      <FlatList
        data={recoveryConnections}
        style={styles.recoveryConnectionContainer}
        contentContainerStyle={{
          paddingBottom: 70,
          paddingTop: 20,
          flexGrow: 1,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <RecoveryConnectionCard
            {...item}
            index={index}
            isModify={isModifyOn}
          />
        )}
        ListEmptyComponent={<EmptyList />}
      />
    );
  }, [isModifyOn, recoveryConnections]);

  useFocusEffect(
    useCallback(() => {
      setModifyStatus(false);
    }, []),
  );

  return (
    <View
      style={[styles.container, styles.shadow, { marginTop: headerHeight }]}
    >
      {RecoveryConnectionList}

      <View style={styles.buttonContainer}>
        {recoveryConnections.length === 0 ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('RecoveryConnectionsList')}
            style={styles.orangeButton}
          >
            <Text style={styles.orangeButtonLabel}>
              Add Recovery Connections
            </Text>
          </TouchableOpacity>
        ) : !isModifyOn ? (
          <TouchableOpacity
            onPress={() => setModifyStatus(true)}
            style={styles.orangeButton}
          >
            <Text style={styles.orangeButtonLabel}>
              Modify Recovery Connection
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => navigation.navigate('RecoveryConnectionsList')}
              style={styles.orangeButton}
            >
              <Text style={styles.orangeButtonLabel}>Add</Text>
            </TouchableOpacity>
            <View style={{ width: 5 }} />
            <TouchableOpacity
              style={styles.hollowButton}
              onPress={() => setModifyStatus(false)}
            >
              <Text style={styles.hollowButtonLabel}>Cancel</Text>
            </TouchableOpacity>
          </>
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
  recoveryConnectionContainer: {
    flex: 1,
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
    paddingHorizontal: '5%',
    marginTop: '5%',
    paddingTop: '5%',
    paddingBottom: '10%',
    backgroundColor: WHITE,
  },
  orangeButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: ORANGE,
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
  },
  hollowButtonLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    color: GREY,
  },
});

export default RecoveryConnectionsScreen;
