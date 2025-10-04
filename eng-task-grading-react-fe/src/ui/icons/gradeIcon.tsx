import { convertIconSizeToClassName, type IconProps } from "./iconProps";

export function GradeIcon({ size = 6 }: IconProps) {
  const tmp = convertIconSizeToClassName(size);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={tmp} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}
