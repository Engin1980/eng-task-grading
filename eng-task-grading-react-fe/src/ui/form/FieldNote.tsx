interface FieldNoteProps {
children?: React.ReactNode;
}

export function FieldNote({ children }: FieldNoteProps) {
  if (!children) return null;
  return <p className="text-gray-500 text-xs mt-1">{children}</p>;
}