import Image from "next/image";

export default function UserAvatar({ src, size = 28, className = "" }) {
  if (!src) return null;

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      sizes={`${size}px`}
    />
  );
}
