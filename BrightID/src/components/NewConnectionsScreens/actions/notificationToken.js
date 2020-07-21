import notificationService from '@/api/notificationService';

export const oneTimeToken = async () => {
  try {
    let { notificationToken } = await notificationService.getToken({
      oneTime: true,
    });
    console.log('notificationToken', notificationToken);
    return notificationToken;
  } catch (err) {
    console.log(err.message);
    return 'unavailable';
  }
};
