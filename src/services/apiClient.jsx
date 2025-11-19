// ==============================================================================
// COMPLETE API CLIENT - Synchronized with Backend v4.0 (Updated)
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

  // ==============================================================================
  // ADMIN APIs
  // ==============================================================================

  async getGlobalStats() {
    return this.request('/api/admin/stats');
  }

  async getAllClients() {
    return this.request('/api/admin/clients');
  }

  async getRecentActivity() {
    return this.request('/api/admin/activity');
  }

  async getSystemHealth() {
    return this.request('/api/admin/system-health');
  }

  // NEW: Client Growth Chart (Task 4)
  async getClientsGrowth(days = 30) {
    return this.request(`/api/admin/clients/growth?days=${days}`);
  }

  // ==============================================================================
  // CLIENT MANAGEMENT APIs
  // ==============================================================================

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

  // ==============================================================================
  // NOTIFICATION APIs
  // ==============================================================================

  async getNotifications(clientId = null, limit = 10) {
    const params = new URLSearchParams();
    if (clientId) params.append('client_id', clientId);
    params.append('limit', limit);
    return this.request(`/api/notifications?${params}`);
  }

  async markNotificationRead(notifId) {
    return this.request(`/api/notifications/${notifId}/mark-read`, {
      method: 'POST'
    });
  }

  async markAllNotificationsRead(clientId = null) {
    return this.request('/api/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId }),
    });
  }

  // ==============================================================================
  // CLIENT APIs
  // ==============================================================================

  async getClientDetails(clientId) {
    return this.request(`/api/client/${clientId}`);
  }

  async getAgents(clientId) {
    return this.request(`/api/client/${clientId}/agents`);
  }

  async getClientChartData(clientId) {
    return this.request(`/api/client/${clientId}/stats/charts`);
  }

  async getInstances(clientId, filters = {}) {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v && v !== 'all')
    );
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/api/client/${clientId}/instances${query}`);
  }

  async getSavings(clientId, range = 'monthly') {
    return this.request(`/api/client/${clientId}/savings?range=${range}`);
  }

  async getSwitchHistory(clientId, instanceId = null) {
    const query = instanceId ? `?instance_id=${instanceId}` : '';
    return this.request(`/api/client/${clientId}/switch-history${query}`);
  }

  // NEW: Agent Decisions (Task 7)
  async getAgentDecisions(clientId) {
    return this.request(`/api/client/${clientId}/agents/decisions`);
  }

  // ==============================================================================
  // AGENT APIs
  // ==============================================================================

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

  // UPDATED: Simplified Agent Config (Task 6)
  async updateAgentConfig(agentId, terminateWaitMinutes) {
    return this.request(`/api/client/agents/${agentId}/config`, {
      method: 'POST',
      body: JSON.stringify({ terminate_wait_minutes: terminateWaitMinutes }),
    });
  }

  // ==============================================================================
  // INSTANCE APIs
  // ==============================================================================

  async getInstancePricing(instanceId) {
    return this.request(`/api/client/instances/${instanceId}/pricing`);
  }

  async getInstanceMetrics(instanceId) {
    return this.request(`/api/client/instances/${instanceId}/metrics`);
  }

  // NEW: Get Available Options for Instance (Task 5)
  async getInstanceAvailableOptions(instanceId) {
    return this.request(`/api/client/instances/${instanceId}/available-options`);
  }

  // UPDATED: Force Switch with Pool/Type support (Task 5)
  async forceSwitch(instanceId, body) {
    return this.request(`/api/client/instances/${instanceId}/force-switch`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ==============================================================================
  // HEALTH CHECK
  // ==============================================================================

  async healthCheck() {
    return this.request('/health');
  }

  // ==============================================================================
  // LEGACY/MOCK METHODS - Kept for compatibility
  // ==============================================================================

  async globalSearch(query) {
    console.warn('globalSearch: Backend endpoint not implemented, returning mock data');
    return { clients: [], instances: [], agents: [] };
  }

  async getPriceHistory(instanceId, days = 7, interval = 'hour') {
    console.warn('getPriceHistory: Backend endpoint not implemented, returning empty array');
    return [];
  }

  async getAgentStatistics(agentId) {
    console.warn('getAgentStatistics: Backend endpoint not implemented, returning mock data');
    return { totalDecisions: 0, successRate: 0 };
  }

  async getInstanceLogs(instanceId, limit = 50) {
    console.warn('getInstanceLogs: Backend endpoint not implemented, returning empty array');
    return [];
  }

  async getAllInstancesGlobal(filters = {}) {
    console.warn('getAllInstancesGlobal: Using workaround - fetching from all clients');
    try {
      const clients = await this.getAllClients();
      const allInstances = [];

      for (const client of clients) {
        try {
          const instances = await this.getInstances(client.id, filters);
          const instancesWithClient = instances.map(inst => ({
            ...inst,
            clientName: client.name,
            clientId: client.id
          }));
          allInstances.push(...instancesWithClient);
        } catch (err) {
          console.error(`Failed to fetch instances for client ${client.id}:`, err);
        }
      }

      return allInstances;
    } catch (error) {
      console.error('Failed to fetch global instances:', error);
      return [];
    }
  }

  async getAllAgentsGlobal() {
    console.warn('getAllAgentsGlobal: Using workaround - fetching from all clients');
    try {
      const clients = await this.getAllClients();
      const allAgents = [];

      for (const client of clients) {
        try {
          const agents = await this.getAgents(client.id);
          const agentsWithClient = agents.map(agent => ({
            ...agent,
            clientName: client.name,
            clientId: client.id
          }));
          allAgents.push(...agentsWithClient);
        } catch (err) {
          console.error(`Failed to fetch agents for client ${client.id}:`, err);
        }
      }

      return allAgents;
    } catch (error) {
      console.error('Failed to fetch global agents:', error);
      return [];
    }
  }

  async exportSavings(clientId) {
    console.warn('exportSavings: Backend endpoint not implemented');
    alert('Export functionality not yet available in backend');
  }

  async exportSwitchHistory(clientId) {
    console.warn('exportSwitchHistory: Backend endpoint not implemented');
    alert('Export functionality not yet available in backend');
  }

  async exportGlobalStats() {
    console.warn('exportGlobalStats: Backend endpoint not implemented');
    alert('Export functionality not yet available in backend');
  }

  async getPoolStatistics() {
    console.warn('getPoolStatistics: Backend endpoint not implemented, returning mock data');
    return { total: 0, active: 0, regions: [] };
  }

  async getAgentHealth() {
    console.warn('getAgentHealth: Backend endpoint not implemented, returning mock data');
    return { online: 0, offline: 0, total: 0 };
  }
}

export default APIClient;
