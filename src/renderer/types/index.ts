export type MenuItemId = 'home' | 'browser' | 'settings';

export interface MenuItem {
  id: MenuItemId;
  label: string;
  icon: string;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
}

