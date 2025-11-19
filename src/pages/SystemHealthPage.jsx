import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, Brain, CheckCircle } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import api from '../services/api';

const SystemHealthPage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      setLoading(true);
      try {
        const data = await api.getSystemHealth();
        setHealth(data);
      } catch (error) {
        console.error('Failed to load health:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHealth();

    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {/* Decision Engine Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${
                health?.decisionEngineStatus?.loaded ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Cpu size={24} className={
                  health?.decisionEngineStatus?.loaded ? 'text-green-600' : 'text-red-600'
                } />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Decision Engine</h3>
                <Badge variant={health?.decisionEngineStatus?.loaded ? 'success' : 'danger'}>
                  {health?.decisionEngineStatus?.loaded ? 'Running' : 'Not Loaded'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-semibold text-gray-900">
                {health?.decisionEngineStatus?.type || 'ML-Based'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Version:</span>
              <span className="text-sm font-semibold text-gray-900">
                {health?.decisionEngineStatus?.version || 'v1.0.0'}
              </span>
            </div>
            {health?.decisionEngineStatus?.loaded && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-medium text-green-800">
                  ✓ Models loaded and ready for predictions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ML Models Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${
                health?.modelStatus?.loaded ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Brain size={24} className={
                  health?.modelStatus?.loaded ? 'text-blue-600' : 'text-gray-600'
                } />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">ML Models</h3>
                <Badge variant={health?.modelStatus?.loaded ? 'success' : 'warning'}>
                  {health?.modelStatus?.loaded ? 'Loaded' : 'Not Loaded'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Files Uploaded:</span>
              <span className="text-sm font-semibold text-gray-900">
                {health?.modelStatus?.filesUploaded || 0}
              </span>
            </div>

            {health?.modelStatus?.activeModels && health.modelStatus.activeModels.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Active Models:</p>
                <div className="space-y-2">
                  {health.modelStatus.activeModels.map((model, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle size={14} className="text-blue-600" />
                        <span className="text-xs font-medium text-gray-900">
                          {model.name}
                        </span>
                      </div>
                      <span className="text-xs text-blue-600 font-semibold">
                        v{model.version}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">No active models loaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPage;
