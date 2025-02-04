/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['replicate.delivery'], // Allow images from replicate.delivery
  },
};

export default nextConfig;
