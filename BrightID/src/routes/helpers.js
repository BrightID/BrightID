import { ORANGE } from '@/utils/constants';

const headerTitleStyle = {
  fontFamily: 'EurostileRegular',
  fontWeight: '200',
  fontSize: 24,
};

export const headerOptions = () => ({
  headerTitleStyle,
  headerStyle: {
    backgroundColor: ORANGE,
  },
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
});
