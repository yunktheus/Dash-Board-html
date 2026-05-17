import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow Firebase Auth popup (signInWithPopup) to communicate back
        // with the opener window without COOP blocking window.closed checks.
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
