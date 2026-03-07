import React, { createContext, useContext, useState, ReactNode } from 'react';
import initialHullData from '../data/hulls.json';

interface Point {
    x: number;
    y: number;
}

interface HullConfig {
    p1: Point;
    p2: Point;
    p3: Point;
    p4: Point;
}

interface HullEditorContextValue {
    hulls: Record<string, HullConfig>;
}

const HullEditorContext = createContext<HullEditorContextValue | null>(null);

export const HullEditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [hulls] = useState<Record<string, HullConfig>>(initialHullData);

    return (
        <HullEditorContext.Provider value={{ hulls }}>
            {children}
        </HullEditorContext.Provider>
    );
};

export const useHullEditor = () => {
    const context = useContext(HullEditorContext);
    if (!context) throw new Error('useHullEditor must be used within a HullEditorProvider');
    return context;
};
