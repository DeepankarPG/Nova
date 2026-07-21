import type { NextConfig } from "next";

const atlasDocsBase = process.env.ATLAS_DOCS_BASE_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    const base = [
      {
        source: "/platform-withdrawals",
        destination: "/payment-products/international-accounts/platform-withdrawals/amazon",
        permanent: false,
      },
      {
        source: "/payment-products/mca",
        destination: "/payment-products/international-accounts",
        permanent: false,
      },
      {
        source: "/payment-products/mca/:path*",
        destination: "/payment-products/international-accounts",
        permanent: false,
      },
    ] as const;

    if (atlasDocsBase) {
      return [
        ...base,
        { source: "/design", destination: `${atlasDocsBase}/design`, permanent: false },
        { source: "/design/:path*", destination: `${atlasDocsBase}/design/:path*`, permanent: false },
      ];
    }

    return [...base];
  },
};

export default nextConfig;
