export function getRiskMeta(score) {
    if (score < 25) return { label: "Low", color: "text-green-600", badge: "green" };
    if (score < 50) return { label: "Moderate", color: "text-yellow-500", badge: "yellow" };
    if (score < 75) return { label: "High", color: "text-orange-500", badge: "orange" };
    return { label: "Critical", color: "text-red-600", badge: "red" };
  }
  