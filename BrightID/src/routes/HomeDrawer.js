import React, { useState } from 'react';
import { Image, View, Text, Clipboard, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '@/components/HomeScreen';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { DEVICE_LARGE } from '@/utils/constants';
import { SvgXml } from 'react-native-svg';
import verificationSticker from '@/static/verification-sticker.svg';
import { retrieveImage } from '@/utils/filesystem';
import { getExplorerCode } from '@/utils/explorer';
import { navigate } from '@/NavigationService';

const getIcon = (name) => {
  return ({ focused, color, size }) => (
    <Material name={name} size={DEVICE_LARGE ? 28 : 23} color={color} />
  );
};

const CustomDrawerContent = (props) => {
  const hasPassword = useSelector(
    ({ user: { password } }) => password.length > 0,
  );
  const photoFilename = useSelector((state) => state.user.photo.filename);
  const name = useSelector((state) => state.user.name);
  const verifications = useSelector((state) => state.user.verifications);
  const verified = verifications.includes('BrightID');
  const [profilePhoto, setProfilePhoto] = useState('none');
  retrieveImage(photoFilename).then((profilePhoto) => {
    setProfilePhoto(profilePhoto);
  });

  return (
    <DrawerContentScrollView labelStyle={{ fontSize: 30 }} {...props}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: profilePhoto,
          }}
          style={styles.drawerPhoto}
          accessibilityLabel="user photo"
        />
        <Text style={styles.drawerName}>{name}</Text>
        {verified && (
          <SvgXml
            style={styles.verificationSticker}
            width="16"
            height="16"
            xml={verificationSticker}
          />
        )}
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        inactiveTintColor="#000"
        label="Achievements"
        icon={getIcon('certificate')}
        onPress={() => {
          navigate('Tasks');
          props.navigation.closeDrawer();
        }}
      />
      <DrawerItem
        inactiveTintColor="#000"
        label="Connections"
        icon={getIcon('account')}
        onPress={() => {
          navigate('Connections');
          props.navigation.closeDrawer();
        }}
      />
      <DrawerItem
        inactiveTintColor="#000"
        label="Groups"
        icon={getIcon('account-group')}
        onPress={() => {
          navigate('Groups');
          props.navigation.closeDrawer();
        }}
      />
      <DrawerItem
        inactiveTintColor="#000"
        label="Apps"
        icon={getIcon('apps')}
        onPress={() => {
          navigate('Apps');
          props.navigation.closeDrawer();
        }}
      />
      {hasPassword && (
        <DrawerItem
          inactiveTintColor="#000"
          label="Copy Explorer Code"
          onPress={() => {
            const code = getExplorerCode();
            Clipboard.setString(code);
            props.navigation.closeDrawer();
          }}
          icon={getIcon('graphql')}
        />
      )}
    </DrawerContentScrollView>
  );
};

const Drawer = createDrawerNavigator();

export const HomeDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContentOptions={{
        activeTintColor: '#FFF',
        activeBackgroundColor: '#ED7A5D',
      }}
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
  drawerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 71,
  },
  profileContainer: {
    flexDirection: 'row',
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    padding: 10,
  },
  drawerName: {
    fontSize: 16,
    marginLeft: 10,
  },
  verificationSticker: {
    marginLeft: 5,
    marginTop: 1.5,
  },
});
