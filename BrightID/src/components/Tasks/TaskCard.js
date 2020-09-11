// @flow

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React from 'react';
import { DEVICE_TYPE } from '@/utils/constants';
import { TaskState } from './TaskState';

type TaskCardProps = {
  id: string,
  title: string,
  description: string,
  fulfilled: boolean,
  url: ?string,
};

function TaskCard(props: TaskCardProps) {
  const { title, description, fulfilled, url } = props;

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
      <TaskState complete={fulfilled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    paddingRight: 0,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  taskInfo: {
    marginRight: 25,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
  },
  title: {
    fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
  },
  description: {
    fontSize: DEVICE_TYPE === 'large' ? 15 : 12,
  },
  linkifiedDescription: {
    fontSize: DEVICE_TYPE === 'large' ? 15 : 12,
    color: '#2185D0',
  },
});

export default TaskCard;
