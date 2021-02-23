import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur';
import { connection_levels } from '@/utils/constants';
import { BLACK, WHITE, GREEN } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { useDispatch, useSelector } from '@/store';
import api from '@/api/brightId';
import { setConnectionLevel } from '@/actions/connections';
import TrustlevelSlider from './TrustlevelSlider';
import { connectionByIdSelector } from '../../utils/connectionsSelector';

type SetTrustlevelRoute = RouteProp<
  { SetTrustlevel: { connectionId: string } },
  'SetTrustlevel'
>;

const TrustlevelModal = () => {
  const navigation = useNavigation();
  const route = useRoute<SetTrustlevelRoute>();
  console.log('TrustLevelModalRoute', route);
  const { connectionId } = route.params;
  const myId = useSelector((state: State) => state.user.id);
  const connection: Connection = useSelector((state: State) =>
    connectionByIdSelector(state, connectionId),
  );
  const dispatch = useDispatch();
  const [level, setLevel] = useState(
    connection ? connection.level : connection_levels.JUST_MET,
  );
  const { t } = useTranslation();

  const saveLevelHandler = async () => {
    if (connection.level !== level) {
      console.log(`Setting connection level '${level}' for ${connection.name}`);
      await api.addConnection(myId, connection.id, level, Date.now());
      dispatch(setConnectionLevel(connection.id, level));
    }
    // close modal
    navigation.goBack();
  };

  // go back silently if connection does not exist. Should never happen.
  if (!connection) {
    console.log(`ConnectionID ${connectionId} not found!`);
    navigation.goBack();
    return null;
  }

  const changeLevelHandler = (newLevel: ConnectionLevel) => {
    setLevel(newLevel);
  };

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor={BLACK}
      />
      <TouchableWithoutFeedback onPress={navigation.goBack}>
        <View style={styles.blurView} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {t('connectionDetails.text.level', { name: connection.name })}
          </Text>
        </View>
        <TrustlevelSlider
          currentLevel={level}
          changeLevelHandler={changeLevelHandler}
          verbose={true}
        />
        <TouchableOpacity
          testID="SaveLevelBtn"
          style={styles.confirmButton}
          onPress={saveLevelHandler}
        >
          <Text style={styles.confirmButtonText}>
            {t('connectionDetails.button.levelSave')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    width: '90%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 30 : 25,
  },
  header: {
    marginTop: 5,
    marginBottom: DEVICE_LARGE ? 22 : 20,
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[19],
    textAlign: 'center',
  },
  confirmButton: {
    width: '90%',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  confirmButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[17],
  },
});

export default TrustlevelModal;
