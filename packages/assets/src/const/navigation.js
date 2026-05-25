export const navigationLinks = [
  {
    label: 'Notifications',
    destination: '/notifications'
  },
  {
    label: 'Settings',
    destination: '/settings'
  }
].map(item => ({
  ...item,
  destination: '/embed' + item.destination
}));
