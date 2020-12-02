// @flow

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
import { useDispatch, useSelector } from 'react-redux';
import { ORANGE, connection_levels } from '@/utils/constants';
import { types } from '@/utils/sorting';
import { setFilters, setConnectionsSort } from '@/actions';
import Chevron from '../Icons/Chevron';

type props = {
  route: any,
  navigation: any,
};

/** CONSTANTS */

const trustLevels = [
  connection_levels.SUSPICIOUS,
  connection_levels.JUST_MET,
  connection_levels.ALREADY_KNOWN,
  connection_levels.RECOVERY,
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

const SortConnectionsModal = ({ route, navigation }: props) => {
  const dispatch = useDispatch();

  const filters: string[] = useSelector((state) => state.connections.filters);
  const connectionsSort: string = useSelector(
    (state) => state.connections.connectionsSort,
  );

  const [newFilters, setNewFilters] = useState(filters || []);
  const [newConnectionsSort, setNewConnectionsSort] = useState(connectionsSort);

  const onSubmit = () => {
    dispatch(setFilters(newFilters));
    dispatch(setConnectionsSort(newConnectionsSort));
    navigation.goBack();
  };

  const renderFilterRadioBtn = (trustLevel: string) => {
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
        reducedTransparencyFallbackColor="black"
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
              // return first method, which is always descending, OR
              // return different method if sortType is already selected
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
              color={byName.includes(newConnectionsSort) ? ORANGE : 'black'}
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
              // width={16}
              // height={16}
              strokeWidth={byDate.includes(newConnectionsSort) ? 3 : 1.5}
              color={byDate.includes(newConnectionsSort) ? ORANGE : 'black'}
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
              color={byTrust.includes(newConnectionsSort) ? ORANGE : 'black'}
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
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 30 : 25,
  },
  header: {
    // marginTop: 5,
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 16 : 14,
    // textAlign: 'center',
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
    fontFamily: 'Poppins-Regular',
    fontSize: DEVICE_LARGE ? 14 : 12.5,
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
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#000',
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
    backgroundColor: '#5DEC9A',
    borderRadius: 50,
    borderColor: '#5DEC9A',
    borderWidth: 1,
  },
  submitButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#000',
  },
  submitButtonDisabledText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#707070',
  },
});

export default SortConnectionsModal;
