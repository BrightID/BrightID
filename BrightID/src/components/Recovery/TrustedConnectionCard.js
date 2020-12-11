// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { photoDirectory } from '@/utils/filesystem';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { addTrustedConnection, removeTrustedConnection } from '@/actions/index';
import store from '@/store';
import { DEVICE_TYPE } from '@/utils/deviceConstants';
import { DARK_GREY, GREEN, BLACK, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

class TrustedConnectionCard extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      imgErr: false,
    };
  }

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
    const { photo, name, connectionDate, style, t } = this.props;
    const imageSource =
      photo?.filename && !this.state.imgErr
        ? {
            uri: `file://${photoDirectory()}/${photo?.filename}`,
          }
        : require('@/static/default_profile.jpg');

    return (
      <View style={{ ...styles.container, ...style }}>
        <Image
          source={imageSource}
          style={styles.photo}
          onError={() => {
            console.log('settingImgErr');
            this.setState({ imgErr: true });
          }}
          accessibilityLabel="profile picture"
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.connectedText}>
            {t('common.tag.connectionDate', {
              date: moment(parseInt(connectionDate, 10)).fromNow(),
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.moreIcon}
          onPress={this.toggleConnectionSelect}
        >
          <AntDesign
            size={30.4}
            name={this.selected() ? 'checkcircle' : 'checkcircleo'}
            color={this.selected() ? GREEN : BLACK}
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
    backgroundColor: WHITE,
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
    fontSize: fontSize[20],
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[12],
    color: DARK_GREY,
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default connect()(withTranslation()(TrustedConnectionCard));
