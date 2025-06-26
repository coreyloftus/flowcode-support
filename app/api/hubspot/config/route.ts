import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "HubSpot API key not configured. Please set HUBSPOT_API_KEY environment variable.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    configured: true,
    message: "HubSpot API key is configured",
  });
}
