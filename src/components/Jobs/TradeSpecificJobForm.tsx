import React, { useState } from 'react';
import { X, Plus, Wrench } from 'lucide-react';
import { TradeType } from '../../types';
import { tradeConfigs } from '../../data/tradeConfigs';

interface TradeSpecificJobFormProps {
  trade: TradeType;
  onClose: () => void;
  onSubmit: (jobData: any) => void;
}

const TradeSpecificJobForm: React.FC<TradeSpecificJobFormProps> = ({ trade, onClose, onSubmit }) => {
  const config = tradeConfigs[trade];
  const [formData, setFormData] = useState({
    jobType: '',
    description: '',
    estimatedDuration: config.defaultJobDuration,
    priority: 'medium',
    tradeSpecificData: {}
  });

  const renderTradeSpecificFields = () => {
    switch (trade) {
      case 'hvac':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">HVAC System Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">System Age (years)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, systemAge: parseInt(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SEER Rating</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, seerRating: parseInt(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Refrigerant Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, refrigerantType: e.target.value }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="R-410A">R-410A</option>
                  <option value="R-22">R-22</option>
                  <option value="R-134A">R-134A</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Number</label>
                <input
                  type="text"
                  placeholder="e.g., Unit 1, Main Floor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, unitNumber: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        );

      case 'electrical':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Electrical System Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Panel Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, panelType: e.target.value }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="Main Panel">Main Panel</option>
                  <option value="Sub Panel">Sub Panel</option>
                  <option value="Fuse Box">Fuse Box</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amperage</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, amperage: e.target.value }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="100A">100A</option>
                  <option value="200A">200A</option>
                  <option value="400A">400A</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Circuit Number</label>
                <input
                  type="text"
                  placeholder="e.g., Circuit 12"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, circuitNumber: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Permit Required</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, permitRequired: e.target.value === 'yes' }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'plumbing':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Plumbing System Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pipe Material</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, pipeMaterial: e.target.value }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="PVC">PVC</option>
                  <option value="Copper">Copper</option>
                  <option value="PEX">PEX</option>
                  <option value="Cast Iron">Cast Iron</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pipe Size</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, pipeSize: e.target.value }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="1/2 inch">1/2 inch</option>
                  <option value="3/4 inch">3/4 inch</option>
                  <option value="1 inch">1 inch</option>
                  <option value="1.5 inch">1.5 inch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Water Pressure (PSI)</label>
                <input
                  type="number"
                  placeholder="e.g., 45"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, waterPressure: parseInt(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fixture Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, fixtureType: e.target.value }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="Toilet">Toilet</option>
                  <option value="Sink">Sink</option>
                  <option value="Shower">Shower</option>
                  <option value="Water Heater">Water Heater</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'locksmith':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Lock System Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lock Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, lockType: e.target.value }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="Deadbolt">Deadbolt</option>
                  <option value="Knob Lock">Knob Lock</option>
                  <option value="Smart Lock">Smart Lock</option>
                  <option value="Padlock">Padlock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand/Model</label>
                <input
                  type="text"
                  placeholder="e.g., Schlage B60N"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, brandModel: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Key Count</label>
                <input
                  type="number"
                  placeholder="Number of keys needed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, keyCount: parseInt(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Security Level</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, securityLevel: e.target.value }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="Standard">Standard</option>
                  <option value="High Security">High Security</option>
                  <option value="Commercial Grade">Commercial Grade</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'general-contractor':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Project Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Phase</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, projectPhase: e.target.value }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="Planning">Planning</option>
                  <option value="Framing">Framing</option>
                  <option value="Electrical/Plumbing">Electrical/Plumbing</option>
                  <option value="Drywall">Drywall</option>
                  <option value="Finishing">Finishing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Square Footage</label>
                <input
                  type="number"
                  placeholder="e.g., 1200"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, squareFootage: parseInt(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Permits Required</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, permitsRequired: e.target.value === 'yes' }
                  }))}
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subcontractors Needed</label>
                <input
                  type="text"
                  placeholder="e.g., Electrician, Plumber"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tradeSpecificData: { ...prev.tradeSpecificData, subcontractors: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{config.icon}</span>
            <h2 className="text-xl font-semibold text-slate-900">New {config.name} Job</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Job Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
              <select
                required
                value={formData.jobType}
                onChange={(e) => setFormData(prev => ({ ...prev, jobType: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select job type...</option>
                {config.jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the work to be performed..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trade-Specific Fields */}
          {renderTradeSpecificFields()}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Wrench size={16} />
              <span>Create Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeSpecificJobForm;