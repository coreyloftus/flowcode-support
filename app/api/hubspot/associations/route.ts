import { NextResponse } from "next/server";

// Helper function to extract domain from email
function extractDomainFromEmail(email: string): string {
  if (!email) return "";
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
}

// Helper function to extract domain from website URL
function extractDomainFromWebsite(website: string): string {
  if (!website) return "";

  try {
    const url = new URL(
      website.startsWith("http") ? website : `https://${website}`
    );
    return url.hostname.replace("www.", "").toLowerCase();
  } catch {
    return website
      .replace("www.", "")
      .replace(/^https?:\/\//, "")
      .toLowerCase();
  }
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

    logs.push(
      "🚀 Starting domain-based contact-company association process..."
    );

    // Step 1: Fetch the latest 100 companies from HubSpot
    logs.push("📋 Fetching latest 100 companies from HubSpot...");
    const companiesResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/companies?limit=100&properties=name,domain,website",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!companiesResponse.ok) {
      const errorText = await companiesResponse.text();
      logs.push(
        `❌ Failed to fetch companies: Status ${companiesResponse.status} - ${errorText}`
      );
      return NextResponse.json(
        {
          error: "Failed to fetch companies from HubSpot",
          logs,
        },
        { status: 500 }
      );
    }

    const companiesResult = await companiesResponse.json();
    const companies = companiesResult.results || [];
    logs.push(`✅ Fetched ${companies.length} companies from HubSpot`);

    if (companies.length === 0) {
      logs.push("❌ No companies found in HubSpot");
      return NextResponse.json(
        {
          error:
            "No companies found in HubSpot. Please create some companies first.",
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

    // Step 3: Find domain matches between contacts and companies
    logs.push(
      "🔍 Searching for domain matches between contacts and companies..."
    );
    const domainMatches = [];

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

      for (const company of companies) {
        const companyDomain =
          company.properties?.domain ||
          extractDomainFromWebsite(company.properties?.website || "");

        if (!companyDomain) {
          continue; // Skip companies without domain info
        }

        if (contactDomain === companyDomain) {
          logs.push(
            `✅ Domain match found: Contact ${contact.id} (${contactEmail}) → Company ${company.id} (${company.properties?.name}) - Domain: ${contactDomain}`
          );
          domainMatches.push({
            contactId: contact.id,
            companyId: company.id,
            contactEmail,
            companyName: company.properties?.name,
            domain: contactDomain,
          });
          break; // Found a match for this contact, move to next contact
        }
      }
    }

    logs.push(
      `📊 Found ${domainMatches.length} domain matches out of ${contacts.length} contacts`
    );

    if (domainMatches.length === 0) {
      logs.push("❌ No domain matches found between contacts and companies");
      return NextResponse.json({
        success: true,
        message: "No domain matches found between contacts and companies",
        domainMatches: [],
        logs,
        summary: {
          totalContacts: contacts.length,
          totalCompanies: companies.length,
          matchesFound: 0,
          associationsCreated: 0,
        },
      });
    }

    // Step 4: Create associations for domain matches
    logs.push(
      `🔗 Creating associations for ${domainMatches.length} domain matches...`
    );
    const results = [];
    const errors = [];

    for (const match of domainMatches) {
      try {
        const { contactId, companyId } = match;

        logs.push(
          `🔗 Creating association: Contact ${contactId} → Company ${companyId} (Domain: ${match.domain})`
        );

        const response = await fetch(
          `https://api.hubapi.com/crm/v4/objects/contact/${contactId}/associations/company/${companyId}/`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify([
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 1, // 1 = Contact to Company association
              },
            ]),
          }
        );

        if (response.ok) {
          logs.push(
            `✅ Association created successfully: Contact ${contactId} → Company ${companyId}`
          );
          results.push({
            contactId,
            companyId,
            contactEmail: match.contactEmail,
            companyName: match.companyName,
            domain: match.domain,
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
            contactEmail: match.contactEmail,
            companyName: match.companyName,
            domain: match.domain,
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
          companyId: match.companyId,
          contactEmail: match.contactEmail,
          companyName: match.companyName,
          domain: match.domain,
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
      domainMatches,
      results,
      errors,
      logs,
      summary: {
        totalContacts: contacts.length,
        totalCompanies: companies.length,
        matchesFound: domainMatches.length,
        associationsCreated: results.length,
        associationsFailed: errors.length,
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
