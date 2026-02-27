interface TimeSlotProps {
  time: string;
  available: boolean;
  selected?: boolean;
  onClick: () => void;
}

export default function TimeSlot({ time, available, selected, onClick }: TimeSlotProps) {
  if (!available) {
    return (
      <button
        disabled
        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed bg-gray-50"
      >
        {time}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 border rounded-lg transition ${
        selected
          ? 'bg-brand text-white border-brand'
          : 'border-gray-300 hover:border-brand hover:bg-brand/10'
      }`}
    >
      {time}
    </button>
  );
}
