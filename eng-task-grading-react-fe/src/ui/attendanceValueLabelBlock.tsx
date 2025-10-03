export const AttendanceValueLabelBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {children}
    </div>
  );
};