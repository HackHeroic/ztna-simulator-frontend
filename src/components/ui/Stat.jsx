export default function Stat({ icon: Icon, label, value, color }) {
    return (
      <div className="bg-gray-50 border rounded-xl p-4 flex flex-col items-center">
        <Icon size={20} className={color} />
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    );
  }
  