// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { photoDirectory } from '@/utils/filesystem';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { addTrustedConnection, removeTrustedConnection } from '@/actions/index';
import store from '@/store';
import { DEVICE_TYPE } from '@/utils/constants';

class TrustedConnectionCard extends React.PureComponent<Props> {
  toggleConnectionSelect = () => {
    const { id } = this.props;
    const {
      connections: { trustedConnections },
    } = store.getState();
    trustedConnections.includes(id)
      ? store.dispatch(removeTrustedConnection(id))
      : store.dispatch(addTrustedConnection(id));
  };

  selected = () => {
    const { id } = this.props;
    const {
      connections: { trustedConnections },
    } = store.getState();
    return trustedConnections.includes(id);
  };

  render() {
    const { photo, name, connectionDate, style } = this.props;
    const imageSource = photo?.filename
      ? {
          uri: `file://${photoDirectory()}/${photo?.filename}`,
        }
      : require('@/static/default_profile.jpg');

    return (
      <View style={{ ...styles.container, ...style }}>
        <Image source={imageSource} style={styles.photo} />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.connectedText}>
            Connected {moment(parseInt(connectionDate, 10)).fromNow()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.moreIcon}
          onPress={this.toggleConnectionSelect}
        >
          <AntDesign
            size={30.4}
            name={this.selected() ? 'checkcircle' : 'checkcircleo'}
            color={this.selected() ? '#28a84a' : '#000'}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    height: DEVICE_TYPE === 'large' ? 94 : 80,
    marginBottom: DEVICE_TYPE === 'large' ? 11.8 : 6,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  photo: {
    borderRadius: 30,
    width: 60,
    height: 60,
    marginLeft: 14,
  },
  info: {
    marginLeft: 25,
    flex: 1,
    height: DEVICE_TYPE === 'large' ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 12,
    color: '#aba9a9',
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default connect()(TrustedConnectionCard);
