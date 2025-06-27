import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { associations } = await request.json();
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

    if (!associations || !Array.isArray(associations)) {
      logs.push("❌ Associations array is required");
      return NextResponse.json(
        {
          error: "Associations array is required",
          logs,
        },
        { status: 400 }
      );
    }

    logs.push(
      `🚀 Starting to create ${associations.length} contact-company associations...`
    );

    const results = [];
    const errors = [];

    for (const association of associations) {
      try {
        const { contactId, companyId } = association;

        if (!contactId || !companyId) {
          logs.push(
            `❌ Invalid association data: contactId=${contactId}, companyId=${companyId}`
          );
          errors.push({
            contactId,
            companyId,
            error: "Missing contactId or companyId",
            success: false,
          });
          continue;
        }

        logs.push(
          `🔗 Creating association: Contact ${contactId} → Company ${companyId}`
        );

        const response = await fetch(
          `https://api.hubapi.com/crm/v4/objects/contact/${contactId}/associations/company/${companyId}/`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              types: [
                {
                  associationCategory: "HUBSPOT_DEFINED",
                  associationTypeId: 1, // 1 = Contact to Company association
                },
              ],
            }),
          }
        );

        if (response.ok) {
          logs.push(
            `✅ Association created successfully: Contact ${contactId} → Company ${companyId}`
          );
          results.push({
            contactId,
            companyId,
            success: true,
          });
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create association Contact ${contactId} → Company ${companyId}: Status ${response.status} - ${errorText}`
          );
          errors.push({
            contactId,
            companyId,
            error: errorText,
            success: false,
          });
        }
      } catch (error) {
        logs.push(
          `💥 Exception creating association: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        errors.push({
          contactId: association.contactId,
          companyId: association.companyId,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    logs.push(
      `📊 Association processing complete: ${results.length} successful, ${errors.length} failed`
    );

    return NextResponse.json({
      success: true,
      results,
      errors,
      logs,
      summary: {
        total: associations.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in associations API route: ${
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
