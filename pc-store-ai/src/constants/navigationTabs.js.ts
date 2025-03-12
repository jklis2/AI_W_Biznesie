interface NavigationTab {
  id: number;
  href: string;
  label: string;
  requiresAuth?: boolean;
}

interface DropdownTab extends NavigationTab {
  onClick?: () => void;
}

const NAVIGATION_TABS: NavigationTab[] = [
  { id: 1, href: '/ai-assistant', label: 'AI Assistant' },
  { id: 2, href: '/guides', label: 'Guides' },
  { id: 3, href: '/contact', label: 'Contact' },
  { id: 4, href: '/products', label: 'Products' },
];

const DROPDOWN_TABS: DropdownTab[] = [
  { id: 1, href: '/my-account', label: 'My Account', requiresAuth: true },
  { id: 2, href: '/cart', label: 'Cart', requiresAuth: true },
  { id: 3, href: '/my-orders', label: 'My Orders', requiresAuth: true },
  { id: 4, href: '/', label: 'Logout' },
];

export { NAVIGATION_TABS, DROPDOWN_TABS };
export type { NavigationTab, DropdownTab };
