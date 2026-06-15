/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "segobasman-production.up.railway.app" },
    ],
  },
};

export default nextConfig;
