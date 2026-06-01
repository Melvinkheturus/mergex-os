import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist in MergeX Sales OS.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0B0B0F]">
      {/* ── Full-page 404 image ── */}
      <div className="absolute inset-0 z-0">
        {/* Desktop */}
        <Image
          src="/404/404.png"
          alt="404"
          fill
          className="object-cover hidden sm:block"
          priority
          quality={95}
        />
        {/* Mobile */}
        <Image
          src="/404/404_mobile.png"
          alt="404"
          fill
          className="object-cover sm:hidden"
          priority
          quality={95}
        />
      </div>

      {/* ── Content overlay ── */}
      <div className="relative z-10 flex flex-col items-center justify-end min-h-screen px-4 text-center pb-24 sm:pb-32">
        <p className="text-lg sm:text-xl text-white/90 font-medium mb-8 drop-shadow-md">
          We&apos;re sorry. We seem to be lost beyond the known internet.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-8 text-sm font-medium text-white/60">
          <Link
            href="/dashboard"
            className="hover:text-white transition-colors duration-200"
          >
            Return Home
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors duration-200"
          >
            Explore Mergex
          </Link>
        </div>
      </div>
    </div>
  );
}
