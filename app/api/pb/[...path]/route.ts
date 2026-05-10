/**
 * Proxy de PocketBase — /api/pb/[...path]
 *
 * Todas las peticiones del browser a /api/pb/* se reenvían server-to-server
 * hacia PocketBase. Esto evita CORS y Private Network Access porque el browser
 * solo ve el mismo origen (Next.js), y Next.js hace la llamada internamente.
 *
 * La URL de PocketBase se lee en RUNTIME desde la variable de entorno
 * POCKETBASE_INTERNAL_URL, por eso funciona con Env Vars de Dokploy
 * (a diferencia de next.config.ts rewrites, que se evalúan en build time).
 */

import { type NextRequest, NextResponse } from "next/server";

// Leída en runtime — puede ser una Env Var del contenedor, no un Build Arg.
const PB_BASE =
  process.env.POCKETBASE_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_POCKETBASE_URL ||
  "http://localhost:8090";

// Cabeceras que NO debemos reenviar al destino (hop-by-hop)
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host", // el host lo aporta la URL de destino
]);

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetUrl = new URL(`${PB_BASE}/api/${path.join("/")}`);

  // Pasar query params tal cual
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  // Filtrar cabeceras hop-by-hop
  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  // Reenviar la petición a PocketBase
  const pbRes = await fetch(targetUrl.toString(), {
    method: req.method,
    headers: forwardHeaders,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    // Necesario para poder pasar el ReadableStream del body
    duplex: "half",
  } as RequestInit);

  // Construir respuesta filtrando cabeceras hop-by-hop
  const resHeaders = new Headers();
  pbRes.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      resHeaders.set(key, value);
    }
  });

  return new NextResponse(pbRes.body, {
    status: pbRes.status,
    statusText: pbRes.statusText,
    headers: resHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
