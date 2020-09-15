import React, { useState } from 'react';
import { Image, View, Text, Clipboard, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import HomeScreen, { verifiedSelector } from '@/components/HomeScreen';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { DEVICE_LARGE, ORANGE } from '@/utils/constants';
import { SvgXml } from 'react-native-svg';
import verificationSticker from '@/static/verification-sticker.svg';
import { retrieveImage } from '@/utils/filesystem';
import { navigate } from '@/NavigationService';
import editProfile from '@/static/edit_profile_inactive.svg';
import trustedConnections from '@/static/trusted_connections_sidebar_inactive.svg';
import contactUs from '@/static/contact_us.svg';
import explorerCode from '@/static/explorer_code_icon.svg';
import explorerCodeFocused from '@/static/explorer_code_icon_focused.svg';
import homeIcon from '@/static/home_icon_side_menu.svg';
import taskList from '@/static/task_list_icon.svg';
import taskListFocused from '@/static/task_list_icon_focused.svg';

import TasksScreen from '@/components/SideMenu/Tasks/TasksScreen';
import GraphExplorerScreen from '@/components/SideMenu/GraphExplorerScreen';
import { useHeaderHeight } from '@react-navigation/stack';

const iconMap = {
  editProfile,
  trustedConnections,
  contactUs,
  explorerCode,
  homeIcon,
  taskList,
  explorerCodeFocused,
  taskListFocused,
};

const getIcon = (name) => {
  return ({ focused, color }) => {
    let icon = `${name}${focused ? 'Focused' : ''}`;
    return (
      <SvgXml
        xml={iconMap[icon]}
        width={DEVICE_LARGE ? 28 : 24}
        height={DEVICE_LARGE ? 28 : 24}
      />
    );
  };
};

const CustomDrawerContent = (props) => {
  const photoFilename = useSelector((state) => state.user.photo.filename);
  const name = useSelector((state) => state.user.name);
  const verified = useSelector(verifiedSelector);
  const [profilePhoto, setProfilePhoto] = useState('none');
  retrieveImage(photoFilename).then((profilePhoto) => {
    setProfilePhoto(profilePhoto);
  });

  const { state, navigation } = props;

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: profilePhoto,
          }}
          style={styles.drawerPhoto}
          accessibilityLabel="user photo"
        />
        <Text style={styles.userName}>{name}</Text>
        {verified && (
          <SvgXml
            style={styles.verificationSticker}
            width="16"
            height="16"
            xml={verificationSticker}
          />
        )}
      </View>
      <DrawerItem
        inactiveTintColor="#000"
        label="Home"
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        icon={getIcon('homeIcon')}
        onPress={() => {
          props.navigation.navigate('Home');
        }}
      />
      <DrawerItem
        focused={state.routeNames[state.index] === 'Achievements'}
        inactiveTintColor="#000"
        inactiveBackgroundColor="#fff"
        activeTintColor="#fff"
        activeBackgroundColor={ORANGE}
        label="Achievements"
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        icon={getIcon('taskList')}
        onPress={() => {
          navigation.navigate('Achievements');
        }}
      />
      <DrawerItem
        focused={state.routeNames[state.index] === 'Copy Explorer Code'}
        inactiveTintColor="#000"
        inactiveBackgroundColor="#fff"
        activeTintColor="#fff"
        activeBackgroundColor={ORANGE}
        label="Copy Explorer Code"
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        icon={getIcon('explorerCode')}
        onPress={() => {
          navigation.navigate('Copy Explorer Code');
        }}
      />
      <DrawerItem
        inactiveTintColor="#aaa"
        label="Edit Profile"
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        icon={getIcon('editProfile')}
      />
      <DrawerItem
        inactiveTintColor="#aaa"
        label="Trusted Connections"
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        icon={getIcon('trustedConnections')}
      />
      <DrawerItem
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        inactiveTintColor="#000"
        label="Contact Us"
        icon={getIcon('contactUs')}
        onPress={() => {
          navigate('Tasks');
          props.navigation.closeDrawer();
        }}
      />
    </DrawerContentScrollView>
  );
};

const Drawer = createDrawerNavigator();

export const HomeDrawer = () => {
  const headerHeight = useHeaderHeight();

  return (
    <Drawer.Navigator
      drawerType="front"
      sceneContainerStyle={[styles.sceneContainer]}
      drawerStyle={[styles.drawer, { marginTop: headerHeight }]}
      drawerContentOptions={{
        activeTintColor: '#FFF',
        inactiveTintColor: '#000',
        activeBackgroundColor: ORANGE,
        inactiveBackgroundColor: '#fff',
        itemStyle: styles.drawerItem,
        labelStyle: styles.labelStyle,
      }}
      overlayColor="transparent"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        options={{
          drawerIcon: getIcon('homeIcon'),
          inactiveTintColor: '#000',
        }}
        component={HomeScreen}
      />
      <Drawer.Screen
        name="Achievements"
        options={{
          drawerIcon: getIcon('taskList'),
        }}
        component={TasksScreen}
      />
      <Drawer.Screen
        name="Copy Explorer Code"
        options={{
          drawerIcon: getIcon('explorerCode'),
        }}
        component={GraphExplorerScreen}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  sceneContainer: {
    backgroundColor: '#fff',
  },
  drawer: {
    width: '85%',
    borderTopRightRadius: 40,
    shadowColor: 'rgba(196, 196, 196, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  drawerPhoto: {
    width: DEVICE_LARGE ? 48 : 42,
    height: DEVICE_LARGE ? 48 : 42,
    borderRadius: 71,
  },
  profileContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingLeft: DEVICE_LARGE ? 45 : 35,
    paddingTop: DEVICE_LARGE ? 20 : 18,
    paddingBottom: DEVICE_LARGE ? 30 : 25,
  },
  userName: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    marginLeft: DEVICE_LARGE ? 20 : 18,
  },
  verificationSticker: {
    marginLeft: 5,
    marginTop: 1.5,
  },
  drawerItem: {
    paddingLeft: DEVICE_LARGE ? 35 : 25,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  labelStyle: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    marginLeft: -15,
  },
});
