import React from 'react';
import { Loader2, Database, Users, Package, Wrench, FileText, Receipt, Calendar } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  loadingStates: {
    inventory: boolean;
    customers: boolean;
    teamMembers: boolean;
    workOrders: boolean;
    estimates: boolean;
    invoices: boolean;
    initialLoadComplete: boolean;
  };
  currentStep?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, loadingStates, currentStep }) => {
  if (!isVisible) return null;

  const loadingItems = [
    { key: 'inventory', label: 'Inventory', icon: Package, loading: loadingStates.inventory },
    { key: 'customers', label: 'Customers', icon: Users, loading: loadingStates.customers },
    { key: 'teamMembers', label: 'Team Members', icon: Users, loading: loadingStates.teamMembers },
    { key: 'workOrders', label: 'Work Orders', icon: Wrench, loading: loadingStates.workOrders },
    { key: 'estimates', label: 'Estimates', icon: FileText, loading: loadingStates.estimates },
    { key: 'invoices', label: 'Invoices', icon: Receipt, loading: loadingStates.invoices },
  ];

  const completedItems = loadingItems.filter(item => !item.loading).length;
  const totalItems = loadingItems.length;
  const progressPercentage = (completedItems / totalItems) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Database className="w-16 h-16 text-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Your Dashboard</h2>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Loading data...</span>
            <span>{completedItems}/{totalItems} complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Loading Items */}
        <div className="space-y-3">
          {loadingItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.key}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                  item.loading 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {item.loading ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <IconComponent className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${
                    item.loading ? 'text-blue-900' : 'text-green-900'
                  }`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  {item.loading ? (
                    <span className="text-xs text-blue-600">Loading...</span>
                  ) : (
                    <span className="text-xs text-green-600">✓ Loaded</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{currentStep}</span>
            </div>
          </div>
        )}

        {/* Loading Message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This may take a few moments depending on your data size...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
