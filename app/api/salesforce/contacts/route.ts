import { NextRequest, NextResponse } from "next/server";
import { salesforceAuth } from "../../../../lib/salesforce-auth";

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { contacts } = await request.json();

    if (!contacts || !Array.isArray(contacts)) {
      logs.push("❌ Contacts array is required");
      return NextResponse.json(
        { error: "Contacts array is required", logs },
        { status: 400 }
      );
    }

    logs.push(
      `🚀 Starting to process ${contacts.length} Salesforce contacts...`
    );

    // Get authenticated instance URL
    const instanceUrl = await salesforceAuth.getInstanceUrl();
    logs.push(`🏢 Target Salesforce instance: ${instanceUrl}`);

    const results = [];
    const errors = [];

    for (const contact of contacts) {
      try {
        logs.push(
          `📤 Creating Salesforce contact: ${contact.FirstName} ${contact.LastName} (${contact.Email})`
        );

        // Create contact using Salesforce REST API
        const response = await salesforceAuth.makeAuthenticatedRequest(
          "/services/data/v58.0/sobjects/Contact/",
          {
            method: "POST",
            body: JSON.stringify({
              FirstName: contact.FirstName,
              LastName: contact.LastName,
              Email: contact.Email,
              Phone: contact.Phone,
              Title: contact.Title,
              Department: contact.Department,
              MailingAddress: {
                street: contact.MailingStreet,
                city: contact.MailingCity,
                state: contact.MailingState,
                postalCode: contact.MailingPostalCode,
                country: contact.MailingCountry,
              },
              Description: contact.Description,
              LeadSource: contact.LeadSource || "Web",
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          logs.push(
            `✅ Contact created successfully: ${contact.FirstName} ${contact.LastName} -> Salesforce ID: ${result.id}`
          );
          results.push({
            id: contact.id,
            salesforceId: result.id,
            success: true,
            email: contact.Email,
          });
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create contact ${contact.FirstName} ${contact.LastName}: Status ${response.status} - ${errorText}`
          );
          errors.push({
            id: contact.id,
            error: errorText,
            success: false,
            email: contact.Email,
          });
        }
      } catch (error) {
        logs.push(
          `💥 Exception creating contact ${contact.FirstName} ${
            contact.LastName
          }: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        errors.push({
          id: contact.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
          email: contact.Email,
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
      `💥 General error in Salesforce contacts API route: ${
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
