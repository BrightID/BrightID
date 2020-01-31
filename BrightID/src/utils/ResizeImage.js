// @flow
import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

type Props = {
  width: number,
  height: number,
  onCapture: (uri: string) => void,
  uri: string,
};

export class ResizeImage extends React.Component<Props> {
  render() {
    const { onCapture, width, height, uri } = this.props;
    return (
      <ViewShot
        ref="viewShot"
        onCapture={onCapture}
        captureMode="none"
        style={styles.snapshotView}
        options={{
          format: 'jpg',
          result: 'data-uri',
          width,
          height,
          quality: 0.6,
        }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width, height }}
            onLoadEnd={this.refs.viewShot.capture}
          />
        ) : (
          <View />
        )}
      </ViewShot>
    );
  }
}

const styles = StyleSheet.create({
  snapshotView: {
    position: 'absolute',
    right: -400,
  },
});

export default ResizeImage;
