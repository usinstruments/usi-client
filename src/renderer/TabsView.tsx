import React from "react";

export function TabsView() {
  const tabs = ["Tab 1", "Tab 2", "Tab 3"];

  return (
    <div className="flex flex-col h-full">
      <div className="tabs">
        {tabs.map((tab) => (
          <div className="tab" key={tab}>
            <span>{tab}</span>
            {/* <button className="w-5 h-5 flex flex-row items-center justify-center border-none">x</button> */}
          </div>
        ))}
      </div>
      <div className="flex-1 bg-gray-100 dark:bg-gray-900"></div>
    </div>
  );
}
