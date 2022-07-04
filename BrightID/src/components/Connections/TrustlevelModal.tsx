import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BlurView } from '@react-native-community/blur';
import { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from '@/store/hooks';
import {
  connection_levels,
  RECOVERY_COOLDOWN_EXEMPTION,
} from '@/utils/constants';
import { BLACK, WHITE, GREEN } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import {
  addOperation,
  firstRecoveryTimeSelector,
  setConnectionLevel,
  setFirstRecoveryTime,
} from '@/actions';
import { selectConnectionById } from '@/reducer/connectionsSlice';
import { NodeApiContext } from '@/components/NodeApiGate';

import TrustlevelSlider from './TrustlevelSlider';

type props = StackScreenProps<ModalStackParamList, 'SetTrustlevel'>;

const TrustlevelModal = ({ route }: props) => {
  const navigation = useNavigation();
  const { connectionId } = route.params;
  const { id: myId } = useSelector((state) => state.user);
  const firstRecoveryTime = useSelector(firstRecoveryTimeSelector);
  const connection: Connection = useSelector((state) =>
    selectConnectionById(state, connectionId),
  );
  const dispatch = useDispatch();
  const [level, setLevel] = useState(
    connection ? connection.level : connection_levels.JUST_MET,
  );
  const { t } = useTranslation();
  const api = useContext(NodeApiContext);

  const goBack = () => {
    navigation.goBack();
    // navigation.navigate('Connection', { connectionId });
  };

  const saveLevelHandler = async () => {
    if (connection.level !== level) {
      console.log(`Setting connection level '${level}' for ${connection.name}`);
      const op = await api.addConnection(
        myId,
        connection.id,
        level,
        Date.now(),
      );
      dispatch(addOperation(op));
      dispatch(setConnectionLevel({ id: connection.id, level }));

      if (__DEV__) {
        // if peer is a fake connection also submit opposite addConnection operation
        if (connection.secretKey) {
          const op = await api.addConnection(
            connection.id,
            myId,
            level,
            Date.now(),
            null,
            null,
            {
              id: connection.id,
              secretKey: connection.secretKey,
            },
          );
          dispatch(addOperation(op));
        }
      }

      if (!firstRecoveryTime && level === connection_levels.RECOVERY) {
        // First ever recovery connection. Set firstRecoveryTime accordingly.
        dispatch(setFirstRecoveryTime(Date.now()));
      }
    }
    // close modal
    goBack();
    if (
      (level === connection_levels.RECOVERY ||
        connection.level === connection_levels.RECOVERY) &&
      firstRecoveryTime &&
      Date.now() - firstRecoveryTime > RECOVERY_COOLDOWN_EXEMPTION
    ) {
      // show info about cooldown period
      navigation.navigate('RecoveryCooldownInfo');
    }
  };

  // go back silently if connection does not exist. Should never happen.
  if (!connection) {
    console.log(`ConnectionID ${connectionId} not found!`);
    goBack();
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
      <TouchableWithoutFeedback onPress={goBack}>
        <View style={styles.blurView} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {t('connectionDetails.text.level', { name: connection.name })}
          </Text>
        </View>
        <TrustlevelSlider
          incomingLevel={connection.incomingLevel}
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
