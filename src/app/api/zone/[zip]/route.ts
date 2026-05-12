import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86400; // cache for a day

/**
 * Look up a US ZIP code's USDA Plant Hardiness Zone using the public
 * phzmapi.org endpoint (Climate-data-driven mapping from ZIP -> zone).
 * Falls back gracefully if the upstream is unavailable.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ zip: string }> },
) {
  const { zip } = await params;
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid ZIP code." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://phzmapi.org/${zip}.json`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `ZIP not found (status ${res.status}).` },
        { status: res.status },
      );
    }
    const data = (await res.json()) as { zone?: string; coordinates?: unknown };
    if (!data.zone) {
      return NextResponse.json({ error: "No zone returned." }, { status: 502 });
    }
    // phzmapi returns like "7a" or "10b" — strip the letter for our integer zone.
    const numeric = parseInt(data.zone, 10);
    if (Number.isNaN(numeric)) {
      return NextResponse.json({ error: "Unparseable zone." }, { status: 502 });
    }
    return NextResponse.json({ zip, zone: numeric, label: data.zone });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
