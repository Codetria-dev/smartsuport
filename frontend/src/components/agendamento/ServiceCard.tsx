interface ServiceCardProps {
  title: string;
  description?: string;
  icon?: string;
  onClick: () => void;
}

export default function ServiceCard({ title, description, icon, onClick }: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition text-left w-full"
    >
      {icon && (
        <div className="w-12 h-12 bg-brand rounded-lg flex items-center justify-center text-2xl mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </button>
  );
}
