import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  return true;
};

export const scheduleVoiceNoteReminder = async (title: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Voice Note Reminder 💕",
      body: "Your wife will kill you if you don't listen to her voice note!",
      data: { type: 'voiceNote' },
    },
    trigger: { seconds: 3600 }, // Reminder after 1 hour
  });
};

export const scheduleEventReminder = async (eventName: string, date: Date) => {
  // One week before
  const oneWeekBefore = new Date(date);
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
  oneWeekBefore.setHours(6, 0, 0, 0);

  // Day of event
  const dayOf = new Date(date);
  dayOf.setHours(6, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming Event Reminder 📅",
      body: `${eventName} is coming up in one week!`,
      data: { type: 'event', eventName },
    },
    trigger: oneWeekBefore,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Event Today! 🎉",
      body: `${eventName} is today!`,
      data: { type: 'event', eventName },
    },
    trigger: dayOf,
  });
};

export const scheduleSavingsReminder = async (purpose: string, maturityDate: Date) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Savings Maturity Reminder 💰",
      body: `Your savings for "${purpose}" has reached maturity!`,
      data: { type: 'savings', purpose },
    },
    trigger: maturityDate,
  });
};