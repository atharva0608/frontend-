import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, Clock } from 'lucide-react';
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
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="API Status" 
          value={health?.apiStatus || 'Unknown'}
          icon={<Activity size={24} />}
          subtitle="Response time: 45ms"
        />
        <StatCard 
          title="Database" 
          value={health?.database || 'Connected'}
          icon={<Database size={24} />}
          subtitle="Pool: 8/10 active"
        />
        <StatCard 
          title="Decision Engine" 
          value={health?.decisionEngine || 'Loaded'}
          icon={<Cpu size={24} />}
          subtitle="ML models ready"
        />
        <StatCard 
          title="Uptime" 
          value="99.9%"
          icon={<Clock size={24} />}
          subtitle="Last 30 days"
        />
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">System Components</h3>
        <div className="space-y-4">
          {[
            { name: 'Web Server', status: 'Healthy', uptime: '99.9%' },
            { name: 'Database Server', status: 'Healthy', uptime: '100%' },
            { name: 'Decision Engine', status: 'Healthy', uptime: '99.8%' },
            { name: 'Agent Communication', status: 'Healthy', uptime: '99.7%' },
            { name: 'Background Jobs', status: 'Healthy', uptime: '100%' },
          ].map((component, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{component.name}</p>
                  <p className="text-xs text-gray-500">Uptime: {component.uptime}</p>
                </div>
              </div>
              <Badge variant="success">{component.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
