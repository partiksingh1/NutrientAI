import React, { ReactNode } from 'react';
import { CopilotProvider as RNGCopilotProvider } from 'react-native-copilot';
import StepComponent from './CopilotStepComponent';

interface CopilotProviderProps {
  children: ReactNode;
}

export default function CopilotProvider({ children }: CopilotProviderProps) {
  return (
    <RNGCopilotProvider
      overlay="svg"
      animated={true}
      verticalOffset={0}
      arrowColor="#10B981"
      tooltipStyle={{
        backgroundColor: 'transparent',
      }}
    >
      {children}
    </RNGCopilotProvider>
  );
}