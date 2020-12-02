// @flow

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React from 'react';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { TaskState } from './TaskState';

type TaskCardProps = {
  id: string,
  title: string,
  description: string,
  fulfilled: boolean,
  url: ?string,
  onClick: ?() => any,
};

function TaskCard(props: TaskCardProps) {
  const { title, description, fulfilled, url, onClick } = props;

  const desc = url ? (
    <TouchableOpacity
      onPress={() => {
        Linking.openURL(url);
      }}
    >
      <Text style={styles.linkifiedDescription}>{description}</Text>
    </TouchableOpacity>
  ) : (
    <Text style={styles.description}>{description}</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.taskInfo}>
        <Text style={styles.title}>{title}</Text>
        {desc}
      </View>
      <TaskState complete={fulfilled} onClick={onClick} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: DEVICE_LARGE ? 15 : 12,
    paddingRight: 0,
    paddingBottom: DEVICE_LARGE ? 15 : 12,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  taskInfo: {
    marginRight: 25,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    fontFamily: 'Poppins-Medium',
    fontStyle: 'normal',
  },
  title: {
    fontSize: DEVICE_LARGE ? 20 : 17,
  },
  description: {
    fontSize: DEVICE_LARGE ? 15 : 12,
  },
  linkifiedDescription: {
    fontSize: DEVICE_LARGE ? 15 : 12,
    color: '#2185D0',
  },
});

export default TaskCard;
