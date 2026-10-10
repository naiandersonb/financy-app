import type { NextConfig } from "next";
import { AVATAR_HOSTS } from "./src/presentation/features/auth/avatar-hosts";

const nextConfig: NextConfig = {
  images: {
    // Mesma lista que o UserAvatar usa para decidir se mostra a foto.
    remotePatterns: AVATAR_HOSTS.map((hostname) => ({ protocol: "https", hostname })),
  },
};

export default nextConfig;
