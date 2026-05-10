import type { NextConfig } from "next";

const PB_INTERNAL = process.env.POCKETBASE_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_POCKETBASE_URL ||
  "http://localhost:8090";

const nextConfig: NextConfig = {
  // Genera una salida standalone optimizada para Docker
  // Incluye solo los archivos necesarios para ejecutar el servidor
  output: "standalone",

  /**
   * Proxy de PocketBase: el browser llama a /api/pb/* y Next.js
   * redirige internamente a PocketBase (server-to-server).
   * Esto evita los errores de CORS y Private Network Access.
   */
  async rewrites() {
    return [
      {
        source: "/api/pb/:path*",
        destination: `${PB_INTERNAL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
