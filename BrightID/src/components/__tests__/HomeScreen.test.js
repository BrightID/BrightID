import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { Text, View } from 'react-native';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configure, shallow } from 'enzyme';
import { initialState } from '../../reducer';
import store from '../../store';
import {
  setUserData,
  setUserScore,
  setGroupsCount,
  setConnections,
} from '../../actions';
import Home, { HomeScreen } from '../HomeScreen';

configure({ adapter: new Adapter() });

describe('homescreen', () => {
  test('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Home />
        </Provider>,
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  test('name is updated', () => {
    // updating redux store should update homescreen component

    const main1 = store.getState().main;
    const wrapper1 = shallow(<HomeScreen {...main1} />);

    expect(wrapper1.find('#name').children()).toHaveLength(0);

    store.dispatch(
      setUserData({
        name: 'Shiva',
      }),
    );

    const main2 = store.getState().main;
    const wrapper2 = shallow(<HomeScreen {...main2} />);

    expect(wrapper2.find('#name').children()).toHaveLength(1);

    expect(
      wrapper2
        .find('#name')
        .children()
        .text(),
    ).toBe('Shiva');
  });

  test('score is updated', () => {
    // updating redux store should update homescreen component

    const main1 = store.getState().main;
    const wrapper1 = shallow(<HomeScreen {...main1} />);

    expect(wrapper1.find('#score').children()).toHaveLength(1);

    expect(
      wrapper1
        .find('#score')
        .children()
        .text(),
    ).toBe('% Trusted');

    store.dispatch(setUserScore(99.8));

    const main2 = store.getState().main;
    const wrapper2 = shallow(<HomeScreen {...main2} />);

    expect(wrapper2.find('#score').children()).toHaveLength(2);

    expect(
      wrapper2
        .find('#score')
        .children()
        .first()
        .text(),
    ).toBe('99.8');

    expect(
      wrapper2
        .find('#score')
        .children()
        .last()
        .text(),
    ).toBe('% Trusted');
  });

  test('connectionsCount is updated', () => {
    // updating redux store should update homescreen component

    const main1 = store.getState().main;
    const wrapper1 = shallow(<HomeScreen {...main1} />);

    expect(wrapper1.find('#connectionsCount').children()).toHaveLength(1);

    expect(
      wrapper1
        .find('#connectionsCount')
        .children()
        .text(),
    ).toBe('1');

    store.dispatch(setConnections([...Array(8)]));

    const main2 = store.getState().main;
    const wrapper2 = shallow(<HomeScreen {...main2} />);

    expect(wrapper2.find('#connectionsCount').children()).toHaveLength(1);

    expect(
      wrapper2
        .find('#connectionsCount')
        .children()
        .text(),
    ).toBe('8');
  });

  test('groupsCount is updated', () => {
    // updating redux store should update homescreen component

    const main1 = store.getState().main;
    const wrapper1 = shallow(<HomeScreen {...main1} />);

    expect(wrapper1.find('#groupsCount').children()).toHaveLength(0);

    store.dispatch(setGroupsCount(10));

    const main2 = store.getState().main;
    const wrapper2 = shallow(<HomeScreen {...main2} />);

    expect(wrapper2.find('#groupsCount').children()).toHaveLength(1);

    expect(
      wrapper2
        .find('#groupsCount')
        .children()
        .text(),
    ).toBe('10');
  });
});
