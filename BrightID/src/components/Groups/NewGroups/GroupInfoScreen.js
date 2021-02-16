import * as React from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { chooseImage } from '@/utils/images';
import {
  ORANGE,
  GREY,
  WHITE,
  DARKER_GREY,
  DARK_GREY,
  BLACK,
  BLUE,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_TYPE, DEVICE_OS, DEVICE_LARGE } from '@/utils/deviceConstants';

const Container = DEVICE_OS === 'ios' ? KeyboardAvoidingView : View;

export class GroupInfoScreen extends React.Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    name: '',
    finalBase64: { uri: '' },
    isPrimary: false,
  };

  getPhotoFromLibrary = async () => {
    try {
      const { mime, data } = await chooseImage();
      const finalBase64 = {
        uri: `data:${mime};base64,${data}`,
      };
      this.setState({
        finalBase64,
      });
    } catch (err) {
      console.log(err);
    }
  };

  hasPrimaryGroup = () => {
    const { groups } = this.props;
    return groups.some((group) => group.type === 'primary');
  };

  validateInputs = async () => {
    const { finalBase64, name, isPrimary } = this.state;
    const { navigation, t } = this.props;
    if (name.length < 2) {
      return Alert.alert(
        t('createGroup.alert.title.formIncomplete'),
        name.length === 0
          ? t('createGroup.alert.text.nameMissing')
          : t('createGroup.alert.text.nameTooShort'),
      );
    }
    navigation.navigate('NewGroup', {
      photo: finalBase64?.uri,
      name,
      isPrimary,
    });
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const { name, finalBase64, isPrimary } = this.state;
    const { t } = this.props;

    return (
      <>
        <View style={styles.orangeTop} />
        <Container
          testID="groupInfoScreen"
          style={styles.container}
          behavior="padding"
        >
          <View style={styles.groupNameContainer}>
            <View style={styles.addPhotoContainer}>
              {finalBase64.uri ? (
                <TouchableOpacity
                  testID="editGroupPhoto"
                  onPress={this.getPhotoFromLibrary}
                  accessible={true}
                  accessibilityLabel={t('common.accessibilityLabel.editPhoto')}
                >
                  <Image style={styles.photo} source={finalBase64} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  testID="editGroupPhoto"
                  onPress={this.getPhotoFromLibrary}
                  style={styles.addPhoto}
                  accessible={true}
                  accessibilityLabel={t('common.accessibilityLabel.addPhoto')}
                >
                  <SimpleLineIcons size={26} name="camera" color={DARK_GREY} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.textInputContainer}>
              <TextInput
                testID="editGroupName"
                onChangeText={(name) => this.setState({ name })}
                value={name}
                placeholder={t('createGroup.placeholder.groupName')}
                placeholderTextColor={GREY}
                style={styles.textInput}
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
                underlineColorAndroid="transparent"
              />
            </View>
          </View>
          {/*
            Disabled creation of primary groups for now (https://github.com/BrightID/BrightID/issues/474)
            !this.hasPrimaryGroup() && (
           <View testID="primaryGroupView" style={styles.toggleContainer}>
             <Text style={styles.primaryGroupText}>
               A primary group represents the closest personal contacts (e.g.
               immediate family members) for a particular person. Each person
               can have only one primary group.
             </Text>
              <ToggleSwitch
               testID="primaryGroupToggle"
               isOn={isPrimary}
               onColor="#428BE5"
               offColor="#979797"
               label="Primary Group"
               labelStyle={styles.primaryToggleLable}
               size="large"
               onToggle={(isPrimary) => this.setState({ isPrimary })}
             />
           </View>
           )
           */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              testID="nextBtn"
              style={styles.nextButton}
              onPress={this.validateInputs}
            >
              <Text style={styles.buttonInnerText}>
                {t('createGroup.button.next')}
              </Text>
            </TouchableOpacity>
          </View>
        </Container>
      </>
    );
  }
}

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  groupNameContainer: {
    flexDirection: 'row',
    marginTop: 22,
  },
  addPhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  textInputContainer: {
    marginTop: 28,
    minWidth: 200,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: DEVICE_TYPE === 'large' ? 35 : 28,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  addPhoto: {
    borderWidth: 1,
    borderColor: DARK_GREY,
    height: 72,
    width: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  hidden: {
    display: 'none',
  },
  addPhotoText: {
    fontFamily: 'ApexNew-Book',
    color: DARK_GREY,
    marginBottom: 8,
    marginTop: 8,
    fontSize: fontSize[12],
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  textInput: {
    fontFamily: 'ApexNew-Light',
    fontSize: fontSize[20],
    fontWeight: '300',
    fontStyle: 'normal',
    color: BLACK,
    letterSpacing: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GREY,
    width: '100%',
    height: 45,
  },
  buttonInfoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[16],
    width: 300,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: BLUE,
    width: DEVICE_TYPE === 'large' ? 285 : 260,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: DEVICE_TYPE === 'large' ? 14 : 10,
    paddingBottom: DEVICE_TYPE === 'large' ? 13 : 9,
    marginTop: 22,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: WHITE,
    fontWeight: '600',
    fontSize: fontSize[18],
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  primaryToggleLable: {
    color: DARKER_GREY,
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[18],
    width: 200,
  },
  toggleContainer: {
    marginTop: 30,
    width: 300,
  },
  primaryGroupText: {
    paddingTop: 30,
    paddingBottom: 30,
    width: 300,
    textAlign: 'justify',
  },
});

export default connect(({ groups }) => ({ ...groups }))(
  withTranslation()(GroupInfoScreen),
);
