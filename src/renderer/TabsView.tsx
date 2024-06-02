import { atom, useAtom } from "jotai";
import React, { ReactNode, useMemo, useState } from "react";
import { IoCloseSharp, IoCubeSharp } from "react-icons/io5";
import { store } from "./App.tsx";

type Tab = {
  id: string;
  name: string;
  icon: ReactNode;
  content: ReactNode;
};

const tabsAtom = atom<Tab[]>([]);
const currentTabIdAtom = atom<string | undefined>(undefined);

export function openTab(tab: Tab) {
  store.set(tabsAtom, (prev) => {
    if (prev.some((t) => t.id === tab.id)) {
      return prev;
    }

    return [...prev, tab];
  });

  store.set(currentTabIdAtom, tab.id);
}

export function TabsView() {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [currentTabId, setCurrentTabId] = useAtom(currentTabIdAtom);

  const currentTab = useMemo(() => {
    return tabs.find((tab) => tab.id === currentTabId);
  }, [tabs, currentTabId]);

  return (
    <div className="flex flex-col h-full">
      <div className="tabs">
        {tabs.map((tab) => (
          <div
            className={`tab ${tab.id === currentTabId ? "active" : ""}`}
            onClick={() => setCurrentTabId(tab.id)}
            key={tab.id}
          >
            {tab.icon}
            <span>{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTabs((prev) => prev.filter((t) => t.id !== tab.id));
              }}
              className="ms-2 hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              <IoCloseSharp />
            </button>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 h-full max-h-full">
        {currentTab?.content}
      </div>
    </div>
  );
}
