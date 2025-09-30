import React from "react";
import { useSelectedTabKeyData } from "./tabLabelBlock";

type TabProps = {
  to: string;
  children: React.ReactNode;
  tabKey?: string;
};

export const TabLabelLink: React.FC<TabProps> = ({ children, to, tabKey }) => {
  const tabContextData = useSelectedTabKeyData();
  const isSelected = tabContextData?.tabKey === tabKey;

  const handleClick = () => {
    if (tabContextData) {
      tabContextData.clickCallback(to, tabKey ?? "");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`py-2 px-1 border-b-2 font-medium text-sm px-2
         hover:bg-gray-200 hover:rounded-t-md flex
      ${isSelected ? "text-blue-600 border-blue-600" : `text-gray-600`}`}>
      {children}
    </button>
  );
};