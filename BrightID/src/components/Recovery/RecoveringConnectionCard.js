// @flow

import * as React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { photoDirectory } from '@/utils/filesystem';
import moment from 'moment';
import { withTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { GREY, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import backupApi from '@/api/backupService';
import { parseRecoveryQr } from './helpers';

class RecoveryConnectionCard extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      imgErr: false,
    };
  }

  handleConnectionSelect = async () => {
    const { t } = this.props;
    try {
      const { signingKey, timestamp } = parseRecoveryQr(
        this.props.recoveryRequestCode,
      );

      await backupApi.setSig({ id: this.props.id, timestamp, signingKey });

      Alert.alert(
        t('common.alert.info'),
        t('restore.alert.text.requestRecovering'),
        [
          {
            text: t('common.alert.ok'),
            onPress: () => this.props.navigation.navigate('Home'),
          },
        ],
      );
    } catch (err) {
      console.warn(err.message);
    }
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
      <TouchableOpacity onPress={this.handleConnectionSelect}>
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
            <View style={styles.scoreContainer} />
            <Text style={styles.connectedText}>
              {t('common.tag.connectionDate', {
                date: moment(parseInt(connectionDate, 10)).fromNow(),
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
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

export default connect()(withTranslation()(RecoveryConnectionCard));
