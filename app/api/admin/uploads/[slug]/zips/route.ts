import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import {
  getMetadata,
  createZipFile,
  createFolderZipFile,
  isZipFileValid,
  getFolderZipKey,
  isZipObjectValid,
} from "@/lib/r2";
import { isValidSlug } from "@/lib/validation";

// ZIPs worden één keer per transfer gegenereerd en in R2 gecached;
// downloads zijn daarna pure redirects naar R2 (gratis egress).
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function getTopLevelFolders(fileNames: string[]): string[] {
  const folders = new Set<string>();
  for (const name of fileNames) {
    if (name.includes("/")) {
      folders.add(name.split("/")[0]);
    }
  }
  return [...folders];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (metadata.files.length === 0) {
      return NextResponse.json({ error: "No files" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const force: boolean = body?.force === true;

    const results: Record<string, "created" | "cached" | "failed"> = {};

    if (force || !(await isZipFileValid(slug))) {
      try {
        await createZipFile(slug);
        results["_all"] = "created";
      } catch (err) {
        console.error(`[zips] Failed to create main zip for ${slug}:`, err);
        results["_all"] = "failed";
      }
    } else {
      results["_all"] = "cached";
    }

    for (const folder of getTopLevelFolders(metadata.files.map((f) => f.name))) {
      if (!force && (await isZipObjectValid(getFolderZipKey(slug, folder)))) {
        results[folder] = "cached";
        continue;
      }
      try {
        await createFolderZipFile(slug, folder);
        results[folder] = "created";
      } catch (err) {
        console.error(`[zips] Failed to create folder zip ${folder} for ${slug}:`, err);
        results[folder] = "failed";
      }
    }

    const failed = Object.values(results).filter((r) => r === "failed").length;
    return NextResponse.json({ success: failed === 0, results });
  } catch (error) {
    console.error("Error generating zips:", error);
    return NextResponse.json({ error: "Failed to generate zips" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const status: Record<string, boolean> = {
      _all: await isZipFileValid(slug),
    };
    for (const folder of getTopLevelFolders(metadata.files.map((f) => f.name))) {
      status[folder] = await isZipObjectValid(getFolderZipKey(slug, folder));
    }

    return NextResponse.json({ status });
  } catch (error) {
    console.error("Error checking zips:", error);
    return NextResponse.json({ error: "Failed to check zips" }, { status: 500 });
  }
}
