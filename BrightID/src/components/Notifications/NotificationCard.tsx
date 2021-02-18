import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { DARK_ORANGE, WHITE, LIGHT_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

/**
 * Notification Card in the Notifications Screen
 * each Notification should have:
 * @prop msg
 * @prop icon
 */
type NotificationCardProps = {
  title: string;
  msg: string;
  imageSource: any;
  navigationTarget: string;
  testID: string;
};

const NotificationCard = (props: NotificationCardProps) => {
  const { title, msg, imageSource, navigationTarget, testID } = props;
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.container}
      testID={testID}
      onPress={() => {
        navigation.navigate(navigationTarget);
      }}
    >
      <View style={styles.photoContainer}>
        <Image
          source={imageSource}
          style={styles.photo}
          resizeMode="cover"
          onError={(e) => {
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel={t('common.accessibilityLabel.userPhoto')}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{title}</Text>
        <Text style={styles.invitationMsg}>{msg}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: WHITE,
    borderBottomColor: LIGHT_GREY,
    borderBottomWidth: 1,
    paddingBottom: DEVICE_LARGE ? 10 : 8,
    paddingTop: DEVICE_LARGE ? 10 : 8,
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
  },
  photoContainer: {
    minWidth: DEVICE_LARGE ? 85 : 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    borderRadius: 100,
    width: DEVICE_LARGE ? 60 : 48,
    height: DEVICE_LARGE ? 60 : 48,
    backgroundColor: LIGHT_GREY,
  },
  info: {
    marginLeft: DEVICE_LARGE ? 10 : 7,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 71 : 65,
  },
  name: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[20],
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  invitationMsg: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: DARK_ORANGE,
  },
});

export default NotificationCard;
