import Image from "next/image";

export function Logo({ className = "h-14 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="EyePlus — The power of Eye"
      width={716}
      height={349}
      priority
      className={className}
    />
  );
}

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="EyePlus"
      width={256}
      height={256}
      className={className}
    />
  );
}
