import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: `OAuth authorization failed: ${error}`,
        error_description: url.searchParams.get("error_description"),
      },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        error: "No authorization code received",
      },
      { status: 400 }
    );
  }

  // For JWT Bearer Flow setup, we don't actually need to exchange the code
  // The authorization itself is sufficient to establish trust between the user and Connected App
  return NextResponse.json({
    success: true,
    message:
      "✅ Connected App has been authorized! Your JWT Bearer Flow should now work.",
    authorizationCode: code,
    note: "You can now use the JWT authentication for server-to-server operations. This authorization only needed to be done once.",
    nextSteps: [
      "1. Test your JWT Bearer Flow by visiting /api/salesforce/config",
      "2. If it works, you can remove this callback endpoint (it's only needed once)",
      "3. Your server-to-server ETL operations should now work automatically",
    ],
  });
}
