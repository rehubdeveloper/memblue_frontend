import React, { useState } from 'react';
import { Check, ArrowRight, X } from 'lucide-react';
import { TradeType } from '../../types';
import { tradeConfigs } from '../../data/tradeConfigs';

interface TradeSelectionProps {
  onComplete: (primaryTrade: TradeType, secondaryTrades: TradeType[], businessType: 'solo' | 'team') => void;
}

const TradeSelection: React.FC<TradeSelectionProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [primaryTrade, setPrimaryTrade] = useState<TradeType | null>(null);
  const [secondaryTrades, setSecondaryTrades] = useState<TradeType[]>([]);
  const [businessType, setBusinessType] = useState<'solo' | 'team'>('solo');

  const handleSecondaryTradeToggle = (trade: TradeType) => {
    if (trade === primaryTrade) return;
    
    setSecondaryTrades(prev => 
      prev.includes(trade) 
        ? prev.filter(t => t !== trade)
        : [...prev, trade]
    );
  };

  const handleComplete = () => {
    if (primaryTrade) {
      onComplete(primaryTrade, secondaryTrades, businessType);
    }
  };

  const handleSkipSecondary = () => {
    setSecondaryTrades([]);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to MemBlue</h1>
          <p className="text-slate-600">Memphis's premier trade operations platform</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">What's your primary trade?</h2>
            <p className="text-slate-600 text-center mb-8">This will customize your entire MemBlue experience</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tradeConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setPrimaryTrade(key as TradeType)}
                  className={`p-6 rounded-lg border-2 transition-all hover:shadow-md ${
                    primaryTrade === key
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{config.icon}</div>
                    <h3 className="font-semibold text-slate-900 mb-2">{config.name}</h3>
                    <p className="text-sm text-slate-600">
                      {config.jobTypes.slice(0, 3).join(', ')}...
                    </p>
                  </div>
                  {primaryTrade === key && (
                    <div className="mt-3 flex justify-center">
                      <Check className="text-blue-600" size={20} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!primaryTrade}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">Any secondary trades?</h2>
            <p className="text-slate-600 text-center mb-8">Select additional services you offer (optional)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tradeConfigs)
                .filter(([key]) => key !== primaryTrade)
                .map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleSecondaryTradeToggle(key as TradeType)}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    secondaryTrades.includes(key as TradeType)
                      ? 'border-green-600 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{config.icon}</div>
                    <h3 className="font-medium text-slate-900">{config.name}</h3>
                  </div>
                  {secondaryTrades.includes(key as TradeType) && (
                    <div className="mt-2 flex justify-center">
                      <Check className="text-green-600" size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleSkipSecondary}
                className="flex items-center space-x-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <span>No Secondary Trades</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">Business type?</h2>
            <p className="text-slate-600 text-center mb-8">This helps us customize your workflow</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => setBusinessType('solo')}
                className={`p-6 rounded-lg border-2 transition-all hover:shadow-md ${
                  businessType === 'solo'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">👤</div>
                  <h3 className="font-semibold text-slate-900 mb-2">Solo Operator</h3>
                  <p className="text-sm text-slate-600">
                    Just you handling jobs and customers
                  </p>
                </div>
                {businessType === 'solo' && (
                  <div className="mt-3 flex justify-center">
                    <Check className="text-blue-600" size={20} />
                  </div>
                )}
              </button>

              <button
                onClick={() => setBusinessType('team')}
                className={`p-6 rounded-lg border-2 transition-all hover:shadow-md ${
                  businessType === 'team'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="font-semibold text-slate-900 mb-2">Team Business</h3>
                  <p className="text-sm text-slate-600">
                    Multiple technicians and job coordination
                  </p>
                </div>
                {businessType === 'team' && (
                  <div className="mt-3 flex justify-center">
                    <Check className="text-blue-600" size={20} />
                  </div>
                )}
              </button>
            </div>

            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                <span>Complete Setup</span>
                <Check size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeSelection;