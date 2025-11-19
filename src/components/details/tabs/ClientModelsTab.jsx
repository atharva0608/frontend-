import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, XCircle, TrendingUp, Activity } from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import Badge from '../../common/Badge';
import api from '../../../services/api';

const ClientModelsTab = ({ clientId }) => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await api.getAgentDecisions(clientId);
        setDecisions(data.decisions || []);
        setStats(data.stats || null);
      } catch (error) {
        console.error('Failed to load agent decisions:', error);
        setDecisions([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [clientId]);

  const getHealthIcon = (health) => {
    if (health >= 80) return <CheckCircle size={16} className="text-green-500" />;
    if (health >= 50) return <AlertCircle size={16} className="text-yellow-500" />;
    return <XCircle size={16} className="text-red-500" />;
  };

  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (health >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getDecisionBadge = (decision) => {
    if (decision === 'switch') return <Badge variant="success">Switch</Badge>;
    if (decision === 'hold') return <Badge variant="warning">Hold</Badge>;
    return <Badge variant="info">{decision}</Badge>;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Decisions</p>
              <Activity size={18} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDecisions || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Success Rate</p>
              <TrendingUp size={18} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.successRate || 0}%</p>
            <p className="text-xs text-gray-500 mt-1">Successful switches</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <Brain size={18} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.avgConfidence || 0}%</p>
            <p className="text-xs text-gray-500 mt-1">Model confidence</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Health Score</p>
              <CheckCircle size={18} className="text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${stats.healthScore >= 80 ? 'text-green-600' : stats.healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stats.healthScore || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Overall health</p>
          </div>
        </div>
      )}

      {/* Decisions Table */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Agent Decision History</h3>
            <p className="text-sm text-gray-500 mt-1">Recent ML model decisions and outcomes</p>
          </div>
          <Badge variant="info">Real-time</Badge>
        </div>

        {decisions.length === 0 ? (
          <EmptyState
            icon={<Brain size={48} />}
            title="No Decisions Recorded"
            description="Agent decisions will appear here once the ML models start making predictions"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Instance ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Decision</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Confidence</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Health</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Reason</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((decision, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">
                        {new Date(decision.timestamp).toLocaleString()}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-mono text-blue-600 break-all">
                        {decision.instanceId?.substring(0, 16)}...
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {getDecisionBadge(decision.decision)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${decision.confidence || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {decision.confidence || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border ${getHealthColor(decision.health)}`}>
                        {getHealthIcon(decision.health)}
                        <span className="text-sm font-bold">{decision.health}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {decision.reason || 'N/A'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {decision.outcome === 'success' ? (
                        <Badge variant="success">Success</Badge>
                      ) : decision.outcome === 'failed' ? (
                        <Badge variant="danger">Failed</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientModelsTab;
