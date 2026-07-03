import fallback from "@/data/pickup-points-fallback.json";

export type PickupProvider = "OMNIVA" | "LP_EXPRESS";

export type PickupPoint = {
  id: string;
  name: string;
  city: string;
};

const OMNIVA_LOCATIONS_URL = "https://www.omniva.ee/locations.json";
const LP_EXPRESS_TERMINALS_URL = "https://api-manosiuntos.post.lt/api/v2/public/terminals";
const REVALIDATE_SECONDS = 60 * 60 * 24; // refresh the list daily

type OmnivaLocation = {
  ZIP: string;
  NAME: string;
  A0_NAME: string; // country code
  A1_NAME: string; // county / city
  TYPE: string; // 0 = parcel machine
};

async function fetchOmniva(): Promise<PickupPoint[]> {
  const res = await fetch(OMNIVA_LOCATIONS_URL, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Omniva locations request failed: ${res.status}`);
  const data = (await res.json()) as OmnivaLocation[];
  return data
    .filter((l) => l.A0_NAME === "LT" && l.TYPE === "0")
    .map((l) => ({ id: l.ZIP, name: l.NAME, city: l.A1_NAME }));
}

type LpTerminal = {
  id?: string | number;
  terminalId?: string;
  name?: string;
  city?: string;
  address?: { city?: string };
};

async function fetchLpExpress(): Promise<PickupPoint[]> {
  const res = await fetch(LP_EXPRESS_TERMINALS_URL, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`LP Express terminals request failed: ${res.status}`);
  const data = (await res.json()) as LpTerminal[];
  if (!Array.isArray(data)) throw new Error("Unexpected LP Express terminals payload");
  return data.map((t) => ({
    id: String(t.terminalId ?? t.id ?? ""),
    name: t.name ?? "",
    city: t.city ?? t.address?.city ?? "",
  }));
}

/**
 * Returns the pickup point list for a provider. Tries the live public API
 * (cached for a day); falls back to a bundled snapshot when the network is
 * unavailable so checkout keeps working in development and demos.
 */
export async function getPickupPoints(provider: PickupProvider): Promise<PickupPoint[]> {
  try {
    const points = provider === "OMNIVA" ? await fetchOmniva() : await fetchLpExpress();
    if (points.length > 0) return sortPoints(points);
  } catch {
    // fall through to the bundled snapshot
  }
  return sortPoints(fallback[provider] as PickupPoint[]);
}

function sortPoints(points: PickupPoint[]): PickupPoint[] {
  return [...points].sort(
    (a, b) => a.city.localeCompare(b.city, "lt") || a.name.localeCompare(b.name, "lt"),
  );
}
