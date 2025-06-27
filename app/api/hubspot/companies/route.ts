import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { companies } = await request.json();
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

    if (!companies || !Array.isArray(companies)) {
      logs.push("❌ Companies array is required");
      return NextResponse.json(
        {
          error: "Companies array is required",
          logs,
        },
        { status: 400 }
      );
    }

    logs.push(`🚀 Starting to process ${companies.length} companies...`);

    const results = [];
    const errors = [];

    for (const company of companies) {
      try {
        logs.push(`📤 Sending company: ${company.name} (${company.domain})`);

        const response = await fetch(
          "https://api.hubapi.com/crm/v3/objects/companies",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: {
                name: company.name,
                domain: company.domain,
                phone: company.phone,
                address: company.address,
                city: company.city,
                state: company.state,
                zip: company.zip,
                country: company.country,
                website: company.website,
                industry: company.industry,
                description: company.description,
                numberofemployees: company.numberofemployees,
                annualrevenue: company.annualrevenue,
              },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          logs.push(
            `✅ Company created successfully: ${company.name} -> HubSpot ID: ${result.id}`
          );
          results.push({ id: company.id, hubspotId: result.id, success: true });
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create company ${company.name}: Status ${response.status} - ${errorText}`
          );
          errors.push({ id: company.id, error: errorText, success: false });
        }
      } catch (error) {
        logs.push(
          `💥 Exception creating company ${company.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        errors.push({
          id: company.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    logs.push(
      `📊 Company processing complete: ${results.length} successful, ${errors.length} failed`
    );

    return NextResponse.json({
      success: true,
      results,
      errors,
      logs,
      summary: {
        total: companies.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in companies API route: ${
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
