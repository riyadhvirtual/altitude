import { usePathname } from 'next/navigation';
import { useState } from 'react';

export interface Tab {
  label: string;
  value: string;
  href: string;
}

export function useTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  const [[selectedTabIndex, _direction], setSelectedTab] = useState(() => {
    const indexOfInitialTab = tabs.findIndex((tab) => tab.href === pathname);
    return [indexOfInitialTab === -1 ? 0 : indexOfInitialTab, 0];
  });

  return {
    tabProps: {
      tabs,
      selectedTabIndex,
      setSelectedTab,
    },
    selectedTab: tabs[selectedTabIndex],
  };
}
