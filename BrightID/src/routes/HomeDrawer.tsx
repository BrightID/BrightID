import React, { useState } from 'react';
import {
  Alert,
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTranslation } from 'react-i18next';
import codePush from 'react-native-code-push';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from '@/store/hooks';
import {
  setEditProfileMenuLayout,
  setEditProfileTextLayout,
} from '@/reducer/walkthroughSlice';
import HomeScreen from '@/components/HomeScreen';
import { BLACK, ORANGE, WHITE, GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { retrieveImage, photoDirectory } from '@/utils/filesystem';
import Home from '@/components/Icons/Home';
import Pencil from '@/components/Icons/Pencil';
import RecoveryAccount from '@/components/Icons/RecoveryAccount';
import List from '@/components/Icons/List';
import GraphQl from '@/components/Icons/GraphQl';
import Faq from '@/components/Icons/Faq';
import Mail from '@/components/Icons/Mail';
import FindFriendsScreen from '@/components/FindFriends/FindFriendsScreen';
import Devices from '@/components/Icons/Devices';
import TasksScreen from '@/components/Tasks/TasksScreen';
import BituVerificationScreen from '@/components/Tasks/BituVerificationScreen';
import GraphExplorerScreen from '@/components/SideMenu/GraphExplorerScreen';
import ContactUsScreen from '@/components/SideMenu/ContactUsScreen';
import EditProfileScreen from '@/components/EditProfile/EditProfileScreen';
import RecoveryConnectionsScreen from '@/components/RecoveryConnections/RecoveryConnectionsScreen';
import GroupsDrawerIcon from '@/static/groups_drawer.svg';
import FindFriendsIcon from '@/static/findfriends_drawer.svg';
import { SettingsScreen } from '@/components/SideMenu/SettingsScreen';
import AppSettings from '@/components/Icons/AppSettings';

const CustomItem = ({
  onPress,
  label,
  icon: Icon,
  focused,
  inactiveTintColor,
  activeTintColor,
  activeBackgroundColor,
  inactiveBackgroundColor,
  testId,
}) => {
  const dispatch = useDispatch();
  return (
    <TouchableOpacity
      testID={testId}
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
      onLayout={(e) => {
        if (label === 'Edit Profile') {
          //  X / Y / Height of the entire menu element for walkthough box
          dispatch(setEditProfileMenuLayout(e.nativeEvent?.layout));
        }
      }}
    >
      <Icon focused={focused} />
      <Text
        style={[
          styles.labelStyle,
          {
            color: focused ? activeTintColor : inactiveTintColor,
          },
        ]}
        onLayout={(e) => {
          if (label === 'Edit Profile') {
            // use text to determine proper width of walkthrough box
            dispatch(setEditProfileTextLayout(e.nativeEvent?.layout));
          }
        }}
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
  // keep profile photo up to date
  const [profilePhoto, setProfilePhoto] = useState('');
  const { t } = useTranslation();

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
      </View>
      <CustomItem
        testId="drawerHomeBtn"
        focused={false}
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.home')}
        icon={({ focused }) => (
          <Home
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
            color={focused ? GREY : BLACK}
            highlight={focused ? WHITE : ORANGE}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }}
      />
      <CustomItem
        testId="drawerEditProfileBtn"
        focused={state.routeNames[state.index] === 'Edit Profile'}
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.editProfile')}
        icon={({ focused }) => (
          <Pencil
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
            color={focused ? GREY : BLACK}
            highlight={focused ? WHITE : ORANGE}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Edit Profile' }],
          });
        }}
      />
      <CustomItem
        testId="drawerRecoveryConnectionsBtn"
        focused={state.routeNames[state.index] === 'Recovery Connections'}
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label="Recovery Connections"
        icon={({ focused }) => (
          <RecoveryAccount
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
            color={focused ? GREY : BLACK}
            highlight={focused ? WHITE : ORANGE}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Recovery Connections' }],
          });
        }}
      />
      <CustomItem
        testId="drawerAchievementsBtn"
        focused={state.routeNames[state.index] === 'Achievements'}
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.achievements')}
        icon={({ focused }) => (
          <List
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
            color={focused ? GREY : BLACK}
            highlight={focused ? WHITE : ORANGE}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Achievements' }],
          });
        }}
      />

      <CustomItem
        testId="drawerExplorerCodeBtn"
        focused={state.routeNames[state.index] === 'Copy Explorer Code'}
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.copyExplorerCode')}
        icon={({ focused }) => (
          <GraphQl
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
            color={focused ? GREY : BLACK}
            highlight={focused ? WHITE : ORANGE}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Copy Explorer Code' }],
          });
        }}
      />
      <CustomItem
        focused={false}
        testId="groupsBtn"
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.groups')}
        icon={() => (
          <SvgXml
            xml={GroupsDrawerIcon}
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Groups' }],
          });
        }}
      />
      <CustomItem
        focused={false}
        testId="findFriendsBtn"
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.findFriends')}
        icon={() => (
          <SvgXml
            xml={FindFriendsIcon}
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'FindFriendsScreen' }],
          });
        }}
      />

      <CustomItem
        focused={false}
        testId="devicesBtn"
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.devices')}
        icon={({ focused }) => (
          <Devices
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
            color={focused ? GREY : BLACK}
            highlight={focused ? WHITE : ORANGE}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Devices' },
              { name: 'Devices', params: { syncing: false, asScanner: false } },
            ],
          });
        }}
      />

      <CustomItem
        testId="drawerSettingsBtn"
        focused={state.routeNames[state.index] === 'Settings'}
        inactiveBackgroundColor={WHITE}
        inactiveTintColor={BLACK}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.settings', 'Settings')}
        icon={({ focused }) => (
          <AppSettings
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
            color={focused ? GREY : BLACK}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Settings' }],
          });
        }}
      />
      <CustomItem
        testId="drawerUpdateBtn"
        focused={false}
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.checkForUpdates')}
        icon={({ focused }) => (
          <Faq
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
            color={focused ? GREY : BLACK}
            highlight={focused ? WHITE : ORANGE}
          />
        )}
        onPress={() => {
          codePush.sync(
            {
              updateDialog: {},
              installMode: codePush.InstallMode.IMMEDIATE,
            },
            (status) => {
              if (status === codePush.SyncStatus.UP_TO_DATE) {
                Alert.alert(
                  t('drawer.alert.title.upToDate'),
                  t('drawer.alert.text.upToDate'),
                );
              }
            },
          );
        }}
      />
      <CustomItem
        testId="drawerContactUsBtn"
        focused={state.routeNames[state.index] === 'ContactUs'}
        inactiveBackgroundColor={WHITE}
        inactiveTintColor={BLACK}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.contactUs')}
        icon={({ focused }) => (
          <Mail
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
            color={focused ? GREY : BLACK}
            highlight={focused ? WHITE : ORANGE}
          />
        )}
        onPress={() => {
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'ContactUs' }],
          });
        }}
      />
      {__DEV__ && (
        <CustomItem
          testId="drawerIconsBtn"
          focused={state.routeNames[state.index] === 'SampleIconPage'}
          // style={styles.drawerItem}
          // labelStyle={styles.labelStyle}
          inactiveBackgroundColor={WHITE}
          inactiveTintColor={BLACK}
          activeTintColor={WHITE}
          activeBackgroundColor={ORANGE}
          label="Sample Icon Page"
          icon={({ focused }) => (
            <List
              width={DEVICE_LARGE ? 28 : 24}
              height={DEVICE_LARGE ? 28 : 24}
              color={focused ? GREY : BLACK}
              highlight={focused ? WHITE : ORANGE}
            />
          )}
          onPress={() => {
            navigation.reset({
              index: 1,
              routes: [{ name: 'Home' }, { name: 'SampleIconPage' }],
            });
          }}
        />
      )}
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
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        sceneContainerStyle: [styles.sceneContainer],
        drawerStyle: [styles.drawer, { marginTop: headerHeight }],
        drawerActiveTintColor: WHITE,
        drawerInactiveTintColor: BLACK,
        drawerActiveBackgroundColor: ORANGE,
        drawerInactiveBackgroundColor: WHITE,
        drawerItemStyle: styles.drawerItem,
        drawerLabelStyle: styles.labelStyle,
        overlayColor: 'transparent',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Achievements" component={TasksScreen} />
      <Drawer.Screen name="FindFriendsScreen" component={FindFriendsScreen} />
      <Drawer.Screen
        name="BituVerification"
        component={BituVerificationScreen}
      />
      <Drawer.Screen name="Edit Profile" component={EditProfileScreen} />
      <Drawer.Screen
        name="Recovery Connections"
        component={RecoveryConnectionsScreen}
      />
      <Drawer.Screen
        name="Copy Explorer Code"
        component={GraphExplorerScreen}
      />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="ContactUs" component={ContactUsScreen} />
      {__DEV__ && (
        <Drawer.Screen
          name="SampleIconPage"
          component={require('@/components/Icons/SamplePage').default}
        />
      )}
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  sceneContainer: {
    backgroundColor: WHITE,
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
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    marginLeft: DEVICE_LARGE ? 20 : 18,
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
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    marginLeft: 16,
  },
});
