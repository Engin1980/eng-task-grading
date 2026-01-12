import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AttendanceDto } from '../model/attendance-dto';

interface AttendanceContextType {
  attendance: AttendanceDto | null;
  setAttendance: (attendance: AttendanceDto | null) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [attendance, setAttendance] = useState<AttendanceDto | null>(null);

  return (
    <AttendanceContext.Provider value={{ attendance, setAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendanceContext() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendanceContext must be used within AttendanceProvider');
  }
  return context;
}
