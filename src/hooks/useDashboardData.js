import { useState, useEffect, useCallback } from "react";
import {
  evaluateResource,
  fetchLocation,
  fetchRiskData,
  fetchAnomalies,
  fetchPolicies,
  fetchSessionStatus,
  fetchHealth,
} from "../api/policyApi";

export default function useDashboardData(token) {
  const [state, setState] = useState({
    connected: false,
    riskScore: 0,
    riskFactors: [],
    ip: "--",
    location: {},
    anomalyCount: 0,
    recentAnomalyCount: 0,
    anomalyDetails: [],
    anomalyRiskLevel: "low",
    sessionStatus: null,
    policies: null,
    health: null,
    resourceResults: {},
    lastRefreshed: null,
    loading: false,
  });

  const resources = ["database-prod", "admin-panel", "file-server", "vpn-gateway"];

  const refreshAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      // 1️⃣ Fetch location first
      const client = await fetchLocation();

      // 2️⃣ Fetch all data in parallel (fast!)
      const [
        risk,
        anomalies,
        policies,
        health,
        session,
        ...resourceResponses
      ] = await Promise.all([
        fetchRiskData(client),
        fetchAnomalies(),
        fetchPolicies(),
        fetchHealth(),
        fetchSessionStatus(),
        ...resources.map((r) => evaluateResource(r, client)),
      ]);

      // Build resource results back
      const resourceResults = {};
      resources.forEach((r, index) => {
        resourceResults[r] = resourceResponses[index];
      });

      // 3️⃣ Final state update
      setState((prev) => ({
        ...prev,
        riskScore: risk.risk_score,
        riskFactors: risk.risk_factors,
        ip: client.ip,
        location: client.location,
        anomalyCount: anomalies.anomalies,
        recentAnomalyCount: anomalies.recent_anomalies,
        anomalyDetails: anomalies.details,
        anomalyRiskLevel: anomalies.risk_level,
        sessionStatus: session,
        policies,
        health,
        resourceResults,
        lastRefreshed: new Date().toLocaleTimeString(),
        loading: false,
      }));
    } catch (err) {
      console.error("Dashboard refresh failed:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [token]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 20000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  return { ...state, refreshAll };
}
