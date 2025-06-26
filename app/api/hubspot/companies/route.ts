import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { companies } = await request.json();
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

    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json(
        { error: "Companies array is required" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const company of companies) {
      try {
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
          results.push({ id: company.id, hubspotId: result.id, success: true });
        } else {
          const error = await response.text();
          errors.push({ id: company.id, error: error, success: false });
        }
      } catch (error) {
        errors.push({
          id: company.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: companies.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
