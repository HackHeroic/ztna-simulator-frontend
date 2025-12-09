import AttackSimulator from "./AttackSimulator";

import useDashboardData from "../../hooks/useDashboardData";

import Header from "./Header";
import VpnCard from "./VpnCard";
import VpnRoutingTable from "./VpnRoutingTable";
import SecurityOverview from "./SecurityOverview";
import ResourceTable from "./ResourceTable";
import PolicyDeviceContext from "./PolicyDeviceContext";
import HealthCard from "./HealthCard";
import RiskThresholdsCard from "./RiskThresholdsCard";
import AccessMetricsCard from "./AccessMetricsCard";
import ContinuousAuthHistory from "./ContinuousAuthHistory";
import ResourcesList from "./ResourcesList";
import AdminResourceEditor from "./AdminResourceEditor";
import AdminRiskFactorsEditor from "./AdminRiskFactorsEditor";
import ThreatUsersPanel from "./ThreatUsersPanel";
import AdminUserLogs from "./AdminUserLogs";
import AnomalyLogsPanel from "./AnomalyLogsPanel";
import { getUserFromToken, isAdmin, hasClearance } from "../../utils/userUtils";

export default function Dashboard({ token, onLogout }) {
    const data = useDashboardData(token);
    const user = getUserFromToken(token);
    const isUserAdmin = isAdmin(user);
    const canViewThreats = hasClearance(user, 3);
    const canViewAllLogs = hasClearance(user, 2);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-yellow-50">

            <Header
                lastRefreshed={data.lastRefreshed}
                loading={data.loading}
                refreshAll={data.refreshAll}
                onLogout={onLogout}
            />

            <main className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">

                <VpnCard connected={data.connected} setConnected={() => { }} />

                <VpnRoutingTable />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                        <SecurityOverview {...data} />
                    </div>
                    <ResourceTable resourceResults={data.resourceResults} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PolicyDeviceContext policies={data.policies} />
                    <HealthCard health={data.health} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <RiskThresholdsCard 
                        riskThresholds={data.riskThresholds} 
                        onUpdate={data.refreshAll}
                    />
                    <AccessMetricsCard accessMetrics={data.accessMetrics} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ContinuousAuthHistory history={data.continuousAuthHistory} />
                    <ResourcesList resources={data.resources} />
                </div>

                {canViewThreats && (
                    <ThreatUsersPanel />
                )}

                {canViewAllLogs && (
                    <>
                        <AnomalyLogsPanel />
                        <AdminUserLogs accessMetrics={data.accessMetrics} />
                    </>
                )}

                {isUserAdmin && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AdminResourceEditor 
                            resources={data.resources} 
                            onUpdate={data.refreshAll}
                        />
                        <AdminRiskFactorsEditor 
                            policies={data.policies} 
                            onUpdate={data.refreshAll}
                        />
                    </div>
                )}

                <AttackSimulator refresh={data.refreshAll} />

            </main>
        </div>
    );
}
