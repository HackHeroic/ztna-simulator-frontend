export default function Card({ className = "", children }) {
    return <div className={`bg-white shadow p-6 rounded-2xl ${className}`}>{children}</div>;
  }
  