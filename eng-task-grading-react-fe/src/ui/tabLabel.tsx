import React from "react";

type TabProps = {
  children: React.ReactNode;
};

export const TabLabel: React.FC<TabProps> = ({ children }) => {
  return (
    <div className="flex items-center">{children}</div>
  );
};