import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { tickets } = await request.json();
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

    if (!tickets || !Array.isArray(tickets)) {
      logs.push("❌ Tickets array is required");
      return NextResponse.json(
        {
          error: "Tickets array is required",
          logs,
        },
        { status: 400 }
      );
    }

    logs.push(`🚀 Starting to process ${tickets.length} tickets...`);

    const results = [];
    const errors = [];

    for (const ticket of tickets) {
      try {
        logs.push(
          `📤 Sending ticket: ${ticket.subject} (${ticket.hs_ticket_priority} priority)`
        );

        const response = await fetch(
          "https://api.hubapi.com/crm/v3/objects/tickets",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: {
                subject: ticket.subject,
                content: ticket.content,
                hs_ticket_priority: ticket.hs_ticket_priority,
                hs_ticket_category: ticket.hs_ticket_category,
                hs_ticket_owner_id: ticket.hs_ticket_owner_id,
                hs_pipeline: ticket.hs_pipeline,
                hs_pipeline_stage: ticket.hs_pipeline_stage,
                hs_ticket_source: ticket.hs_ticket_source,
                hs_ticket_type: ticket.hs_ticket_type,
              },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          logs.push(
            `✅ Ticket created successfully: ${ticket.subject} -> HubSpot ID: ${result.id}`
          );
          results.push({ id: ticket.id, hubspotId: result.id, success: true });
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create ticket ${ticket.subject}: Status ${response.status} - ${errorText}`
          );
          errors.push({ id: ticket.id, error: errorText, success: false });
        }
      } catch (error) {
        logs.push(
          `💥 Exception creating ticket ${ticket.subject}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        errors.push({
          id: ticket.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    logs.push(
      `📊 Ticket processing complete: ${results.length} successful, ${errors.length} failed`
    );

    return NextResponse.json({
      success: true,
      results,
      errors,
      logs,
      summary: {
        total: tickets.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in tickets API route: ${
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
