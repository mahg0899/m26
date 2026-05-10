import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera una salida standalone optimizada para Docker
  // Incluye solo los archivos necesarios para ejecutar el servidor
  output: "standalone",
};

export default nextConfig;
