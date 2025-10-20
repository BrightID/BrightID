import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { LIGHT_BLACK, ORANGE, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

const ErrorFallback = ({ error, resetError }: ErrorFallbackProps) => {
  const copyStacktrace = () => {
    Clipboard.setString(error.stack);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContent}>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.subtitle}>There&apos;s an error</Text>
        <Text style={styles.error}>{error.toString()}</Text>
        <TouchableOpacity style={styles.button} onPress={resetError}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomContent}>
        <TouchableOpacity
          testID="CopyQrBtn"
          style={styles.copyStackButton}
          onPress={copyStacktrace}
        >
          <MaterialDesignIcons
            size={24}
            name="content-copy"
            color={LIGHT_BLACK}
            style={{ width: 24, height: 24 }}
          />
          <View style={styles.copyTextContainer}>
            <Text style={styles.copyText}>Copy stacktrace to clipboard</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.stacktraceContainer}>
          <ScrollView showsVerticalScrollIndicator={true}>
            <Text style={styles.stacktrace}>{error.stack}</Text>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa',
    flex: 1,
    justifyContent: 'center',
  },
  topContent: {
    flex: 2,
    marginHorizontal: 16,
  },
  bottomContent: {
    flex: 3,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 48,
    fontWeight: '300',
    paddingBottom: 16,
    color: '#000',
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
  },
  error: {
    fontFamily: 'Poppins-Medium',
    paddingVertical: 16,
  },
  stacktraceContainer: {
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: LIGHT_BLACK,
    padding: 10,
  },
  stacktrace: {
    fontSize: 8,
  },
  copyStackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: DEVICE_LARGE ? 20 : 12,
  },
  copyTextContainer: {
    marginLeft: 5,
  },
  copyText: {
    color: LIGHT_BLACK,
    fontSize: fontSize[10],
    fontFamily: 'Poppins-Bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 36 : 28,
    backgroundColor: ORANGE,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: WHITE,
    marginLeft: 10,
  },
});

export default ErrorFallback;
