import { NextResponse } from "next/server";

// Helper function to extract domain from email
function extractDomainFromEmail(email: string): string {
  if (!email) return "";
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
}

interface TicketMatch {
  contactId: string;
  ticketId: string;
  contactEmail: string;
  ticketSubject: string;
  priority: string;
  category: string;
}

interface Ticket {
  id: string;
  properties?: {
    subject?: string;
    hs_ticket_priority?: string;
    hs_ticket_category?: string;
  };
}

export async function POST() {
  const logs: string[] = [];

  try {
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

    logs.push("🚀 Starting domain-based contact-ticket association process...");

    // Step 1: Fetch the latest 100 tickets from HubSpot
    logs.push("📋 Fetching latest 100 tickets from HubSpot...");
    const ticketsResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/tickets?limit=100&properties=subject,content,hs_ticket_priority,hs_ticket_category",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!ticketsResponse.ok) {
      const errorText = await ticketsResponse.text();
      logs.push(
        `❌ Failed to fetch tickets: Status ${ticketsResponse.status} - ${errorText}`
      );
      return NextResponse.json(
        {
          error: "Failed to fetch tickets from HubSpot",
          logs,
        },
        { status: 500 }
      );
    }

    const ticketsResult = await ticketsResponse.json();
    const tickets = ticketsResult.results || [];
    logs.push(`✅ Fetched ${tickets.length} tickets from HubSpot`);

    if (tickets.length === 0) {
      logs.push("❌ No tickets found in HubSpot");
      return NextResponse.json(
        {
          error:
            "No tickets found in HubSpot. Please create some tickets first.",
          logs,
        },
        { status: 400 }
      );
    }

    // Step 2: Fetch the latest 100 contacts from HubSpot
    logs.push("📋 Fetching latest 100 contacts from HubSpot...");
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

    if (!contactsResponse.ok) {
      const errorText = await contactsResponse.text();
      logs.push(
        `❌ Failed to fetch contacts: Status ${contactsResponse.status} - ${errorText}`
      );
      return NextResponse.json(
        {
          error: "Failed to fetch contacts from HubSpot",
          logs,
        },
        { status: 500 }
      );
    }

    const contactsResult = await contactsResponse.json();
    const contacts = contactsResult.results || [];
    logs.push(`✅ Fetched ${contacts.length} contacts from HubSpot`);

    if (contacts.length === 0) {
      logs.push("❌ No contacts found in HubSpot");
      return NextResponse.json(
        {
          error:
            "No contacts found in HubSpot. Please create some contacts first.",
          logs,
        },
        { status: 400 }
      );
    }

    // Step 3: Find domain matches between contacts and tickets
    // For tickets, we'll associate contacts based on priority and category matching
    logs.push(
      "🔍 Searching for contact-ticket associations based on priority and category..."
    );
    const ticketMatches: TicketMatch[] = [];

    for (const contact of contacts) {
      const contactEmail = contact.properties?.email;
      if (!contactEmail) {
        logs.push(`⚠️ Contact ${contact.id} has no email address, skipping`);
        continue;
      }

      const contactDomain = extractDomainFromEmail(contactEmail);
      if (!contactDomain) {
        logs.push(
          `⚠️ Contact ${contact.id} has invalid email domain, skipping`
        );
        continue;
      }

      logs.push(
        `🔍 Checking contact ${contact.id} (${contactEmail}) with domain: ${contactDomain}`
      );

      // Find a suitable ticket for this contact
      // We'll match based on priority and try to distribute contacts across different tickets
      for (const ticket of tickets) {
        const ticketPriority =
          ticket.properties?.hs_ticket_priority || "MEDIUM";
        const ticketCategory =
          ticket.properties?.hs_ticket_category || "general";

        // Simple matching logic: associate contacts with tickets based on priority
        // High priority contacts get high priority tickets, etc.
        const contactPriority =
          contactDomain.includes("exec") ||
          contactDomain.includes("ceo") ||
          contactDomain.includes("president")
            ? "HIGH"
            : contactDomain.includes("manager") ||
              contactDomain.includes("director")
            ? "MEDIUM"
            : "LOW";

        if (contactPriority === ticketPriority) {
          logs.push(
            `✅ Priority match found: Contact ${contact.id} (${contactEmail}) → Ticket ${ticket.id} (${ticket.properties?.subject}) - Priority: ${contactPriority}`
          );
          ticketMatches.push({
            contactId: contact.id,
            ticketId: ticket.id,
            contactEmail,
            ticketSubject: ticket.properties?.subject,
            priority: contactPriority,
            category: ticketCategory,
          });
          break; // Found a match for this contact, move to next contact
        }
      }

      // If no priority match found, assign to any available ticket
      if (!ticketMatches.find((match) => match.contactId === contact.id)) {
        const availableTicket = tickets.find(
          (ticket: Ticket) =>
            !ticketMatches.find((match) => match.ticketId === ticket.id)
        );

        if (availableTicket) {
          logs.push(
            `✅ Fallback match: Contact ${contact.id} (${contactEmail}) → Ticket ${availableTicket.id} (${availableTicket.properties?.subject})`
          );
          ticketMatches.push({
            contactId: contact.id,
            ticketId: availableTicket.id,
            contactEmail,
            ticketSubject: availableTicket.properties?.subject,
            priority: "MEDIUM",
            category:
              availableTicket.properties?.hs_ticket_category || "general",
          });
        }
      }
    }

    logs.push(
      `📊 Found ${ticketMatches.length} contact-ticket matches out of ${contacts.length} contacts`
    );

    if (ticketMatches.length === 0) {
      logs.push("❌ No contact-ticket matches found");
      return NextResponse.json({
        success: true,
        message: "No contact-ticket matches found",
        ticketMatches: [],
        logs,
        summary: {
          totalContacts: contacts.length,
          totalTickets: tickets.length,
          matchesFound: 0,
          associationsCreated: 0,
        },
      });
    }

    // Step 4: Create associations for ticket matches
    logs.push(
      `🔗 Creating contact-ticket associations for ${ticketMatches.length} matches...`
    );
    const results = [];
    const errors = [];

    for (const match of ticketMatches) {
      try {
        const { contactId, ticketId } = match;

        logs.push(
          `🔗 Creating association: Contact ${contactId} → Ticket ${ticketId} (Priority: ${match.priority})`
        );

        const response = await fetch(
          `https://api.hubapi.com/crm/v4/objects/contact/${contactId}/associations/ticket/${ticketId}/`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify([
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 15, // 15 = Contact to Ticket association
              },
            ]),
          }
        );

        if (response.ok) {
          logs.push(
            `✅ Association created successfully: Contact ${contactId} → Ticket ${ticketId}`
          );
          results.push({
            contactId,
            ticketId,
            contactEmail: match.contactEmail,
            ticketSubject: match.ticketSubject,
            priority: match.priority,
            category: match.category,
            success: true,
          });
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create association Contact ${contactId} → Ticket ${ticketId}: Status ${response.status} - ${errorText}`
          );
          errors.push({
            contactId,
            ticketId,
            contactEmail: match.contactEmail,
            ticketSubject: match.ticketSubject,
            priority: match.priority,
            category: match.category,
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
          contactId: match.contactId,
          ticketId: match.ticketId,
          contactEmail: match.contactEmail,
          ticketSubject: match.ticketSubject,
          priority: match.priority,
          category: match.category,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    logs.push(
      `📊 Contact-ticket association processing complete: ${results.length} successful, ${errors.length} failed`
    );

    return NextResponse.json({
      success: true,
      ticketMatches,
      results,
      errors,
      logs,
      summary: {
        totalContacts: contacts.length,
        totalTickets: tickets.length,
        matchesFound: ticketMatches.length,
        associationsCreated: results.length,
        associationsFailed: errors.length,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in contact-ticket associations API route: ${
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
