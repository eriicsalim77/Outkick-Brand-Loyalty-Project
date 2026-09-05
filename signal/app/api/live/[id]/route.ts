import { NextResponse } from "next/server";
import { itemStore } from "@/lib/itemStore";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const item = itemStore.get(params.id);
  if (!item) {
    return NextResponse.json(
      { error: "not_found", hint: "Open the dashboard first to seed the item store." },
      { status: 404, headers: { "cache-control": "no-store" } },
    );
  }
  return NextResponse.json({ item }, { headers: { "cache-control": "no-store" } });
}
