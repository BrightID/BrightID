// @flow

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  FlatList,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import default_group from '@/static/default_group.svg';
import { SvgXml } from 'react-native-svg';
import { photoDirectory } from '../../utils/filesystem';

type props = {
  items: Array<connection> | Array<group>,
  header: string,
};

function MutualItems({ items, header }: props) {
  const [collapsed, setCollapsed] = useState(true);

  const toggleList = () => {
    setCollapsed(!collapsed);
  };

  const renderPhoto = (item) => {
    if (item?.photo?.filename) {
      return (
        <Image
          source={{ uri: `file://${photoDirectory()}/${item.photo.filename}` }}
          style={styles.photo}
          resizeMode="cover"
          onError={(e) => {
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel="photo"
        />
      );
    } else {
      return <SvgXml xml={default_group} width={40} height={40} />;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemPhoto}>{renderPhoto(item)}</View>
      <View style={styles.itemLabel}>
        <Text style={styles.itemLabelText}>{item.name}</Text>
      </View>
    </View>
  );

  let listContent;
  if (items.length > 0 && !collapsed) {
    listContent = (
      <FlatList
        ItemSeparatorComponent={itemSeparator}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerLabel}>
          <Text style={styles.headerLabelText}>{header}</Text>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.headerCount}>
            <Text style={styles.headerContentText}>{items.length}</Text>
          </View>
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={toggleList}
            disabled={items.length < 1}
          >
            <MaterialCommunityIcons
              style={styles.chevron}
              size={50}
              name={collapsed ? 'chevron-down' : 'chevron-up'}
              color={items.length ? '#0064AE' : '#C4C4C4'}
            />
          </TouchableOpacity>
        </View>
      </View>
      {listContent}
    </View>
  );
}

const itemSeparator = () => {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: ORANGE,
      }}
    />
  );
};

const ORANGE = '#ED7A5D';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    flex: 2,
  },
  headerLabelText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 17,
    color: '#000',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerCount: {},
  headerContentText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    color: ORANGE,
  },
  collapseButton: {
    paddingLeft: 5,
    paddingBottom: 5,
    paddingTop: 5,
  },
  chevron: {},
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPhoto: {
    margin: 10,
  },
  photo: {
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  itemLabel: {},
  itemLabelText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 15,
    color: '#000',
  },
});

export default MutualItems;
