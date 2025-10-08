interface FieldLabelProps {
  htmlFor: string;
  label: string;
  isMandatory?: boolean;
}

export function FieldLabel(props: FieldLabelProps) {
  return (
    <label htmlFor={props.htmlFor} className="block text-sm font-medium text-gray-700 mb-2">
      {props.label}
      {props.isMandatory && <span className="text-red-500">*</span>}
    </label>
  );
}