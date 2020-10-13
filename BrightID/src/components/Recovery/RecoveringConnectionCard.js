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
import RNFS from 'react-native-fs';
import moment from 'moment';
import { withTranslation } from 'react-i18next';
import { DEVICE_TYPE } from '@/utils/constants';
import backupApi from '@/api/backupService';
import { parseRecoveryQr } from './helpers';

class RecoveryConnectionCard extends React.PureComponent<Props> {
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

  scoreColor = () => {
    const { score } = this.props;
    if (score >= 85) {
      return { color: '#139c60' };
    } else {
      return { color: '#e39f2f' };
    }
  };

  render() {
    const { photo, name, score, connectionDate, style, t } = this.props;
    const imageSource = photo?.filename
      ? {
          uri: `file://${RNFS.DocumentDirectoryPath}/photos/${photo?.filename}`,
        }
      : require('@/static/default_profile.jpg');

    return (
      <TouchableOpacity onPress={this.handleConnectionSelect}>
        <View style={{ ...styles.container, ...style }}>
          <Image source={imageSource} style={styles.photo} />
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLeft}>Score:</Text>
              <Text style={[styles.scoreRight, this.scoreColor()]}>
                {score}
              </Text>
            </View>
            <Text style={styles.connectedText}>
              {t('common.tag.connectionDate', {date: moment(parseInt(connectionDate, 10)).fromNow()})}
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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  scoreRight: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
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

export default connect()(withTranslation()(RecoveryConnectionCard));
