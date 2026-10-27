import { getHealth } from "@/server/api/health";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(getHealth(), { headers: { "Cache-Control": "no-store" } });
}
