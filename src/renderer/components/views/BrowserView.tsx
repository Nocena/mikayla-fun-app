import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { BrowserTabs } from '../BrowserTabs/BrowserTabs.js';
import { BrowserContent } from '../BrowserContent/BrowserContent.js';
import type { BrowserTab } from '../../types';

export const BrowserView = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: '1',
      title: 'New Tab',
      url: 'about:blank',
      isActive: true,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('1');

  const handleTabClick = (tabId: string) => {
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        isActive: tab.id === tabId,
      }))
    );
    setActiveTabId(tabId);
  };

  const handleNewTab = () => {
    const newTab: BrowserTab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: 'about:blank',
      isActive: true,
    };
    setTabs((prev) =>
      prev.map((tab) => ({ ...tab, isActive: false })).concat(newTab)
    );
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((tab) => tab.id !== tabId);
      if (filtered.length === 0) {
        return [
          {
            id: Date.now().toString(),
            title: 'New Tab',
            url: 'about:blank',
            isActive: true,
          },
        ];
      }
      if (activeTabId === tabId) {
        const newActive = filtered[0];
        newActive.isActive = true;
        setActiveTabId(newActive.id);
      }
      return filtered;
    });
  };

  const handleUrlChange = (url: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId ? { ...tab, url, title: url || 'New Tab' } : tab
      )
    );
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <Box w="100%" h="100%" display="flex" flexDirection="column" bg="gray.900">
      <BrowserTabs
        tabs={tabs}
        onTabClick={handleTabClick}
        onNewTab={handleNewTab}
        onCloseTab={handleCloseTab}
      />
      {activeTab && (
        <BrowserContent
          url={activeTab.url}
          onUrlChange={handleUrlChange}
        />
      )}
    </Box>
  );
};

