// ==============================================================================
// COMPLETE API CLIENT - Updated with new client management methods
// ==============================================================================

class APIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Admin APIs
  async getGlobalStats() { return this.request('/api/admin/stats'); }
  async getAllClients() { return this.request('/api/admin/clients'); }
  async getRecentActivity() { return this.request('/api/admin/activity'); }
  async getSystemHealth() { return this.request('/api/admin/system-health'); }
  async getPoolStatistics() { return this.request('/api/admin/pool-statistics'); }
  async getAgentHealth() { return this.request('/api/admin/agent-health'); }
  async exportGlobalStats() { window.open(`${this.baseUrl}/api/admin/export/global-stats`, '_blank'); }

  // NEW: Client Management APIs
  async createClient(name) {
    return this.request('/api/admin/clients/create', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteClient(clientId) {
    return this.request(`/api/admin/clients/${clientId}`, {
      method: 'DELETE',
    });
  }

  async regenerateClientToken(clientId) {
    return this.request(`/api/admin/clients/${clientId}/regenerate-token`, {
      method: 'POST',
    });
  }

  async getClientToken(clientId) {
    return this.request(`/api/admin/clients/${clientId}/token`);
  }

  // Notification APIs
  async getNotifications(clientId = null, limit = 10) {
    const params = new URLSearchParams();
    if (clientId) params.append('client_id', clientId);
    params.append('limit', limit);
    return this.request(`/api/notifications?${params}`);
  }

  async markNotificationRead(notifId) {
    return this.request(`/api/notifications/${notifId}/mark-read`, { method: 'POST' });
  }

  async markAllNotificationsRead(clientId = null) {
    return this.request('/api/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId }),
    });
  }

  // Search API
  async globalSearch(query) {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`);
  }

  // Client APIs
  async getClientDetails(clientId) { return this.request(`/api/client/${clientId}`); }
  async getAgents(clientId) { return this.request(`/api/client/${clientId}/agents`); }
  async getClientChartData(clientId) { return this.request(`/api/client/${clientId}/stats/charts`); }

  async toggleAgent(agentId, enabled) {
    return this.request(`/api/client/agents/${agentId}/toggle-enabled`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  }

  async updateAgentSettings(agentId, settings) {
    return this.request(`/api/client/agents/${agentId}/settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async updateAgentConfig(agentId, config) {
    return this.request(`/api/client/agents/${agentId}/config`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getAgentStatistics(agentId) {
    return this.request(`/api/client/agents/${agentId}/statistics`);
  }

  async getInstances(clientId, filters = {}) {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v && v !== 'all')
    );
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/api/client/${clientId}/instances${query}`);
  }

  async getInstancePricing(instanceId) {
    return this.request(`/api/client/instances/${instanceId}/pricing`);
  }

  async getInstanceMetrics(instanceId) {
    return this.request(`/api/client/instances/${instanceId}/metrics`);
  }

  async getPriceHistory(instanceId, days = 7, interval = 'hour') {
    return this.request(`/api/client/instances/${instanceId}/price-history?days=${days}&interval=${interval}`);
  }

  async forceSwitch(instanceId, body) {
    return this.request(`/api/client/instances/${instanceId}/force-switch`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getSavings(clientId, range = 'monthly') {
    return this.request(`/api/client/${clientId}/savings?range=${range}`);
  }

  async getSwitchHistory(clientId, instanceId = null) {
    const query = instanceId ? `?instance_id=${instanceId}` : '';
    return this.request(`/api/client/${clientId}/switch-history${query}`);
  }

  async exportSavings(clientId) {
    window.open(`${this.baseUrl}/api/client/${clientId}/export/savings`, '_blank');
  }

  async exportSwitchHistory(clientId) {
    window.open(`${this.baseUrl}/api/client/${clientId}/export/switch-history`, '_blank');
  }

  async healthCheck() {
    return this.request('/health');
  }

  async getInstanceLogs(instanceId, limit = 50) {
    return this.request(`/api/client/instances/${instanceId}/logs?limit=${limit}`);
  }

  async getAllInstancesGlobal(filters = {}) {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v && v !== 'all')
    );
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/api/admin/instances${query}`);
  }

  async getAllAgentsGlobal() {
    return this.request('/api/admin/agents');
  }
}

export default APIClient;
