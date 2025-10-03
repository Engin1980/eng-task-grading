interface AttendanceValueUnsetLabelProps {
  isSelected: boolean;
  onClick?: () => void;
}

export const AttendanceValueUnsetLabel: React.FC<AttendanceValueUnsetLabelProps> = ({ isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex px-8 py-2 text-xs font-semibold rounded-full cursor-pointer hover:!bg-yellow-200 transition-colors"
      style={{
        backgroundColor: 'rgba(200, 200, 200, 0.3)',
        color: 'black',
        border: isSelected ? `3px solid gray` : `none`
      }}
    >
      Neuvedeno
    </button>
  );
};