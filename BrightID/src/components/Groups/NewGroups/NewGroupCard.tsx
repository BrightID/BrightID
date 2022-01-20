import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { photoDirectory } from '@/utils/filesystem';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { GREY, WHITE, GREEN, BLACK, LIGHT_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

type NewGroupCardProps = {
  id: string;
  photo: Photo;
  name: string;
  connectionDate: number;
  toggleInvitee: (string) => void;
  selected: boolean;
};

export const NewGroupCard = ({
  id,
  connectionDate,
  photo,
  name,
  selected,
  toggleInvitee,
}: NewGroupCardProps) => {
  const { t } = useTranslation();
  const [imgErr, setImgErr] = useState(false);

  const renderActionButton = () => {
    return (
      <TouchableOpacity
        testID="checkInviteeBtn"
        style={styles.moreIcon}
        onPress={handleGroupSelect}
      >
        <AntDesign
          size={30.4}
          name={selected ? 'checkcircle' : 'checkcircleo'}
          color={selected ? GREEN : BLACK}
        />
      </TouchableOpacity>
    );
  };

  const handleGroupSelect = () => {
    toggleInvitee(id);
  };

  const imageSource =
    photo?.filename && !imgErr
      ? {
          uri: `file://${photoDirectory()}/${photo?.filename}`,
        }
      : require('@/static/default_profile.jpg');

  return (
    <View style={styles.container}>
      <Image
        source={imageSource}
        style={styles.photo}
        onError={() => {
          console.log('settingImgErr');
          setImgErr(true);
        }}
        accessibilityLabel="profile picture"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.connectedText}>
          {t('common.tag.connectionDate', {
            date: moment(connectionDate).fromNow(),
          })}
        </Text>
      </View>
      {renderActionButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: WHITE,
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GREY,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
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
