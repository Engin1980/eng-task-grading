import { createContext, useContext, useState, type ReactNode } from "react";
import { createLogger } from "../services/log-service";

export interface NavigationContextDataItem {
    id: number;
    title: string;
}

export interface NavigationContextData {
    course: NavigationContextDataItem | null;
    task: NavigationContextDataItem | null;
    attendance: NavigationContextDataItem | null;
    setCourse(item: { id: number; title: string } | null): void;
    setTask(item: { id: number; title: string } | null): void;
    setAttendance(item: { id: number; title: string } | null): void;
}

export const NavigationContext = createContext<NavigationContextData | null>(null);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
    const logger = createLogger("NavigationProvider");
    const [currentCourse, setCurrentCourse] = useState<NavigationContextDataItem | null>(null);
    const [currentTask, setCurrentTask] = useState<NavigationContextDataItem | null>(null);
    const [currentAttendance, setCurrentAttendance] = useState<NavigationContextDataItem | null>(null);

    const task = currentTask;
    const course = currentCourse;
    const attendance = currentAttendance;

    const setCourse = (item: { id: number; title: string }) => {
        logger.info("Nastavuji kurz", item);
        setCurrentCourse(item);
        setCurrentTask(null);
        setCurrentAttendance(null);
    }

    const setTask = (item: { id: number; title: string }) => {
        if (!currentCourse) {
            logger.warn("Nastavuje se úkol bez aktuálního kurzu", item);
        }
        logger.info("Nastavuji úkol", item);
        setCurrentTask(item);
        setCurrentAttendance(null);
    }

    const setAttendance = (item: { id: number; title: string }) => {
        if (!currentCourse) {
            logger.warn("Nastavuje se docházka bez aktuálního kurzu", item);
        }
        logger.info("Nastavuji docházku", item);
        setCurrentAttendance(item);
        setCurrentTask(null);
    }

    return (
        <NavigationContext.Provider value={{ task, course, attendance, setCourse, setTask, setAttendance }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigationContext = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error("useNavigationContext must be used within a NavigationProvider");
    }
    return context;
};