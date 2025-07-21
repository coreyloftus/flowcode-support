import { NextResponse } from "next/server";
import { salesforceAuth } from "../../../../lib/salesforce-auth";

export async function GET() {
  const logs: string[] = [];

  try {
    logs.push("🔐 Testing Salesforce JWT authentication...");

    // Test JWT authentication by getting a token
    const tokenData = await salesforceAuth.getAccessToken();
    logs.push("✅ JWT authentication successful");
    logs.push(`🌐 Instance URL: ${tokenData.instance_url}`);

    // Test API access with the token
    logs.push("🧪 Testing API access...");
    const response = await salesforceAuth.makeAuthenticatedRequest(
      "/services/oauth2/userinfo"
    );

    if (!response.ok) {
      const errorText = await response.text();
      logs.push(`❌ API test failed: ${response.status} - ${errorText}`);
      return NextResponse.json(
        {
          configured: false,
          error: `Salesforce API test failed: ${response.status}`,
          logs,
        },
        { status: 500 }
      );
    }

    const userInfo = await response.json();
    logs.push(
      `✅ API test successful - User: ${userInfo.name} (${userInfo.email})`
    );

    // Get organization details
    logs.push("🏢 Fetching organization details...");
    const orgResponse = await salesforceAuth.makeAuthenticatedRequest(
      "/services/data/v58.0/sobjects/Organization/describe"
    );

    if (orgResponse.ok) {
      const orgData = await orgResponse.json();
      logs.push(`✅ Organization: ${orgData.label}`);

      return NextResponse.json({
        configured: true,
        message: "Salesforce JWT authentication is configured and working",
        userInfo: {
          name: userInfo.name,
          email: userInfo.email,
          username: userInfo.preferred_username,
          organizationId: userInfo.organization_id,
        },
        instanceUrl: tokenData.instance_url,
        logs,
      });
    } else {
      const orgErrorText = await orgResponse.text();
      logs.push(
        `⚠️ Organization details fetch failed: ${orgResponse.status} - ${orgErrorText}`
      );

      return NextResponse.json({
        configured: true,
        message:
          "Salesforce JWT authentication is working but org details unavailable",
        userInfo: {
          name: userInfo.name,
          email: userInfo.email,
          username: userInfo.preferred_username,
          organizationId: userInfo.organization_id,
        },
        instanceUrl: tokenData.instance_url,
        warning: "Could not fetch organization details",
        logs,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logs.push(`💥 JWT authentication failed: ${errorMessage}`);

    return NextResponse.json(
      {
        configured: false,
        error: `Salesforce JWT authentication failed: ${errorMessage}`,
        logs,
        troubleshooting: {
          requiredEnvVars: [
            "SF_CLIENT_ID - Your connected app's consumer key",
            "SF_USERNAME - The Salesforce username for JWT authentication",
            "SF_LOGIN_URL - Your Salesforce login URL (e.g., https://login.salesforce.com)",
            "SF_PRIVATE_KEY_PATH - Path to your private key file",
          ],
          commonIssues: [
            "Private key file not found or invalid",
            "Connected app not configured for JWT Bearer Flow",
            "Username not authorized for the connected app",
            "Private key doesn't match the certificate uploaded to the connected app",
          ],
        },
      },
      { status: 500 }
    );
  }
}
