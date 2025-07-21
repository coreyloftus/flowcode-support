import { NextRequest, NextResponse } from "next/server";
import { salesforceAuth } from "../../../../lib/salesforce-auth";

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { leads } = await request.json();

    if (!leads || !Array.isArray(leads)) {
      logs.push("❌ Leads array is required");
      return NextResponse.json(
        { error: "Leads array is required", logs },
        { status: 400 }
      );
    }

    logs.push(`🚀 Starting to process ${leads.length} Salesforce leads...`);

    // Get authenticated instance URL
    const instanceUrl = await salesforceAuth.getInstanceUrl();
    logs.push(`🏢 Target Salesforce instance: ${instanceUrl}`);

    const results = [];
    const errors = [];

    for (const lead of leads) {
      try {
        logs.push(
          `📤 Creating Salesforce lead: ${lead.FirstName} ${lead.LastName} (${lead.Email}) - ${lead.Company}`
        );

        // Create lead using Salesforce REST API
        const response = await salesforceAuth.makeAuthenticatedRequest(
          "/services/data/v58.0/sobjects/Lead/",
          {
            method: "POST",
            body: JSON.stringify({
              FirstName: lead.FirstName,
              LastName: lead.LastName,
              Email: lead.Email,
              Phone: lead.Phone,
              Company: lead.Company,
              Title: lead.Title,
              MailingAddress: {
                street: lead.Street,
                city: lead.City,
                state: lead.State,
                postalCode: lead.PostalCode,
                country: lead.Country,
              },
              Website: lead.Website,
              Industry: lead.Industry,
              LeadSource: lead.LeadSource || "Web",
              Status: lead.Status || "Open - Not Contacted",
              Rating: lead.Rating,
              Description: lead.Description,
              NumberOfEmployees: lead.NumberOfEmployees,
              AnnualRevenue: lead.AnnualRevenue,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          logs.push(
            `✅ Lead created successfully: ${lead.FirstName} ${lead.LastName} (${lead.Company}) -> Salesforce ID: ${result.id}`
          );
          results.push({
            id: lead.id,
            salesforceId: result.id,
            success: true,
            email: lead.Email,
            company: lead.Company,
          });
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create lead ${lead.FirstName} ${lead.LastName} (${lead.Company}): Status ${response.status} - ${errorText}`
          );
          errors.push({
            id: lead.id,
            error: errorText,
            success: false,
            email: lead.Email,
            company: lead.Company,
          });
        }
      } catch (error) {
        logs.push(
          `💥 Exception creating lead ${lead.FirstName} ${lead.LastName} (${
            lead.Company
          }): ${error instanceof Error ? error.message : "Unknown error"}`
        );
        errors.push({
          id: lead.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
          email: lead.Email,
          company: lead.Company,
        });
      }
    }

    logs.push(
      `📊 Lead processing complete: ${results.length} successful, ${errors.length} failed`
    );

    return NextResponse.json({
      success: true,
      results,
      errors,
      logs,
      summary: {
        total: leads.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in Salesforce leads API route: ${
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
