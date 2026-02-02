import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

interface NotificationSettings {
  enabled: boolean;
  time: string;
  timezone: string;
  subscription: PushSubscriptionJSON | null;
  updatedAt: string;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getPermissionState(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.ready;
}

async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!VAPID_PUBLIC_KEY) {
    console.error('VAPID public key not configured');
    return null;
  }
  const registration = await getRegistration();
  if (!registration) return null;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
  });
  return subscription;
}

async function unsubscribeFromPush(): Promise<void> {
  const registration = await getRegistration();
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
}

export async function loadNotificationSettings(uid: string): Promise<NotificationSettings | null> {
  const snap = await getDoc(doc(db, 'pushSubscriptions', uid));
  return snap.exists() ? (snap.data() as NotificationSettings) : null;
}

async function saveNotificationSettings(uid: string, settings: NotificationSettings): Promise<void> {
  await setDoc(doc(db, 'pushSubscriptions', uid), settings);
}

export async function enableNotifications(uid: string, time: string): Promise<boolean> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const subscription = await subscribeToPush();
  if (!subscription) return false;

  await saveNotificationSettings(uid, {
    enabled: true,
    time,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    subscription: subscription.toJSON(),
    updatedAt: new Date().toISOString(),
  });
  return true;
}

export async function disableNotifications(uid: string): Promise<void> {
  await unsubscribeFromPush();
  await saveNotificationSettings(uid, {
    enabled: false,
    time: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    subscription: null,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateNotificationTime(uid: string, time: string): Promise<void> {
  const existing = await loadNotificationSettings(uid);
  if (!existing) return;
  await saveNotificationSettings(uid, {
    ...existing,
    time,
    updatedAt: new Date().toISOString(),
  });
}
