import Card from "../ui/Card";
import VpnPanel from "../VpnPanel";

export default function VpnCard({ connected, setConnected }) {
  return (
    <Card>
      <VpnPanel connected={connected} setConnected={setConnected} />
    </Card>
  );
}
