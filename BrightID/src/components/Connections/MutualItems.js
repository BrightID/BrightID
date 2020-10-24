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
  mutualItems: Array<connection> | Array<group>,
  header: string,
  singularItemName: string,
  pluralItemName: string,
};

function MutualItems({
  mutualItems,
  header,
  singularItemName,
  pluralItemName,
}: props) {
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

  let listContent, listFooter;
  if (mutualItems.length) {
    if (collapsed) {
      listContent = renderItem({ item: mutualItems[0] });
    } else {
      listContent = (
        <FlatList
          data={mutualItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      );
    }
  }

  if (mutualItems.length > 1) {
    const remainingItems = mutualItems.length - 1;
    if (collapsed) {
      listFooter = (
        <TouchableOpacity style={styles.moreItemsBtn} onPress={toggleList}>
          <MaterialCommunityIcons
            size={60}
            name="chevron-down"
            color="#c4c4c4"
          />
          <Text style={styles.moreItemsText}>
            {remainingItems} more{' '}
            {remainingItems > 1 ? pluralItemName : singularItemName}
          </Text>
        </TouchableOpacity>
      );
    } else {
      listFooter = (
        <TouchableOpacity style={styles.moreItemsBtn} onPress={toggleList}>
          <MaterialCommunityIcons
            style={styles.chevron}
            size={70}
            name="chevron-up"
            color="#c4c4c4"
          />
        </TouchableOpacity>
      );
    }
  }

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerLabel}>
          <Text style={styles.headerLabelText}>{header}</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerContentText}>{mutualItems.length}</Text>
        </View>
      </View>
      {listContent}
      {listFooter}
    </View>
  );
}

const ORANGE = '#ED7A5D';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
  },
  headerLabel: {
    width: '80%',
  },
  headerLabelText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 17,
    color: '#000',
  },
  headerContent: {},
  headerContentText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    color: ORANGE,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: ORANGE,
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
  moreItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
    marginRight: 0,
  },
  chevron: {
    width: 60,
  },
  moreItemsText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    color: '#C4C4C4',
  },
});

export default MutualItems;
