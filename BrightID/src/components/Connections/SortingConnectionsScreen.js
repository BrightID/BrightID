// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import {
  sortByNameAscending,
  sortByNameDescending,
  sortByDateAddedAscending,
  sortByDateAddedDescending,
  types,
} from './models/sortingUtility';

class SortingConnectionsScreen extends React.Component<Props> {
  componentDidMount() {
    const { navigation, t } = this.props;
    navigation.setOptions({
      title: t('connectionsSearch.header.sorting'),
      headerBackTitleVisible: false,
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerSave}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Text style={styles.headerSaveText}>{t('connectionsSearch.button.save')}</Text>
        </TouchableOpacity>
      ),
    });
  }

  renderCaret = () => {
    const { connectionsSort } = this.props;
    switch (connectionsSort) {
      case types.byDateAddedAscending:
      case types.byNameAscending:
        return (
          <MaterialCommunityIcons size={26} name="chevron-up" color="#4990e2" />
        );
      case types.byDateAddedDescending:
      case types.byNameDescending:
        return (
          <MaterialCommunityIcons
            size={26}
            name="chevron-down"
            color="#4990e2"
          />
        );
      default:
        return (
          <MaterialCommunityIcons size={26} name="chevron-up" color="#4990e2" />
        );
    }
  };

  sortByName = () => {
    const { connectionsSort } = this.props;
    return (
      connectionsSort === types.byNameAscending ||
      connectionsSort === types.byNameDescending
    );
  };

  sortByDateAdded = () => {
    const { connectionsSort } = this.props;
    return (
      connectionsSort === types.byDateAddedAscending ||
      connectionsSort === types.byDateAddedDescending
    );
  };

  selectedStyle = () => ({
    ...styles.sortingOption,
    ...styles.selected,
  });

  render() {
    const { dispatch, connectionsSort, t } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.infoText}>{t('connectionsSearch.text.chooseSortMethod')}</Text>
        </View>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={
              this.sortByDateAdded()
                ? this.selectedStyle()
                : styles.sortingOption
            }
            onPress={() => {
              if (connectionsSort !== types.byDateAddedDescending) {
                dispatch(sortByDateAddedDescending());
              } else {
                dispatch(sortByDateAddedAscending());
              }
            }}
          >
            <Text style={styles.sortingText}>{t('connectionsSearch.button.sortByDate')}</Text>
            {this.sortByDateAdded() ? this.renderCaret() : <View />}
          </TouchableOpacity>
          <TouchableOpacity
            style={
              this.sortByName() ? this.selectedStyle() : styles.sortingOption
            }
            onPress={() => {
              if (connectionsSort !== types.byNameDescending) {
                dispatch(sortByNameDescending());
              } else {
                dispatch(sortByNameAscending());
              }
            }}
          >
            <Text style={styles.sortingText}>{t('connectionsSearch.button.sortByName')}</Text>
            {this.sortByName() ? this.renderCaret() : <View />}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  optionsContainer: {
    width: '96.7%',
  },
  sortingOption: {
    marginTop: 23,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 5,
  },
  sortingText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: '#4990e2',
  },
  titleContainer: {
    justifyContent: 'space-around',
    height: 58,
    paddingTop: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e1e1',
    width: '96.7%',
  },
  infoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
  },
  headerSave: {
    padding: 12,
  },
  headerSaveText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 18,
    color: '#fff',
    marginRight: 11,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.24)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  selected: {
    borderWidth: 1,
    borderColor: '#4990e2',
  },
});

export default connect(({ connections }) => ({ ...connections }))(
  withTranslation()(SortingConnectionsScreen),
);
