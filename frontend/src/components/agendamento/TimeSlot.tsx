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
        className="min-h-[2.5rem] px-4 py-2.5 border border-gray-200 rounded-lg text-base text-gray-400 cursor-not-allowed bg-gray-50"
      >
        {time}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`min-h-[2.5rem] px-4 py-2.5 text-base border rounded-lg transition ${
        selected
          ? 'bg-brand text-white border-brand'
          : 'border-gray-300 hover:border-brand hover:bg-brand/10'
      }`}
    >
      {time}
    </button>
  );
}
