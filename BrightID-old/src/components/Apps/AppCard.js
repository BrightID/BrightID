// @flow

import * as React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { deleteApp } from '../../actions/apps';

/**
 * App Card in the Apps Screen
 * each App should have:
 * @prop name
 * @prop logoFile
 * @prop verified
 * @prop url
 */

class AppCard extends React.PureComponent<Props> {
  handleDelete = () => {
    const { name, dispatch } = this.props;
    dispatch(deleteApp(name));
  };

  openApp = () => {
    const { url } = this.props;
    Linking.openURL(url);
  };

  render() {
    const { logoFile, name, verified, style } = this.props;

    return (
      <View style={{ ...styles.container, ...style }}>
        <TouchableOpacity style={styles.link} onPress={this.openApp}>
          <Image
            source={{
              uri: `file://${RNFS.DocumentDirectoryPath}/photos/${logoFile}`,
            }}
            style={styles.logo}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={this.openApp}>
          <Text style={styles.name}>{name}</Text>
        </TouchableOpacity>

        {verified && (
          <Ionicon
            size={24}
            name="ios-star"
            color="#de8"
            style={styles.verifiedIcon}
          />
        )}

        <TouchableOpacity style={styles.deleteIcon} onPress={this.handleDelete}>
          <Ionicon size={24} name="ios-trash" color="#cb9" />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 12,
    marginBottom: 12,
  },
  logo: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginLeft: 20,
  },
  name: {
    fontFamily: 'ApexNew-Book',
    color: 'black',
    fontSize: 24,
    marginLeft: 20,
  },
  verifiedIcon: {
    marginLeft: 10,
  },
  deleteIcon: {
    marginLeft: 'auto',
    marginRight: 20,
  },
  link: {},
});

export default connect()(AppCard);
