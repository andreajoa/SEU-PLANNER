importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA2-UyrlW8vxnzFXm8VT4tkXHORB3FZtIU",
  authDomain: "planner-7ff4b.firebaseapp.com",
  projectId: "planner-7ff4b",
  storageBucket: "planner-7ff4b.firebasestorage.app",
  messagingSenderId: "582409451256",
  appId: "1:582409451256:web:ef3f75d6933cdb2f332d0d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Notificação em background:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
