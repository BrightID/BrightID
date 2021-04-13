import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { photoDirectory } from '@/utils/filesystem';
import moment from 'moment';
import Ionicon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { withTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { GREY, WHITE, GREEN, BLACK } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { toggleNewGroupCoFounder } from './actions';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop connectionTime
 * @prop photo
 */
class NewGroupCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imgErr: false,
    };
  }

  handleGroupSelect = () => {
    console.log('pressed');
    let { toggleCoFounder, id } = this.props;
    toggleCoFounder(id);
  };

  renderActionButton = () => {
    const { groups, selected } = this.props;
    if (groups) {
      return (
        <TouchableOpacity
          testID="checkCoFounderBtn"
          style={styles.moreIcon}
          onPress={this.handleGroupSelect}
        >
          <AntDesign
            size={30.4}
            name={selected ? 'checkcircle' : 'checkcircleo'}
            color={selected ? GREEN : BLACK}
          />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.moreIcon}
        onPress={this.handleUserOptions}
      >
        <Ionicon size={48} name="ios-more" color={GREY} />
      </TouchableOpacity>
    );
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
        {this.renderActionButton()}
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
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
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
    height: DEVICE_LARGE ? 71 : 65,
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
    color: GREY,
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default connect(null, (dispatch) => ({
  toggleCoFounder: (id) => dispatch(toggleNewGroupCoFounder(id)),
}))(withTranslation()(NewGroupCard));
