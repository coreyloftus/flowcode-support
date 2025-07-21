import { NextRequest, NextResponse } from "next/server";
import { salesforceAuth } from "../../../../lib/salesforce-auth";

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { opportunities } = await request.json();

    if (!opportunities || !Array.isArray(opportunities)) {
      logs.push("❌ Opportunities array is required");
      return NextResponse.json(
        { error: "Opportunities array is required", logs },
        { status: 400 }
      );
    }

    logs.push(
      `🚀 Starting to process ${opportunities.length} Salesforce opportunities...`
    );

    // Get authenticated instance URL
    const instanceUrl = await salesforceAuth.getInstanceUrl();
    logs.push(`🏢 Target Salesforce instance: ${instanceUrl}`);

    // First, fetch existing accounts to associate opportunities with
    logs.push("📋 Fetching existing accounts from Salesforce...");
    const accountsResponse = await salesforceAuth.makeAuthenticatedRequest(
      "/services/data/v58.0/sobjects/Account?fields=Id,Name&limit=100"
    );

    let existingAccounts = [];
    if (accountsResponse.ok) {
      const accountsResult = await accountsResponse.json();
      existingAccounts = accountsResult.records || [];
      logs.push(
        `✅ Fetched ${existingAccounts.length} existing accounts from Salesforce`
      );
    } else {
      logs.push(`❌ Failed to fetch accounts: ${accountsResponse.status}`);
      return NextResponse.json(
        {
          error: "Failed to fetch existing accounts from Salesforce",
          logs,
        },
        { status: 500 }
      );
    }

    if (existingAccounts.length === 0) {
      logs.push("❌ No existing accounts found in Salesforce");
      return NextResponse.json(
        {
          error:
            "No existing accounts found in Salesforce. Please create some accounts first.",
          logs,
        },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const opportunity of opportunities) {
      try {
        // Pick a random account from existing accounts
        const randomAccount =
          existingAccounts[Math.floor(Math.random() * existingAccounts.length)];

        logs.push(
          `📤 Creating Salesforce opportunity: ${opportunity.Name} ($${
            opportunity.Amount || "TBD"
          }) - Account: ${randomAccount.Name}`
        );

        // Create opportunity using Salesforce REST API
        const response = await salesforceAuth.makeAuthenticatedRequest(
          "/services/data/v58.0/sobjects/Opportunity/",
          {
            method: "POST",
            body: JSON.stringify({
              Name: opportunity.Name,
              AccountId: randomAccount.Id,
              StageName: opportunity.StageName || "Prospecting",
              CloseDate:
                opportunity.CloseDate ||
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0], // 30 days from now
              Amount: opportunity.Amount,
              Probability: opportunity.Probability,
              Type: opportunity.Type,
              LeadSource: opportunity.LeadSource || "Web",
              Description: opportunity.Description,
              NextStep: opportunity.NextStep,
              ForecastCategoryName:
                opportunity.ForecastCategoryName || "Pipeline",
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          logs.push(
            `✅ Opportunity created successfully: ${opportunity.Name} -> Salesforce ID: ${result.id} (Account: ${randomAccount.Name})`
          );
          results.push({
            id: opportunity.id,
            salesforceId: result.id,
            success: true,
            name: opportunity.Name,
            accountId: randomAccount.Id,
            accountName: randomAccount.Name,
          });
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create opportunity ${opportunity.Name}: Status ${response.status} - ${errorText}`
          );
          errors.push({
            id: opportunity.id,
            error: errorText,
            success: false,
            name: opportunity.Name,
          });
        }
      } catch (error) {
        logs.push(
          `💥 Exception creating opportunity ${opportunity.Name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        errors.push({
          id: opportunity.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
          name: opportunity.Name,
        });
      }
    }

    logs.push(
      `📊 Opportunity processing complete: ${results.length} successful, ${errors.length} failed`
    );

    return NextResponse.json({
      success: true,
      results,
      errors,
      logs,
      summary: {
        total: opportunities.length,
        successful: results.length,
        failed: errors.length,
        accountsAvailable: existingAccounts.length,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in Salesforce opportunities API route: ${
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
