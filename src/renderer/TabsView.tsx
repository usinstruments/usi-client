import React from "react";
import { IoCloseSharp, IoCubeSharp } from "react-icons/io5";

export function TabsView() {
  const tabs = ["Tab 1", "Tab 2", "Tab 3"];

  return (
    <div className="flex flex-col h-full">
      <div className="tabs">
        {tabs.map((tab) => (
          <div className="tab" key={tab}>
            <IoCubeSharp />
            <span>{tab}</span>
            <button className="ms-2 hover:bg-gray-400 dark:hover:bg-gray-600">
              <IoCloseSharp />
            </button>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-gray-100 dark:bg-gray-900"></div>
    </div>
  );
}
