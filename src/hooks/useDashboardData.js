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

    /* 🔥 NEW — Store latest test-risk result */
    lastTestRisk: null,
    lastTestRiskFactors: [],
    lastTestLocation: {},
    lastTestTime: null,
  });

  const resources = ["database-prod", "admin-panel", "file-server", "vpn-gateway"];

  /* -------------------------------------------------------------
     🔥 Allow AttackSimulator to push the latest test-risk
  -------------------------------------------------------------- */
  const updateTestRisk = (riskObj) => {
    setState((prev) => ({
      ...prev,
      lastTestRisk: riskObj.risk_score ?? riskObj.test_risk_score ?? 0,
      lastTestRiskFactors: riskObj.risk_factors || [],
      lastTestLocation: riskObj.context?.location || {},
      lastTestTime: new Date().toISOString(),
    }));
  };

  /* -------------------------------------------------------------
     🔄 Dashboard Refresh (every 20 sec)
  -------------------------------------------------------------- */
  const refreshAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      // 1) get IP + location first
      const client = await fetchLocation();

      // 2) fetch everything fast in parallel
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

      // Build resource result map
      const resourceResults = {};
      resources.forEach((r, index) => {
        resourceResults[r] = resourceResponses[index];
      });

      // Update main state
      setState((prev) => ({
        ...prev,

        riskScore: risk.risk_score,
        riskFactors: risk.risk_factors,

        ip: client.ip,
        location: client.location,

        anomalyCount: anomalies.anomalies,
        recentAnomalyCount: anomalies.recent_anomalies,
        anomalyDetails: anomalies.details || [],
        anomalyRiskLevel: anomalies.risk_level,

        sessionStatus: session,
        policies,
        health,
        resourceResults,

        lastRefreshed: new Date().toLocaleTimeString(),
        loading: false,

        // DO NOT TOUCH lastTestRisk (persistent until next test)
      }));
    } catch (err) {
      console.error("Dashboard refresh failed:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [token]);

  /* auto-refresh every 20 seconds */
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 20000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  return { 
    ...state,
    refreshAll,
    updateTestRisk,    // 🔥 AttackSimulator can call this
  };
}
