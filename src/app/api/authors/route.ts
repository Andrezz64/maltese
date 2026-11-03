import { NextRequest, NextResponse } from "next/server";
import { resolveAuthor } from "@/lib/authors";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ author: null }, { status: 400 });
  }
  const author = resolveAuthor(name);
  return NextResponse.json({ author });
}
