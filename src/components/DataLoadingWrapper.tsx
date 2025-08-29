import React from 'react';
import { useAuth } from '../context/AppContext';
import LoadingOverlay from './LoadingOverlay';

interface DataLoadingWrapperProps {
  children: React.ReactNode;
}

const DataLoadingWrapper: React.FC<DataLoadingWrapperProps> = ({ children }) => {
  const { showLoadingOverlay, dataLoadingState, currentLoadingStep } = useAuth();

  return (
    <>
      {children}
      <LoadingOverlay 
        isVisible={showLoadingOverlay} 
        loadingStates={dataLoadingState}
        currentStep={currentLoadingStep}
      />
    </>
  );
};

export default DataLoadingWrapper;
