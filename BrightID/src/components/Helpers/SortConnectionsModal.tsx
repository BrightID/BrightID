import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { useDispatch, useSelector } from '@/store';
import { connection_levels } from '@/utils/constants';
import { ORANGE, BLACK, WHITE, GREEN, DARKER_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { types } from '@/utils/sorting';
import { setFilters, setConnectionsSort } from '@/actions';
import { StackScreenProps } from '@react-navigation/stack';
import Chevron from '../Icons/Chevron';

/** CONSTANTS */

const trustLevels = [
  connection_levels.SUSPICIOUS,
  connection_levels.JUST_MET,
  connection_levels.ALREADY_KNOWN,
  connection_levels.RECOVERY,
  connection_levels.REPORTED,
];

const ascending = [
  types.byNameAscending,
  types.byDateAddedAscending,
  types.byTrustLevelAscending,
];

const byName = [types.byNameDescending, types.byNameAscending];

const byDate = [types.byDateAddedDescending, types.byDateAddedAscending];

const byTrust = [types.byTrustLevelDescending, types.byTrustLevelAscending];

/** COMPONENT */

type props = StackScreenProps<ModalStackParamList, 'SortConnections'>;

const SortConnectionsModal = ({ navigation }: props) => {
  const dispatch = useDispatch();

  const filters = useSelector((state: State) => state.connections.filters);
  const connectionsSort =
    useSelector((state: State) => state.connections.connectionsSort) ||
    types.byDateAddedDescending;

  const [newFilters, setNewFilters] = useState<ConnectionLevel[]>(
    filters || [],
  );
  const [newConnectionsSort, setNewConnectionsSort] = useState(connectionsSort);

  const onSubmit = () => {
    dispatch(setFilters(newFilters));
    dispatch(setConnectionsSort(newConnectionsSort));
    navigation.goBack();
  };

  const renderFilterRadioBtn = (trustLevel: ConnectionLevel) => {
    // const active = btnReason === reason;
    const active = newFilters.includes(trustLevel);
    const updateFilters = () => {
      // start with a new filter array to prevent mutating state
      let updatedFilters = [];
      if (active) {
        // remove filter
        updatedFilters = newFilters.filter((filter) => filter !== trustLevel);
      } else {
        // add filter
        updatedFilters = newFilters.concat(trustLevel);
      }
      setNewFilters(updatedFilters);
    };
    return (
      <TouchableOpacity
        testID={`${trustLevel}-RadioBtn`}
        key={trustLevel}
        onPress={updateFilters}
        style={styles.radioButton}
      >
        <View style={styles.radioSquare}>
          {active && <View style={styles.radioInnerSquare} />}
        </View>
        <View style={styles.radioLabel}>
          <Text style={styles.radioLabelText}>{trustLevel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} testID="SortConnectionsModal">
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor={BLACK}
      />
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.goBack();
        }}
      >
        <View style={styles.blurView} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Sort By</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              // toggles sort method
              const sortMethod = byDate
                .filter((n) => n !== newConnectionsSort)
                .shift();
              setNewConnectionsSort(sortMethod);
            }}
          >
            <Text
              style={[
                styles.sortButtonText,
                byDate.includes(newConnectionsSort)
                  ? styles.activeButtonText
                  : {},
              ]}
            >
              Date
            </Text>
            <Chevron
              width={16}
              height={16}
              strokeWidth={byDate.includes(newConnectionsSort) ? 3 : 1.5}
              color={byDate.includes(newConnectionsSort) ? ORANGE : BLACK}
              direction={
                byDate.includes(newConnectionsSort) &&
                ascending.includes(newConnectionsSort)
                  ? 'up'
                  : 'down'
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const sortMethod = byName
                .filter((n) => n !== newConnectionsSort)
                .shift();
              setNewConnectionsSort(sortMethod);
            }}
          >
            <Text
              style={[
                styles.sortButtonText,
                byName.includes(newConnectionsSort)
                  ? styles.activeButtonText
                  : {},
              ]}
            >
              Name
            </Text>
            <Chevron
              width={16}
              height={16}
              strokeWidth={byName.includes(newConnectionsSort) ? 3 : 1.5}
              color={byName.includes(newConnectionsSort) ? ORANGE : BLACK}
              direction={
                byName.includes(newConnectionsSort) &&
                ascending.includes(newConnectionsSort)
                  ? 'up'
                  : 'down'
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const sortMethod = byTrust
                .filter((n) => n !== newConnectionsSort)
                .shift();
              setNewConnectionsSort(sortMethod);
            }}
          >
            <Text
              style={[
                styles.sortButtonText,
                byTrust.includes(newConnectionsSort)
                  ? styles.activeButtonText
                  : {},
              ]}
            >
              Trust Level
            </Text>
            <Chevron
              width={16}
              height={16}
              strokeWidth={byTrust.includes(newConnectionsSort) ? 3 : 1.5}
              color={byTrust.includes(newConnectionsSort) ? ORANGE : BLACK}
              direction={
                byTrust.includes(newConnectionsSort) &&
                ascending.includes(newConnectionsSort)
                  ? 'up'
                  : 'down'
              }
            />
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.headerText}>Filter By Trust Level</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.radioButtonsContainer}>
          {trustLevels.map(renderFilterRadioBtn)}
        </View>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            testID="SubmitReportBtn"
            style={[styles.modalButton, styles.submitButton]}
            onPress={onSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    // marginTop: 5,
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
  },

  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ORANGE,
    width: '105%',
    height: 1,
    marginTop: DEVICE_LARGE ? 10 : 8,
    marginBottom: DEVICE_LARGE ? 10 : 8,
  },

  sortContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    marginBottom: DEVICE_LARGE ? 25 : 12,
  },

  sortButton: {
    // borderWidth: 1,
    // borderLeftWidth: 1,
    minHeight: 36,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexGrow: 1,
  },

  sortButtonText: {
    color: BLACK,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    marginRight: DEVICE_LARGE ? 5 : 4,
  },
  activeButtonText: {
    color: ORANGE,
    fontFamily: 'Poppins-Bold',
  },
  radioButtonsContainer: {
    marginLeft: 10,
    marginBottom: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  radioButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  radioSquare: {
    height: 16,
    width: 16,
    borderRadius: 0.5,
    borderWidth: 3,
    borderColor: ORANGE,
    alignItems: 'center', // To center the checked circle…
    justifyContent: 'center',
  },
  radioInnerSquare: {
    height: 7.5,
    width: 7.5,
    // borderRadius: 10,
    backgroundColor: ORANGE,
  },
  radioLabel: {
    marginLeft: DEVICE_LARGE ? 12 : 10,
    marginRight: DEVICE_LARGE ? 12 : 10,
  },
  radioLabelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    color: BLACK,
    textTransform: 'capitalize',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButton: {
    backgroundColor: GREEN,
    borderRadius: 50,
    borderColor: GREEN,
    borderWidth: 1,
  },
  submitButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    color: BLACK,
  },
  submitButtonDisabledText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    color: DARKER_GREY,
  },
});

export default SortConnectionsModal;
