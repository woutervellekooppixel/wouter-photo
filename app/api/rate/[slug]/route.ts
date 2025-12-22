import { NextRequest, NextResponse } from "next/server";
import { getMetadata, saveMetadata } from "@/lib/r2";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { fileKey, rated } = await request.json();

    if (!fileKey || typeof rated !== 'boolean') {
      return NextResponse.json(
        { error: "fileKey and rated are required" },
        { status: 400 }
      );
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    const currentRatings = metadata.ratings || {};
    if (rated) {
      currentRatings[fileKey] = 1; // Simple boolean rating
    } else {
      delete currentRatings[fileKey];
    }

    await saveMetadata({
      ...metadata,
      ratings: currentRatings,
    });

    return NextResponse.json({ success: true, ratings: currentRatings });
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ratings: metadata.ratings || {} });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
