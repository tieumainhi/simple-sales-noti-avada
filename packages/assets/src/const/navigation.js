export const navigationLinks = [
  {
    label: 'Notifications',
    destination: '/notifications'
  },
  {
    label: 'Settings',
    destination: '/settings'
  },
  {
    label: 'Samples',
    destination: '/samples'
  },
  {
    label: 'Optional Scopes',
    destination: '/optional-scopes'
  },
  {
    label: 'Tables',
    destination: '/tables'
  },
  {
    label: 'Fullscreen Page A',
    destination: '/fullscreen-page-a'
  }
].map(item => ({
  ...item,
  destination: '/embed' + item.destination
}));
