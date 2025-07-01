import { NextRequest, NextResponse } from "next/server";
// import { Contact } from "@/lib/faker-data";

// Helper function to extract domain from website URL
function extractDomainFromWebsite(website: string): string {
  if (!website) return "";

  try {
    const url = new URL(
      website.startsWith("http") ? website : `https://${website}`
    );
    return url.hostname.replace("www.", "");
  } catch {
    return website.replace("www.", "").replace(/^https?:\/\//, "");
  }
}

// Helper function to generate email from name and domain
function generateEmailFromName(
  firstName: string,
  lastName: string,
  domain: string
): string {
  const emailFormats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}@${domain}`,
  ];

  return emailFormats[Math.floor(Math.random() * emailFormats.length)];
}

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    const { contacts } = await request.json();
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

    if (!contacts || !Array.isArray(contacts)) {
      logs.push("❌ Contacts array is required");
      return NextResponse.json(
        { error: "Contacts array is required", logs },
        { status: 400 }
      );
    }

    logs.push(`🚀 Starting to process ${contacts.length} contacts...`);

    // First, fetch existing companies from HubSpot
    logs.push("📋 Fetching existing companies from HubSpot...");
    const companiesResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/companies?limit=100&properties=name,domain,website,industry",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    let existingCompanies = [];
    if (companiesResponse.ok) {
      const companiesResult = await companiesResponse.json();
      existingCompanies = companiesResult.results || [];
      logs.push(
        `✅ Fetched ${existingCompanies.length} existing companies from HubSpot`
      );
    } else {
      logs.push(`❌ Failed to fetch companies: ${companiesResponse.status}`);
      return NextResponse.json(
        {
          error: "Failed to fetch existing companies from HubSpot",
          logs,
        },
        { status: 500 }
      );
    }

    if (existingCompanies.length === 0) {
      logs.push("❌ No existing companies found in HubSpot");
      return NextResponse.json(
        {
          error:
            "No existing companies found in HubSpot. Please create some companies first.",
          logs,
        },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];
    const associations = [];

    for (const contact of contacts) {
      try {
        // Pick a random company from existing companies
        const randomCompany =
          existingCompanies[
            Math.floor(Math.random() * existingCompanies.length)
          ];
        const companyDomain =
          randomCompany.properties?.domain ||
          extractDomainFromWebsite(randomCompany.properties?.website || "");

        if (!companyDomain) {
          logs.push(
            `❌ No domain found for company: ${randomCompany.properties?.name}`
          );
          errors.push({
            id: contact.id,
            error: "No domain found for selected company",
            success: false,
          });
          continue;
        }

        logs.push(
          `🏢 Selected company: ${randomCompany.properties?.name} (${companyDomain})`
        );

        // Generate email using the company's domain
        const email = generateEmailFromName(
          contact.firstname,
          contact.lastname,
          companyDomain
        );

        logs.push(
          `📤 Sending contact: ${contact.firstname} ${contact.lastname} (${email})`
        );

        const response = await fetch(
          "https://api.hubapi.com/crm/v3/objects/contacts",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: {
                email: email,
                firstname: contact.firstname,
                lastname: contact.lastname,
                phone: contact.phone,
                company: contact.company,
                jobtitle: contact.jobtitle,
                address: contact.address,
                city: contact.city,
                state: contact.state,
                zip: contact.zip,
                country: contact.country,
                website: `https://www.${companyDomain}`,
                lifecycle_stage: contact.lifecycle_stage,
                hs_lead_status: contact.lead_status,
              },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          logs.push(
            `✅ Contact created successfully: ${contact.firstname} ${contact.lastname} -> HubSpot ID: ${result.id}`
          );
          results.push({ id: contact.id, hubspotId: result.id, success: true });

          // Create association with the selected company
          associations.push({
            contactId: result.id,
            companyId: randomCompany.id,
          });
          logs.push(
            `🔗 Queued association: Contact ${result.id} → Company ${randomCompany.id}`
          );
        } else {
          const errorText = await response.text();
          logs.push(
            `❌ Failed to create contact ${contact.firstname} ${contact.lastname}: Status ${response.status} - ${errorText}`
          );
          errors.push({ id: contact.id, error: errorText, success: false });
        }
      } catch (error) {
        logs.push(
          `💥 Exception creating contact ${contact.firstname} ${
            contact.lastname
          }: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        errors.push({
          id: contact.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    // Create associations if any were queued
    if (associations.length > 0) {
      logs.push(
        `🔗 Creating ${associations.length} contact-company associations...`
      );
      logs.push(
        `⏳ Waiting 10 seconds for HubSpot to process contact records before creating associations...`
      );

      // Wait 10 seconds for HubSpot to process the contact records
      await new Promise((resolve) => setTimeout(resolve, 10000));

      logs.push(`✅ Delay complete, proceeding with association creation...`);

      let associationSuccess = 0;
      let associationErrors = 0;

      for (const association of associations) {
        try {
          logs.push(
            `🔗 Creating association: Contact ${association.contactId} → Company ${association.companyId}`
          );

          // Try the v4 association API first
          const v4Payload = {
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 0 - 1,
              },
            ],
          };

          logs.push(
            `📤 v4 API Request Payload: ${JSON.stringify(v4Payload, null, 2)}`
          );

          const assocResponse = await fetch(
            `https://api.hubapi.com/crm/v4/objects/contacts/${association.contactId}/0-1/associations/companies/${association.companyId}/0-2`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(v4Payload),
            }
          );

          const v4ResponseText = await assocResponse.text();
          let v4ResponseData;
          try {
            v4ResponseData = JSON.parse(v4ResponseText);
          } catch {
            v4ResponseData = v4ResponseText;
          }

          logs.push(`📥 v4 API Response Status: ${assocResponse.status}`);
          logs.push(
            `📥 v4 API Response: ${JSON.stringify(v4ResponseData, null, 2)}`
          );

          if (assocResponse.ok) {
            logs.push(
              `✅ Association created successfully with v4 API: Contact ${association.contactId} → Company ${association.companyId}`
            );
            associationSuccess++;
          } else {
            logs.push(`❌ v4 API failed, trying v3 API`);

            // Fallback to v3 association API
            const v3Payload = [
              {
                to: {
                  id: association.companyId,
                },
                types: [
                  {
                    associationCategory: "HUBSPOT_DEFINED",
                    associationTypeId: 1,
                  },
                ],
              },
            ];

            logs.push(
              `📤 v3 API Request Payload: ${JSON.stringify(v3Payload, null, 2)}`
            );

            const assocResponseV3 = await fetch(
              `https://api.hubapi.com/crm/v3/objects/contacts/${association.contactId}/associations/companies/${association.companyId}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(v3Payload),
              }
            );

            const v3ResponseText = await assocResponseV3.text();
            let v3ResponseData;
            try {
              v3ResponseData = JSON.parse(v3ResponseText);
            } catch {
              v3ResponseData = v3ResponseText;
            }

            logs.push(`📥 v3 API Response Status: ${assocResponseV3.status}`);
            logs.push(
              `📥 v3 API Response: ${JSON.stringify(v3ResponseData, null, 2)}`
            );

            if (assocResponseV3.ok) {
              logs.push(
                `✅ Association created with v3 API: Contact ${association.contactId} → Company ${association.companyId}`
              );
              associationSuccess++;
            } else {
              logs.push(`❌ Both v4 and v3 APIs failed for association`);
              associationErrors++;
            }
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
      `📊 Contact processing complete: ${results.length} successful, ${errors.length} failed, ${associations.length} associations attempted`
    );

    return NextResponse.json({
      success: true,
      results,
      errors,
      associations,
      logs,
      summary: {
        total: contacts.length,
        successful: results.length,
        failed: errors.length,
        associationsAttempted: associations.length,
      },
    });
  } catch (error) {
    logs.push(
      `💥 General error in contacts API route: ${
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
