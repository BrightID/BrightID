import React, { useState } from 'react';
import {
  Alert,
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import HomeScreen, { verifiedSelector } from '@/components/HomeScreen';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useHeaderHeight } from '@react-navigation/stack';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { SvgXml } from 'react-native-svg';
import codePush from 'react-native-code-push';
import verificationSticker from '@/static/verification-sticker.svg';
import { retrieveImage, photoDirectory } from '@/utils/filesystem';
import editProfile from '@/static/edit_profile.svg';
import editProfileFocused from '@/static/edit_profile_focused.svg';
import trustedConnections from '@/static/trusted_connections_sidebar_inactive.svg';
import contactUs from '@/static/contact_us.svg';
import explorerCode from '@/static/explorer_code_icon.svg';
import explorerCodeFocused from '@/static/explorer_code_icon_focused.svg';
import homeIcon from '@/static/home_icon_side_menu.svg';
import taskList from '@/static/task_list_icon.svg';
import taskListFocused from '@/static/task_list_icon_focused.svg';
import faqIcon from '@/static/faq_icon.svg';
import TasksScreen from '@/components/Tasks/TasksScreen';
import GraphExplorerScreen from '@/components/SideMenu/GraphExplorerScreen';
import ContactUsScreen from '@/components/SideMenu/ContactUsScreen';
import EditProfileScreen from '@/components/EditProfile/EditProfileScreen';

const iconMap = {
  editProfile,
  editProfileFocused,
  contactUs,
  explorerCode,
  explorerCodeFocused,
  homeIcon,
  taskList,
  taskListFocused,
  faqIcon,
  trustedConnections,
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

const CustomItem = ({
  onPress,
  label,
  icon: Icon,
  focused,
  inactiveTintColor,
  activeTintColor,
  activeBackgroundColor,
  inactiveBackgroundColor,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.3}
      style={[
        styles.drawerItem,
        {
          backgroundColor: focused
            ? activeBackgroundColor
            : inactiveBackgroundColor,
        },
      ]}
      onPress={onPress}
    >
      <Icon focused={focused} />
      <Text
        style={[
          styles.labelStyle,
          {
            color: focused ? activeTintColor : inactiveTintColor,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const CustomDrawerContent = (props) => {
  const { state, navigation } = props;
  // selectors
  const photoFilename = useSelector((state) => state.user.photo.filename);
  const name = useSelector((state) => state.user.name);
  const verified = useSelector(verifiedSelector);
  // keep profile photo up to date
  const [profilePhoto, setProfilePhoto] = useState('');

  retrieveImage(photoFilename).then(setProfilePhoto);

  // prevent console error and blank photo
  const profileSource = profilePhoto
    ? {
        uri: profilePhoto,
      }
    : {
        uri: `file://${photoDirectory()}/${photoFilename}`,
      };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
        <Image
          source={profileSource}
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
      <CustomItem
        inactiveTintColor="#000"
        label="Home"
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        icon={getIcon('homeIcon')}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }}
      />
      <CustomItem
        focused={state.routeNames[state.index] === 'Edit Profile'}
        inactiveTintColor="#000"
        inactiveBackgroundColor="#fff"
        activeTintColor="#fff"
        activeBackgroundColor={ORANGE}
        label="Edit Profile"
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        icon={getIcon('editProfile')}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Edit Profile' }],
          });
        }}
      />
      <CustomItem
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
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Achievements' }],
          });
        }}
      />

      <CustomItem
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
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Copy Explorer Code' }],
          });
        }}
      />
      <CustomItem
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        inactiveTintColor="#000"
        label="Check for Updates"
        icon={getIcon('faqIcon')}
        onPress={() => {
          codePush.sync(
            {
              updateDialog: true,
              installMode: codePush.InstallMode.IMMEDIATE,
            },
            (status) => {
              if (status === codePush.SyncStatus.UP_TO_DATE) {
                Alert.alert('Check for Update', 'BrightID is up to date.');
              }
            },
          );
        }}
      />
      <CustomItem
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        inactiveTintColor="#000"
        label="Contact Us"
        icon={getIcon('contactUs')}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'ContactUs' }],
          });
        }}
      />
    </DrawerContentScrollView>
  );
};

const Drawer = createDrawerNavigator();

export const HomeDrawer = () => {
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }

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
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Achievements" component={TasksScreen} />
      <Drawer.Screen name="Edit Profile" component={EditProfileScreen} />
      <Drawer.Screen
        name="Copy Explorer Code"
        component={GraphExplorerScreen}
      />
      <Drawer.Screen name="ContactUs" component={ContactUsScreen} />
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
    paddingLeft: DEVICE_LARGE ? 43 : 34,
    paddingVertical: 10,
  },
  labelStyle: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    marginLeft: 16,
  },
});
