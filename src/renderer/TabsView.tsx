import { atom, useAtom } from "jotai";
import React, { ReactNode, useMemo, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { store } from "./App.tsx";
import ComponentFactory, { ComponentDef } from "./components/ComponentFactory.tsx";
import IconFactory, { IconDef } from "./components/IconFactory.tsx";
import { atomWithStorage } from "jotai/utils";

type Tab = {
  id: string;
  name: string;
  icon: IconDef;
  content: ComponentDef;
};

const tabsAtom = atomWithStorage<Tab[]>("openTabs", []);
const currentTabIdAtom = atomWithStorage<string | undefined>("currentTab", undefined);

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

  const closeTab = (id: string) => 
                setTabs((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="flex flex-col h-full">
      <div className="tabs">
        {tabs.map((tab) => (
          <div
            className={`tab ${tab.id === currentTabId ? "active" : ""}`}
            onClick={() => setCurrentTabId(tab.id)}
            onAuxClick={() => closeTab(tab.id)}
            key={tab.id}
          >
            {/* {tab.icon} */}
            <IconFactory {...tab.icon} />
            <span>{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="ms-2 hover:bg-zinc-400 dark:hover:bg-zinc-600"
            >
              <IoCloseSharp />
            </button>
          </div>
        ))}
      </div>
      <div className="min-h-0 h-full">
        {currentTab && <ComponentFactory {...currentTab.content} />}
      </div>
    </div>
  );
}
