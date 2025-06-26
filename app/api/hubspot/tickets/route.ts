import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tickets } = await request.json();
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

    if (!tickets || !Array.isArray(tickets)) {
      return NextResponse.json(
        { error: "Tickets array is required" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const ticket of tickets) {
      try {
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
          results.push({ id: ticket.id, hubspotId: result.id, success: true });
        } else {
          const error = await response.text();
          errors.push({ id: ticket.id, error: error, success: false });
        }
      } catch (error) {
        errors.push({
          id: ticket.id,
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
        total: tickets.length,
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
