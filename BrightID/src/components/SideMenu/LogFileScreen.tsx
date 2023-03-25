import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import {
  compareLogs,
  getLogTimestamp,
  listLogs,
  readLog,
} from '@/utils/logging';
import { LIGHT_BLACK, ORANGE, RED, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';

interface LogFileScreenProps {
  handleClose: () => void;
}
export const LogFileScreen = ({ handleClose }: LogFileScreenProps) => {
  const [logfileItems, setLogfileItems] = useState<Array<Element>>([]);
  const [logFile, setLogFile] = useState<null | string>(null);
  const [log, setLog] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const fetchLogFiles = async () => {
      console.log(`Fetching log files...`);
      const fileList = await listLogs();
      console.log(`Log files: ${fileList}`);
      const pickerItems = fileList
        .sort(compareLogs)
        .map((filename) => (
          <Picker.Item
            label={new Date(getLogTimestamp(filename)).toLocaleString()}
            value={filename}
            key={filename}
          />
        ));
      setLogfileItems(pickerItems);
    };
    if (logfileItems.length === 0) {
      fetchLogFiles();
    }
  }, [logfileItems]);

  const handleCopyPress = async () => {
    await Clipboard.setString(log);
  };

  const loadLogfile = async (filename: string) => {
    setLoading(true);
    console.log(`loading log file: ${filename}`);
    const contents = await readLog(filename);
    console.log(`Finished loading ${filename}...`);
    setLog(contents);
    setLoading(false);
  };

  const selectLogfileHandler = async (itemValue, _itemIndex) => {
    setLogFile(itemValue);
    await loadLogfile(itemValue);
  };

  const onRefresh = React.useCallback(async () => {
    await loadLogfile(logFile);
  }, [logFile]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContent}>
        <Picker
          selectedValue={logFile}
          onValueChange={selectLogfileHandler}
          style={styles.pickerStyle}
          itemStyle={styles.pickerItemStyle}
          enabled={!loading}
        >
          {logfileItems}
        </Picker>
      </View>
      <View style={styles.bottomContent}>
        <View style={styles.stacktraceContainer}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={true}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: false })
            }
          >
            <Text style={styles.stacktrace}>
              {loading ? 'loading...' : log}
            </Text>
          </ScrollView>
        </View>
        <View style={styles.logActionContainer}>
          <TouchableOpacity
            style={styles.logActionButton}
            onPress={onRefresh}
            disabled={loading}
          >
            <Material
              size={24}
              name="refresh"
              color={LIGHT_BLACK}
              style={{ width: 24, height: 24 }}
            />
            <View style={styles.logActionButtonContainer}>
              <Text style={styles.logActionButtonText}>Reload</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logActionButton}
            onPress={handleCopyPress}
            disabled={loading}
          >
            <Material
              size={24}
              name="content-copy"
              color={LIGHT_BLACK}
              style={{ width: 24, height: 24 }}
            />
            <View style={styles.logActionButtonContainer}>
              <Text style={styles.logActionButtonText}>Copy to clipboard</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logActionButton}
            onPress={handleClose}
            disabled={loading}
          >
            <Material
              size={24}
              name="close-circle"
              color={RED}
              style={{ width: 24, height: 24 }}
            />
            <View style={styles.logActionButtonContainer}>
              <Text style={styles.logActionButtonText}>Close</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: '30%',
  },
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  bottomContent: {
    width: '100%',
    height: '100%',
  },
  title: {
    flex: 5,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    fontWeight: '300',
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
  logActionContainer: {
    flexDirection: 'row',
  },
  logActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: DEVICE_LARGE ? 20 : 12,
  },
  logActionButtonContainer: {
    marginLeft: 5,
  },
  logActionButtonText: {
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
  pickerStyle: {
    flex: 1,
  },
  pickerItemStyle: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
  },
});
