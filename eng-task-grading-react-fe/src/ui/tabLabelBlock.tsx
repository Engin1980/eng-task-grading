import { useNavigate } from "@tanstack/react-router";
import React, { createContext, useContext, useEffect } from "react";

export interface TabLabelBlockProps {
  children?: React.ReactNode;
  selectedTabKey?: string;
}

export interface SelectedTabKeyContextValue {
  tabKey: string | null;
  clickCallback: (link: string, tabKey: string) => void;
}

const SelectedTabKeyContext = createContext<SelectedTabKeyContextValue | null>(null);
export const useSelectedTabKeyData = () => useContext(SelectedTabKeyContext);

export const TabLabelBlock: React.FC<TabLabelBlockProps> = ({ children, selectedTabKey }) => {
  const [currentTabKey, setCurrentTabKey] = React.useState<string | null>(selectedTabKey ?? null);
  const [selectedTabKeyContextValue, setSelectedTabKeyContextValue] = React.useState<SelectedTabKeyContextValue | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const val: SelectedTabKeyContextValue = {
      tabKey: currentTabKey ?? null,
      clickCallback: (link: string, tabKey: string) => {
        setCurrentTabKey(tabKey);
        navigate({ to: link });
      },
    };
    setSelectedTabKeyContextValue(val);
  }, [currentTabKey]);

  return (
    <SelectedTabKeyContext.Provider value={selectedTabKeyContextValue}>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {children}
        </nav>
      </div>
    </SelectedTabKeyContext.Provider>
  );
};  