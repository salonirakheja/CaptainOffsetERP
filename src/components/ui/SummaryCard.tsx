interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}

export default function SummaryCard({ title, value, icon, color = 'bg-white' }: SummaryCardProps) {
  return (
    <div className={`${color} rounded-xl border border-gray-200 p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
