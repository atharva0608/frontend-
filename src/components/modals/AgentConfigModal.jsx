import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import Button from '../common/Button';
import api from '../../services/api';

const AgentConfigModal = ({ agent, onClose, onSave }) => {
  const [config, setConfig] = useState({
    min_savings_percent: 15,
    risk_threshold: 0.3,
    max_switches_per_week: 10,
    min_pool_duration_hours: 2,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateAgentConfig(agent.id, config);
      onSave();
      onClose();
    } catch (error) {
      alert('Failed to save configuration: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Agent Configuration</h3>
              <p className="text-sm text-gray-500 mt-1 font-mono break-all">{agent.id}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Savings Percentage
            </label>
            <input
              type="number"
              value={config.min_savings_percent}
              onChange={(e) => setConfig({ ...config, min_savings_percent: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">Only switch if savings exceed this percentage</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Threshold
            </label>
            <input
              type="number"
              value={config.risk_threshold}
              onChange={(e) => setConfig({ ...config, risk_threshold: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="1"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum acceptable risk score (0-1)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Switches Per Week
            </label>
            <input
              type="number"
              value={config.max_switches_per_week}
              onChange={(e) => setConfig({ ...config, max_switches_per_week: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="50"
            />
            <p className="text-xs text-gray-500 mt-1">Prevent excessive switching</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Pool Duration (hours)
            </label>
            <input
              type="number"
              value={config.min_pool_duration_hours}
              onChange={(e) => setConfig({ ...config, min_pool_duration_hours: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="24"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum time before considering another switch</p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving} icon={<Save size={16} />}>
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentConfigModal;
