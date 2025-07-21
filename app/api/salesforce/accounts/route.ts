import { NextRequest, NextResponse } from "next/server";
import { salesforceAuth } from "../../../../lib/salesforce-auth";

const formatState = (state: string) => {
  const stateMap: Record<string, string> = {
    California: "CA",
    "New York": "NY",
    Texas: "TX",
    // Add more as needed based on your org's config
  };

  return stateMap[state] || state;
};

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { accounts } = await request.json();

    if (!accounts || !Array.isArray(accounts)) {
      logs.push("❌ Accounts array is required");
      return NextResponse.json(
        { error: "Accounts array is required", logs },
        { status: 400 }
      );
    }

    logs.push(
      `🚀 Starting to process ${accounts.length} Salesforce accounts...`
    );

    // Get authenticated instance URL
    const instanceUrl = await salesforceAuth.getInstanceUrl();
    logs.push(`🏢 Target Salesforce instance: ${instanceUrl}`);

    const results = [];
    const errors = [];

    for (const account of accounts) {
      try {
        logs.push(
          `📤 Creating Salesforce account: ${account.Name} (${
            account.Website || "No website"
          })`
        );

        // Create account using Salesforce REST API
        const response = await salesforceAuth.makeAuthenticatedRequest(
          "/services/data/v58.0/sobjects/Account/",
          {
            method: "POST",
            body: JSON.stringify({
              Name: account.Name,
              Type: account.Type || "Customer",
              Phone: account.Phone,
              Website: account.Website,
              Industry: account.Industry,
              BillingStreet: account.BillingStreet,
              BillingCity: account.BillingCity,
              BillingState: account.BillingState
                ? formatState(account.BillingState)
                : account.BillingState,
              BillingPostalCode: account.BillingPostalCode,
              BillingCountry: account.BillingCountry,

              ShippingStreet: account.ShippingStreet,
              ShippingCity: account.ShippingCity,
              ShippingState: account.ShippingState
                ? formatState(account.ShippingState)
                : account.ShippingState,
              ShippingPostalCode: account.ShippingPostalCode,
              ShippingCountry: account.ShippingCountry,
              Description: account.Description,
              NumberOfEmployees: account.NumberOfEmployees,
              AnnualRevenue: account.AnnualRevenue,
              Ownership: account.Ownership,
              Rating: account.Rating,
              Sic: account.Sic,
              TickerSymbol: account.TickerSymbol,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          logs.push(
            `✅ Account created successfully: ${account.Name} -> Salesforce ID: ${result.id}`
          );
          results.push({
            id: account.id,
            salesforceId: result.id,
            success: true,
            name: account.Name,
          });
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create account ${account.Name}: Status ${response.status} - ${errorText}`
          );
          errors.push({
            id: account.id,
            error: errorText,
            success: false,
            name: account.Name,
          });
        }
      } catch (error) {
        logs.push(
          `💥 Exception creating account ${account.Name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        errors.push({
          id: account.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
          name: account.Name,
        });
      }
    }

    logs.push(
      `📊 Account processing complete: ${results.length} successful, ${errors.length} failed`
    );

    return NextResponse.json({
      success: true,
      results,
      errors,
      logs,
      summary: {
        total: accounts.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in Salesforce accounts API route: ${
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
