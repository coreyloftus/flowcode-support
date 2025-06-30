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

    // Step 1: Fetch existing contacts from HubSpot
    logs.push("📋 Fetching existing contacts from HubSpot...");
    const contactsResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=email,firstname,lastname",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    let existingContacts = [];
    if (contactsResponse.ok) {
      const contactsResult = await contactsResponse.json();
      existingContacts = contactsResult.results || [];
      logs.push(
        `✅ Fetched ${existingContacts.length} existing contacts from HubSpot`
      );
    } else {
      logs.push(`❌ Failed to fetch contacts: ${contactsResponse.status}`);
      return NextResponse.json(
        {
          error: "Failed to fetch existing contacts from HubSpot",
          logs,
        },
        { status: 500 }
      );
    }

    if (existingContacts.length === 0) {
      logs.push("❌ No existing contacts found in HubSpot");
      return NextResponse.json(
        {
          error:
            "No existing contacts found in HubSpot. Please create some contacts first.",
          logs,
        },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];
    const associations = [];

    for (const ticket of tickets) {
      try {
        // Pick a random contact from existing contacts
        const randomContact =
          existingContacts[Math.floor(Math.random() * existingContacts.length)];

        logs.push(
          `📤 Sending ticket: ${ticket.subject} (${ticket.hs_ticket_priority} priority) - Assigned to: ${randomContact.properties?.firstname} ${randomContact.properties?.lastname} (${randomContact.properties?.email})`
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
                hs_ticket_source: ticket.hs_ticket_source,
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

          // Create association with the selected contact
          associations.push({
            ticketId: result.id,
            contactId: randomContact.id,
          });
          logs.push(
            `🔗 Queued association: Ticket ${result.id} → Contact ${randomContact.id}`
          );
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

    // Create associations if any were queued
    if (associations.length > 0) {
      logs.push(
        `🔗 Creating ${associations.length} ticket-contact associations...`
      );
      logs.push(
        `⏳ Waiting 5 seconds for HubSpot to process ticket records before creating associations...`
      );

      // Wait 5 seconds for HubSpot to process the ticket records
      await new Promise((resolve) => setTimeout(resolve, 5000));

      logs.push(`✅ Delay complete, proceeding with association creation...`);

      let associationSuccess = 0;
      let associationErrors = 0;

      for (const association of associations) {
        try {
          logs.push(
            `🔗 Creating association: Ticket ${association.ticketId} → Contact ${association.contactId}`
          );

          const assocResponse = await fetch(
            `https://api.hubapi.com/crm/v4/objects/ticket/${association.ticketId}/associations/contact/${association.contactId}/`,
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
                    associationTypeId: 15, // 15 = Ticket to Contact association
                  },
                ],
              }),
            }
          );

          if (assocResponse.ok) {
            logs.push(
              `✅ Association created successfully: Ticket ${association.ticketId} → Contact ${association.contactId}`
            );
            associationSuccess++;
          } else {
            const errorText = await assocResponse.text();
            logs.push(
              `❌ Failed to create association Ticket ${association.ticketId} → Contact ${association.contactId}: Status ${assocResponse.status} - ${errorText}`
            );
            associationErrors++;
          }
        } catch (error) {
          logs.push(
            `💥 Exception creating association: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          associationErrors++;
        }
      }

      logs.push(
        `📊 Association summary: ${associationSuccess} successful, ${associationErrors} failed`
      );
    }

    logs.push(
      `📊 Ticket processing complete: ${results.length} successful, ${errors.length} failed, ${associations.length} associations attempted`
    );

    return NextResponse.json({
      success: true,
      results,
      errors,
      associations,
      logs,
      summary: {
        total: tickets.length,
        successful: results.length,
        failed: errors.length,
        associationsAttempted: associations.length,
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
