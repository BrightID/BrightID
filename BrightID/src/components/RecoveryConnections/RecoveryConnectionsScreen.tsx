import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
// Redux
import { useSelector } from '@/store';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import { selectOperationsTotal } from '@/reducer/operationsSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useHeaderHeight } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  DEVICE_LARGE,
  DEVICE_IOS,
  DEVICE_ANDROID,
} from '@/utils/deviceConstants';
import { NodeApiContext } from '@/components/NodeApiGate';
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
  const me = useSelector((state: State) => state.user);
  const [loading, setLoading] = useState(true);
  const [recoveryConnections, setRecoveryConnections] = useState<Array<Connection>>(
    [],
  );
  const [connectionProfile, setConnectionProfile] = useState<
    ProfileInfo | undefined
  >(undefined);
  const myConnections = useSelector(selectAllConnections);
  const opTotal = useSelector(selectOperationsTotal);
  const api = useContext(NodeApiContext);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        if (opTotal > 0) {
          console.log('waiting for pending operations to apply');
          return;
        }
        console.log(`fetching own recovery connections`);
        const profile: ProfileInfo = await api.getProfile(me.id);
        setConnectionProfile(profile);
        const recoveryConnections = profile.recoveryConnections.map(rc => {
          const conn = myConnections.find(c => rc.id === c.id);
          return conn || { id: rc.id };
        });
        setRecoveryConnections(recoveryConnections);
        setLoading(false);
      };
      fetchData();
    }, [api, myConnections, opTotal]),
  );

  const getActiveTime = (item) => {
    if (!connectionProfile) {
      return {};
    }
    const rc = connectionProfile.recoveryConnections.find(rc => rc.id === item.id);
    return { activeBefore: rc.activeBefore, activeAfter: rc.activeAfter };
  };

  const Loading = () => (
    <View style={styles.loadingContainer}>
      <Spinner
        size={DEVICE_LARGE ? 48 : 42}
        type="Wave"
        color={BLUE}
      />
    </View>
  );

  const RecoveryConnectionList = () => (
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
          <RecoveryConnectionCard {...item} {...getActiveTime(item)} index={index} isModify={true} />
        )}
        ListEmptyComponent={<EmptyList />}
      />
    );


  return (
    <View
      style={[styles.container, styles.shadow, { marginTop: headerHeight }]}
      testID="RecoveryConnectionsScreen"
    >
      {recoveryConnections.length > 0 && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {t('recoveryConnections.text.currentRecoveryConnections')}
          </Text>
        </View>
      )}
      {loading ? <Loading /> : <RecoveryConnectionList />}

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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
});

export default RecoveryConnectionsScreen;
