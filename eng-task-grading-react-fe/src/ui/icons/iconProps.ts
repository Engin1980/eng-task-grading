export interface IconProps {
  size?: "s"|"m"|"l"|number;
}

export function convertIconSizeToClassName(size: IconProps["size"]) {
  let tmp;
  if (size === "s") tmp = `size-4`;
  else if (size === "m") tmp = `size-6`;
  else if (size === "l") tmp = `size-8`;
  else tmp = `size-${size}`;
  return tmp;
}