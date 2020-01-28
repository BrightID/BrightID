import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

jest.mock(
  './src/components/Connections/SearchConnections',
  () => 'SearchConnections',
);
