import React, { useState } from 'react';
import { Image, View, Text, Clipboard, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen, { verifiedSelector } from '@/components/HomeScreen';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { DEVICE_LARGE } from '@/utils/constants';
import { SvgXml } from 'react-native-svg';
import verificationSticker from '@/static/verification-sticker.svg';
import { retrieveImage } from '@/utils/filesystem';
import { getExplorerCode } from '@/utils/explorer';
import { navigate } from '@/NavigationService';
import editProfile from '@/static/edit_profile_inactive.svg';
import trustedConnections from '@/static/trusted_connections_sidebar_inactive.svg';
import contactUs from '@/static/contact_us.svg';

const iconMap = {
  editProfile,
  trustedConnections,
  contactUs,
};

const getIcon = (name) => {
  return ({ focused, color }) => {
    switch (name) {
      case 'certificate':
      case 'graphql': {
        return (
          <Material name={name} size={DEVICE_LARGE ? 28 : 23} color={color} />
        );
      }
      default: {
        return (
          <SvgXml
            xml={iconMap[name]}
            width={DEVICE_LARGE ? 28 : 24}
            height={DEVICE_LARGE ? 28 : 24}
          />
        );
      }
    }
  };
};

const CustomDrawerContent = (props) => {
  const hasPassword = useSelector(
    ({ user: { password } }) => password.length > 0,
  );
  const photoFilename = useSelector((state) => state.user.photo.filename);
  const name = useSelector((state) => state.user.name);
  const verified = useSelector(verifiedSelector);
  const [profilePhoto, setProfilePhoto] = useState('none');
  retrieveImage(photoFilename).then((profilePhoto) => {
    setProfilePhoto(profilePhoto);
  });

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
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        inactiveTintColor="#000"
        label="Achievements"
        icon={getIcon('certificate')}
        onPress={() => {
          navigate('Tasks');
          props.navigation.closeDrawer();
        }}
      />

      <DrawerItem
        inactiveTintColor={hasPassword ? '#000' : '#aaa'}
        label="Copy Explorer Code"
        style={styles.drawerItem}
        labelStyle={styles.labelStyle}
        onPress={() => {
          if (hasPassword) {
            const code = getExplorerCode();
            Clipboard.setString(code);
            props.navigation.closeDrawer();
          }
        }}
        icon={getIcon('graphql')}
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
  return (
    <Drawer.Navigator
      drawerStyle={styles.drawer}
      sceneContainerStyle={styles.sceneContainer}
      overlayColor="transparent"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        options={{
          drawerIcon: getIcon('home'),
        }}
        component={HomeScreen}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawer: {
    width: '85%',
    borderTopRightRadius: 40,
    shadowColor: 'rgba(196, 196, 196, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  sceneContainer: {
    backgroundColor: 'blue',
    opacity: 1,
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
