import * as React from 'react';
import { act, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@/utils/test-utils';
import { UserTasks } from '@/components/Tasks/UserTasks';
import TasksScreen from '@/components/Tasks/TasksScreen';
import { setupStore } from '@/store';
import {
  setIsSponsored,
  setIsSponsoredv6,
  setVerifications,
} from '@/reducer/userSlice';
import { checkTasks, syncStoreTasks } from '@/components/Tasks/TasksSlice';

const mockNavigation = {
  navigate: jest.fn(),
  dispatch: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigation.navigate,
      dispatch: mockNavigation.dispatch,
      goBack: mockNavigation.goBack,
    }),
    useFocusEffect: jest.fn().mockImplementation((func) => func()),
  };
});

describe(`TasksScreen`, () => {
  let store;

  describe('get sponsored', () => {
    const userTask = UserTasks.get_sponsored;

    beforeEach(() => {
      store = setupStore();
      // populate store with available tasks
      act(() => {
        store.dispatch(syncStoreTasks());
      });
    });

    it('v5', () => {
      renderWithProviders(<TasksScreen />, { store });
      screen.getByTestId(`task-${userTask.id}-${false}`);

      act(() => {
        store.dispatch(setIsSponsored(true));
        store.dispatch(checkTasks());
      });
      screen.getByTestId(`task-${userTask.id}-${true}`);
    });

    it('v6', () => {
      renderWithProviders(<TasksScreen />, { store });
      screen.getByTestId(`task-${userTask.id}-${false}`);

      act(() => {
        store.dispatch(setIsSponsoredv6(true));
        store.dispatch(checkTasks());
      });
      screen.getByTestId(`task-${userTask.id}-${true}`);
    });

    it('v5 and v6', () => {
      renderWithProviders(<TasksScreen />, { store });
      screen.getByTestId(`task-${userTask.id}-${false}`);

      act(() => {
        store.dispatch(setIsSponsored(true));
        store.dispatch(setIsSponsoredv6(true));
        store.dispatch(checkTasks());
      });
      screen.getByTestId(`task-${userTask.id}-${true}`);
    });
  });
  describe('bitu verification', () => {
    const userTask = UserTasks.bitu_verification;
    const bituVerification: BituVerification = {
      name: 'Bitu',
      block: 1,
      score: 1,
      timestamp: 1,
      directReports: {},
      reportedConnections: {},
      hash: 'abc',
    };

    beforeEach(() => {
      // setup store and populate with available tasks
      store = setupStore();
      act(() => {
        store.dispatch(syncStoreTasks());
      });
    });

    it('negative score', () => {
      renderWithProviders(<TasksScreen />, { store });
      screen.getByTestId(`task-${userTask.id}-${false}`);

      const v: BituVerification = {
        ...bituVerification,
        score: -1,
      };
      act(() => {
        store.dispatch(setVerifications([v]));
        store.dispatch(checkTasks());
      });
      screen.getByTestId(`task-${userTask.id}-${false}`);
    });

    it('zero score', () => {
      renderWithProviders(<TasksScreen />, { store });
      screen.getByTestId(`task-${userTask.id}-${false}`);

      const v: BituVerification = {
        ...bituVerification,
        score: 0,
      };

      act(() => {
        store.dispatch(setVerifications([v]));
        store.dispatch(checkTasks());
      });
      screen.getByTestId(`task-${userTask.id}-${false}`);
    });

    it('positive score', () => {
      renderWithProviders(<TasksScreen />, { store });
      screen.getByTestId(`task-${userTask.id}-${false}`);

      const v: BituVerification = {
        ...bituVerification,
        score: 1,
      };

      act(() => {
        store.dispatch(setVerifications([v]));
        store.dispatch(checkTasks());
      });
      screen.getByTestId(`task-${userTask.id}-${true}`);
    });
  });

  describe('aura verification', () => {
    const userTask = UserTasks.aura_verification;
    const auraVerification: AuraVerification = {
      name: 'Aura',
      block: 1,
      score: 1,
      timestamp: 1,
      level: 'Gold',
    };

    beforeEach(() => {
      store = setupStore();
      // populate store with available tasks
      act(() => {
        store.dispatch(syncStoreTasks());
      });
    });

    it('negative score', () => {
      const userTask = UserTasks.bitu_verification;
      renderWithProviders(<TasksScreen />, { store });
      screen.getByTestId(`task-${userTask.id}-${false}`);

      const v: AuraVerification = {
        ...auraVerification,
        score: -1,
      };
      act(() => {
        store.dispatch(setVerifications([v]));
        store.dispatch(checkTasks());
      });
      screen.getByTestId(`task-${userTask.id}-${false}`);
    });

    it('zero score', () => {
      const userTask = UserTasks.bitu_verification;
      renderWithProviders(<TasksScreen />, { store });
      screen.getByTestId(`task-${userTask.id}-${false}`);

      const v: AuraVerification = {
        ...auraVerification,
        score: 0,
      };

      act(() => {
        store.dispatch(setVerifications([v]));
        store.dispatch(checkTasks());
      });
      screen.getByTestId(`task-${userTask.id}-${false}`);
    });

    it('positive score', () => {
      renderWithProviders(<TasksScreen />, { store });
      screen.getByTestId(`task-${userTask.id}-${false}`);

      const v: AuraVerification = {
        ...auraVerification,
        score: 1,
      };

      act(() => {
        store.dispatch(setVerifications([v]));
        store.dispatch(checkTasks());
      });
      screen.getByTestId(`task-${userTask.id}-${true}`);
    });
  });
});
