import AttackSimulator from "./AttackSimulator";

import useDashboardData from "../../hooks/useDashboardData";

import Header from "./Header";
import VpnCard from "./VpnCard";
import SecurityOverview from "./SecurityOverview";
import ResourceTable from "./ResourceTable";
import PolicyDeviceContext from "./PolicyDeviceContext";
import HealthCard from "./HealthCard";

export default function Dashboard({ token, onLogout }) {
    const data = useDashboardData(token);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-yellow-50">

            <Header
                lastRefreshed={data.lastRefreshed}
                loading={data.loading}
                refreshAll={data.refreshAll}
                onLogout={onLogout}
            />

            <main className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">

                <AttackSimulator refresh={data.refreshAll} />

                <VpnCard connected={data.connected} setConnected={() => { }} />

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

            </main>
        </div>
    );
}
