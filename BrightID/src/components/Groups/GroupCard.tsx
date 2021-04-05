import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { DARK_ORANGE, WHITE, DARK_GREEN, BLUE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { getGroupName, ids2connections } from '@/utils/groups';
import GroupPhoto from './GroupPhoto';

/**
 * Group Card in the Groups Screen
 */
const GroupCard = (props) => {
  const { t } = useTranslation();
  const { group } = props;

  const SetStatus = () => {
    const concatenationString = t('common.language.and', 'and');
    if (group.isNew) {
      const notJoinedIds = group.founders?.filter(
        (founder) => !group.members?.includes(founder),
      );
      const notJoinedNames = ids2connections(notJoinedIds).map((o) => o.name);
      return (
        <Text style={styles.waitingMessage}>
          {t('groups.text.waitingForMembers', {
            // TODO: This concatenation assumes english grammar and will not work well in all languages
            list: notJoinedNames.join(` ${concatenationString} `),
          })}
        </Text>
      );
    } else {
      return (
        <Text style={styles.connectionTime}>
          {t('common.tag.joinedDate', {
            date: moment(parseInt(group.joined, 10)).fromNow(),
          })}
        </Text>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.photo}>
          <GroupPhoto group={group} />
        </View>
        <View style={styles.info}>
          {group.type === 'primary' ? (
            <Text style={styles.primary}>{t('groups.tag.primaryGroup')}</Text>
          ) : (
            <View />
          )}
          <Text testID="groupName" style={styles.name} numberOfLines={1}>
            {getGroupName(group)}
          </Text>
          <SetStatus />
        </View>
        {group.isNew ? null : (
          <View style={styles.memberCountContainer}>
            <Text style={styles.memberCountText}>
              {t('groups.text.members', {
                count: group.members?.length,
              })}
            </Text>
            <Text style={styles.memberCountText} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: DEVICE_LARGE ? 102 : 92,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    width: '100%',
  },
  card: {
    width: '92%',
    height: DEVICE_LARGE ? 76 : 71,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: WHITE,
    shadowColor: 'rgba(221, 179, 169, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    borderTopLeftRadius: DEVICE_LARGE ? 12 : 10,
    borderBottomLeftRadius: DEVICE_LARGE ? 12 : 10,
  },
  photo: {
    borderRadius: 55,
    minWidth: DEVICE_LARGE ? 80 : 64,
    minHeight: DEVICE_LARGE ? 80 : 64,
    marginLeft: DEVICE_LARGE ? 12 : 10,
    marginTop: -30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    marginLeft: DEVICE_LARGE ? 12 : 10,
    flex: 1,
    height: DEVICE_LARGE ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[18],
  },
  primary: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: DARK_GREEN,
  },
  waitingMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[12],
    color: DARK_ORANGE,
    maxWidth: '90%',
  },
  connectionTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[10],
    color: DARK_ORANGE,
  },
  memberCountContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: DEVICE_LARGE ? 14 : 12,
    marginLeft: DEVICE_LARGE ? 12 : 10,
  },
  memberCountText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[11],
    color: BLUE,
  },
});

export default GroupCard;
