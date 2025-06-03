
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState } from 'react';

interface DashboardDialogContextType {
  isSettingsDialogOpen: boolean;
  setIsSettingsDialogOpen: Dispatch<SetStateAction<boolean>>;
}

const DashboardDialogContext = createContext<DashboardDialogContextType | undefined>(undefined);

export const useDashboardDialog = () => {
  const context = useContext(DashboardDialogContext);
  if (!context) {
    throw new Error('useDashboardDialog must be used within a DashboardDialogProvider');
  }
  return context;
};

interface DashboardDialogProviderProps {
  children: ReactNode;
}

export const DashboardDialogProvider = ({ children }: DashboardDialogProviderProps) => {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  return (
    <DashboardDialogContext.Provider value={{ isSettingsDialogOpen, setIsSettingsDialogOpen }}>
      {children}
    </DashboardDialogContext.Provider>
  );
};
