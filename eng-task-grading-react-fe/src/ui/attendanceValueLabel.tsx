import type { AttendanceValueDto } from "../model/attendance-dto";

interface AttendanceValueLabelProps {
  attendanceValue: AttendanceValueDto;
  isSelected: boolean;
  onClick?: () => void;
}

export const AttendanceValueLabel: React.FC<AttendanceValueLabelProps> = ({ attendanceValue, isSelected, onClick }) => {

  // Výpočet barvy na základě hodnoty (0-1, červená-zelená)
  const normalizedValue = Math.max(0, Math.min(1, attendanceValue.weight)); // Omez na 0-1

  // Světlejší barvy - mix s bílou (170-255 místo 0-255)
  const red = Math.round(200 + 55 * (1 - normalizedValue));
  const redBorder = Math.round(255 * (1 - normalizedValue));
  const green = Math.round(200 + 55 * normalizedValue);
  const greenBorder = Math.round(255 * (normalizedValue));

  // RGB barvy
  const backgroundColor = `rgb(${red}, ${green}, 200)`;
  const borderColor = `rgb(${redBorder}, ${greenBorder}, 0)`;

  // Výpočet barvy textu pro lepší čitelnost
  const textColor = 'rgb(51, 51, 51)';

  return (
    <button
      type="button"
      key={attendanceValue.id}
      onClick={() => onClick?.()}
      className="inline-flex px-8 py-2 text-xs font-semibold rounded-full cursor-pointer hover:!bg-yellow-200 transition-colors"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        border: isSelected ? `3px solid ${borderColor}` : `none`
      }}
    >
      {attendanceValue.title}
    </button>
  );
};