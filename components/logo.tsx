import Image from "next/image"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 150, height = 50 }: LogoProps) {
  return <Image src="/logo.png" alt="ProTrack Logo" width={width} height={height} className={className} priority />
}
