/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Allow Supabase Storage public URLs (host filled in once configured).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
