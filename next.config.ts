import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    ];
  },
};

export default nextConfig;
