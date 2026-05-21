import { NotificationIcon, SettingsIcon } from '@shopify/polaris-icons';

const menuIcons = [
  {
    icon: NotificationIcon,
    destination: '/notifications'
  },
  {
    icon: SettingsIcon,
    destination: '/settings'
  }
];

export const getMenuIcon = url => menuIcons.find(x => x.destination === url)?.icon || SettingsIcon;
