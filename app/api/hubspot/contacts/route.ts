import { NextRequest, NextResponse } from "next/server";
import { Contact } from "@/lib/faker-data";

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { contacts } = await request.json();
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

    if (!contacts || !Array.isArray(contacts)) {
      logs.push("❌ Contacts array is required");
      return NextResponse.json(
        { error: "Contacts array is required", logs },
        { status: 400 }
      );
    }

    logs.push(`🚀 Starting to process ${contacts.length} contacts...`);

    const results = [];
    const errors = [];

    for (const contact of contacts) {
      try {
        logs.push(
          `📤 Sending contact: ${contact.firstname} ${contact.lastname} (${contact.email})`
        );

        const response = await fetch(
          "https://api.hubapi.com/crm/v3/objects/contacts",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: {
                email: contact.email,
                firstname: contact.firstname,
                lastname: contact.lastname,
                phone: contact.phone,
                company: contact.company,
                jobtitle: contact.jobtitle,
                address: contact.address,
                city: contact.city,
                state: contact.state,
                zip: contact.zip,
                country: contact.country,
                website: contact.website,
                lifecycle_stage: contact.lifecycle_stage,
                hs_lead_status: contact.lead_status,
              },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          logs.push(
            `✅ Contact created successfully: ${contact.firstname} ${contact.lastname} -> HubSpot ID: ${result.id}`
          );
          results.push({ id: contact.id, hubspotId: result.id, success: true });
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create contact ${contact.firstname} ${contact.lastname}: Status ${response.status} - ${errorText}`
          );
          errors.push({ id: contact.id, error: errorText, success: false });
        }
      } catch (error) {
        logs.push(
          `💥 Exception creating contact ${contact.firstname} ${
            contact.lastname
          }: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        errors.push({
          id: contact.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    logs.push(
      `📊 Contact processing complete: ${results.length} successful, ${errors.length} failed`
    );

    return NextResponse.json({
      success: true,
      results,
      errors,
      logs,
      summary: {
        total: contacts.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in contacts API route: ${
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
