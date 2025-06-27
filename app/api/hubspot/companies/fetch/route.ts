import { NextResponse } from "next/server";

export async function GET() {
  const logs: string[] = [];

  try {
    const apiKey = process.env.HUBSPOT_API_KEY;

    if (!apiKey) {
      logs.push("❌ HubSpot API key not configured");
      return NextResponse.json(
        {
          error:
            "HubSpot API key not configured. Please set HUBSPOT_API_KEY environment variable.",
          logs,
        },
        { status: 500 }
      );
    }

    logs.push("🚀 Fetching companies from HubSpot...");

    const companies = [];
    let after = undefined;
    let hasMore = true;
    let pageCount = 0;
    const maxPages = 10; // Limit to prevent infinite loops

    while (hasMore && pageCount < maxPages) {
      try {
        pageCount++;
        logs.push(`📄 Fetching page ${pageCount}...`);

        const url = new URL("https://api.hubapi.com/crm/v3/objects/companies");
        url.searchParams.set("limit", "100");
        if (after) {
          url.searchParams.set("after", after);
        }
        url.searchParams.set("properties", "name,domain,website,industry");

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();

          if (result.results && result.results.length > 0) {
            companies.push(...result.results);
            logs.push(
              `✅ Fetched ${result.results.length} companies from page ${pageCount}`
            );

            // Check if there are more pages
            if (
              result.paging &&
              result.paging.next &&
              result.paging.next.after
            ) {
              after = result.paging.next.after;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to fetch companies: Status ${response.status} - ${errorText}`
          );
          break;
        }
      } catch (error) {
        logs.push(
          `💥 Exception fetching companies: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        break;
      }
    }

    logs.push(
      `📊 Company fetch complete: ${companies.length} companies retrieved`
    );

    return NextResponse.json({
      success: true,
      companies,
      logs,
      summary: {
        total: companies.length,
        pages: pageCount,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in fetch companies API route: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        logs,
      },
      { status: 500 }
    );
  }
}
