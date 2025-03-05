/*
 react-native-vision-camera mock

 Required on Android to prevent the camera permission popup from appearing.

 Inspired by https://stackoverflow.com/questions/58716420/mocking-rncamera-with-detox-does-not-work-non-mock-impl-is-called
 */

import React from 'react';
import { base64 } from './RNCamera-base64';

console.log('[DETOX] Using mocked react-native-vision-camera');

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class VisionCamera extends React.PureComponent {
  // static Constants = {
  //   Aspect: {},
  //   BarCodeType: {},
  //   Type: { back: 'back', front: 'front' },
  //   CaptureMode: {},
  //   CaptureTarget: {},
  //   CaptureQuality: {},
  //   Orientation: {},
  //   FlashMode: {},
  //   TorchMode: {},
  //   AutoFocus: { on: {} },
  //   WhiteBalance: { auto: {} },
  // };
  static async getCameraPermissionStatus() {
    return 'granted';
  }
  static async requestCameraPermission() {
    return 'granted';
  }

  async takePhoto() {
    await timeout(1000);
    return base64;
  }

  // async takePhoto() {
  //   const writePath = `${RNFS.DocumentDirectoryPath}/simulated_camera_photo.png`;

  //   const imageDataBase64 = 'some_large_base_64_encoded_simulated_camera_photo';
  //   await writeFile(writePath, imageDataBase64, 'base64');

  //   return { path: writePath };
  // }

  render() {
    return null;
  }
}
