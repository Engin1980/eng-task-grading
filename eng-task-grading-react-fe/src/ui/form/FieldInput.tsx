interface FieldInputProps {
  id: string;
  type: "text" | "email" | "password" | "number" | "date";
  name?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
}

export function FieldInput(props: FieldInputProps) {
  return (
    <input
      id={props.id}
      type={props.type}
      name={props.name ?? props.id}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      required={props.required}
      autoFocus={props.autoFocus}
      readOnly={props.readOnly}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  );
}