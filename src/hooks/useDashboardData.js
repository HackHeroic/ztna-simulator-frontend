import { useState, useEffect, useCallback } from "react";
import {
  evaluateResource,
  fetchLocation,       // returns { ip, location, device }
  fetchRiskData,
  fetchAnomalies,
  fetchPolicies,
  fetchSessionStatus,
  fetchHealth,
  fetchRiskThresholds,
  fetchAccessMetrics,
  fetchContinuousAuthHistory,
  fetchResources,
  continuousAuth,
} from "../api/policyApi";
import { getUserFromToken } from "../utils/userUtils";

export default function useDashboardData(token) {
  const [state, setState] = useState({
    connected: false,

    // Risk
    riskScore: 0,
    riskFactors: [],

    // Client metadata
    ip: "--",
    location: {},
    device: {},              // ⭐ NEW — device info stored here

    // Anomalies
    anomalyCount: 0,
    recentAnomalyCount: 0,
    anomalyDetails: [],
    anomalyRiskLevel: "low",

    // System
    sessionStatus: null,
    policies: null,
    health: null,
    resourceResults: {},
    riskThresholds: null,
    accessMetrics: null,
    continuousAuthHistory: null,
    resources: null,

    lastRefreshed: null,
    loading: false,

    // Test-risk simulator
    lastTestRisk: null,
    lastTestRiskFactors: [],
    lastTestLocation: {},
    lastTestDevice: {},      // ⭐ NEW — includes device during attack tests
    lastTestTime: null,
  });

  const resources = ["database-prod", "admin-panel", "file-server", "vpn-gateway"];

  /* -------------------------------------------------------------
     🔥 AttackSimulator pushes test-risk results into dashboard
  -------------------------------------------------------------- */
  const updateTestRisk = (riskObj) => {
    setState((prev) => ({
      ...prev,
      lastTestRisk: riskObj.risk_score ?? riskObj.test_risk_score ?? 0,
      lastTestRiskFactors: riskObj.risk_factors || [],
      lastTestLocation: riskObj.context?.location || {},
      lastTestDevice: riskObj.context?.device || {},  // ⭐ pulled from context
      lastTestTime: new Date().toISOString(),
    }));
  };

  /* -------------------------------------------------------------
     🔄 Dashboard Auto Refresh (every 20 sec)
  -------------------------------------------------------------- */
  const refreshAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      // 1. Get client info first (ip + location + device)
      const client = await fetchLocation();
      console.log("client", client);

      // 2. Grab everything in parallel
      const [
        risk,
        anomalies,
        policies,
        health,
        session,
        riskThresholds,
        accessMetrics,
        continuousAuthHistory,
        resourcesList,
        ...resourceResponses
      ] = await Promise.all([
        fetchRiskData(client),
        fetchAnomalies(),
        fetchPolicies(),
        fetchHealth(),
        fetchSessionStatus(),
        fetchRiskThresholds(),
        fetchAccessMetrics(),
        fetchContinuousAuthHistory(getUserFromToken(token)?.email),
        fetchResources(),
        ...resources.map((r) => evaluateResource(r, client)),
      ]);

      // Map resource responses
      const resourceResults = {};
      resources.forEach((r, index) => {
        resourceResults[r] = resourceResponses[index];
      });

      // Update main dashboard state
      setState((prev) => ({
        ...prev,

        // Risk
        riskScore: risk.risk_score,
        riskFactors: risk.risk_factors,

        // Client
        ip: client.ip,
        location: client.location,
        device: client.device,    // ⭐ NEW

        // Anomaly data
        anomalyCount: anomalies.anomalies,
        recentAnomalyCount: anomalies.recent_anomalies,
        anomalyDetails: anomalies.details || [],
        anomalyRiskLevel: anomalies.risk_level,

        // System
        sessionStatus: session,
        policies,
        health,
        resourceResults,
        riskThresholds,
        accessMetrics,
        continuousAuthHistory,
        resources: resourcesList,

        lastRefreshed: new Date().toLocaleTimeString(),
        loading: false,
      }));
    } catch (err) {
      console.error("Dashboard refresh failed:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [token]);

  /* -------------------------------------------------------------
     ⏱️ Auto Refresh Every 20 Seconds
  -------------------------------------------------------------- */
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 20000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  /* -------------------------------------------------------------
     🔐 Periodic Continuous Auth Check (every 2 minutes)
     This generates continuous auth logs for monitoring
  -------------------------------------------------------------- */
  useEffect(() => {
    const performContinuousAuth = async () => {
      try {
        const client = await fetchLocation();
        await continuousAuth(client.device, client.location, client.ip);
      } catch (err) {
        console.error("Continuous auth check failed:", err);
      }
    };

    // Perform immediately, then every 2 minutes
    performContinuousAuth();
    const continuousAuthInterval = setInterval(performContinuousAuth, 120000);
    return () => clearInterval(continuousAuthInterval);
  }, []);

  /* -------------------------------------------------------------
     Return Hook API
  -------------------------------------------------------------- */
  return {
    ...state,
    refreshAll,
    updateTestRisk,
  };
}
