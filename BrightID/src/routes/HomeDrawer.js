import React, { useState } from 'react';
import {
  Alert,
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  setEditProfileMenuLayout,
  setEditProfileTextLayout,
} from '@/reducer/walkthroughSlice';
import HomeScreen, { verifiedSelector } from '@/components/HomeScreen';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useHeaderHeight } from '@react-navigation/stack';
import { BLACK, ORANGE, WHITE, GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { useTranslation } from 'react-i18next';
import codePush from 'react-native-code-push';
import { retrieveImage, photoDirectory } from '@/utils/filesystem';
import Home from '@/components/Icons/Home';
import Pencil from '@/components/Icons/Pencil';
import List from '@/components/Icons/List';
import GraphQl from '@/components/Icons/GraphQl';
import Faq from '@/components/Icons/Faq';
import Mail from '@/components/Icons/Mail';
import VerifiedBadge from '@/components/Icons/VerifiedBadge';
import TasksScreen from '@/components/Tasks/TasksScreen';
import GraphExplorerScreen from '@/components/SideMenu/GraphExplorerScreen';
import ContactUsScreen from '@/components/SideMenu/ContactUsScreen';
import EditProfileScreen from '@/components/EditProfile/EditProfileScreen';

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
  const dispatch = useDispatch();
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
  const verified = useSelector(verifiedSelector);
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
        {verified && (
          <VerifiedBadge
            style={styles.verificationSticker}
            width="16"
            height="16"
          />
        )}
      </View>
      <CustomItem
        inactiveTintColor={BLACK}
        label={t('drawer.label.home')}
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
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
        focused={state.routeNames[state.index] === 'Edit Profile'}
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.editProfile')}
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
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
        focused={state.routeNames[state.index] === 'Achievements'}
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.achievements')}
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
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
        focused={state.routeNames[state.index] === 'Copy Explorer Code'}
        inactiveTintColor={BLACK}
        inactiveBackgroundColor={WHITE}
        activeTintColor={WHITE}
        activeBackgroundColor={ORANGE}
        label={t('drawer.label.copyExplorerCode')}
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
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
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        inactiveTintColor={BLACK}
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
              updateDialog: true,
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
        focused={state.routeNames[state.index] === 'ContactUs'}
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
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
          focused={state.routeNames[state.index] === 'SampleIconPage'}
          style={styles.drawerItem}
          labelStyle={styles.labelStyle}
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
      drawerType="front"
      sceneContainerStyle={[styles.sceneContainer]}
      drawerStyle={[styles.drawer, { marginTop: headerHeight }]}
      drawerContentOptions={{
        activeTintColor: WHITE,
        inactiveTintColor: BLACK,
        activeBackgroundColor: ORANGE,
        inactiveBackgroundColor: WHITE,
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
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    marginLeft: 16,
  },
});
