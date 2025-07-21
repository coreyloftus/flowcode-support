import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

export interface SalesforceTokenResponse {
  access_token: string;
  instance_url: string;
  token_type: string;
  id: string;
  issued_at: string;
  signature: string;
}

export interface SalesforceAuthConfig {
  clientId: string;
  username: string;
  loginUrl: string;
  privateKeyPath: string;
}

class SalesforceJWT {
  private config: SalesforceAuthConfig;
  private cachedToken: SalesforceTokenResponse | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SalesforceAuthConfig {
    const { SF_CLIENT_ID, SF_USERNAME, SF_LOGIN_URL, SF_PRIVATE_KEY_PATH } =
      process.env;

    if (
      !SF_CLIENT_ID ||
      !SF_USERNAME ||
      !SF_LOGIN_URL ||
      !SF_PRIVATE_KEY_PATH
    ) {
      throw new Error(
        "Missing required Salesforce JWT environment variables: SF_CLIENT_ID, SF_USERNAME, SF_LOGIN_URL, SF_PRIVATE_KEY_PATH"
      );
    }

    return {
      clientId: SF_CLIENT_ID,
      username: SF_USERNAME,
      loginUrl: SF_LOGIN_URL,
      privateKeyPath: SF_PRIVATE_KEY_PATH,
    };
  }

  private createJWT(): string {
    // Read private key
    const privateKeyPath = path.resolve(this.config.privateKeyPath);

    if (!fs.existsSync(privateKeyPath)) {
      throw new Error(`Private key file not found at: ${privateKeyPath}`);
    }

    const privateKey = fs.readFileSync(privateKeyPath, "utf8");

    // Build JWT payload
    const payload = {
      iss: this.config.clientId,
      sub: this.config.username,
      aud: this.config.loginUrl,
      exp: Math.floor(Date.now() / 1000) + 300, // 5 mins expiry
    };

    // Sign JWT
    return jwt.sign(payload, privateKey, { algorithm: "RS256" });
  }

  async getAccessToken(): Promise<SalesforceTokenResponse> {
    // Check if we have a valid cached token (with 5 minute buffer)
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry > now + 300000) {
      return this.cachedToken;
    }

    try {
      const signedJWT = this.createJWT();
      const url = `${this.config.loginUrl}/services/oauth2/token`;

      const formData = new URLSearchParams();
      formData.append(
        "grant_type",
        "urn:ietf:params:oauth:grant-type:jwt-bearer"
      );
      formData.append("assertion", signedJWT);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch Salesforce access token: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      const tokenData: SalesforceTokenResponse = await response.json();
      console.log("🔑 Salesforce Token for Postman:", tokenData.access_token);
      console.log("🌐 Instance URL:", tokenData.instance_url);

      // Cache the token (tokens typically last 2 hours, but we'll refresh more frequently)
      this.cachedToken = tokenData;
      this.tokenExpiry = now + 3600000; // Cache for 1 hour

      return tokenData;
    } catch (error) {
      throw new Error(
        `Salesforce JWT authentication failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const tokenData = await this.getAccessToken();

    const authenticatedOptions: RequestInit = {
      ...options,
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const fullUrl = endpoint.startsWith("http")
      ? endpoint
      : `${tokenData.instance_url}${endpoint}`;

    return fetch(fullUrl, authenticatedOptions);
  }

  // Utility method to get authentication headers
  async getAuthHeaders(): Promise<{
    Authorization: string;
    "Content-Type": string;
  }> {
    const tokenData = await this.getAccessToken();
    return {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    };
  }

  // Utility method to get instance URL
  async getInstanceUrl(): Promise<string> {
    const tokenData = await this.getAccessToken();
    return tokenData.instance_url;
  }

  // Clear cached token (useful for testing or error recovery)
  clearCache(): void {
    this.cachedToken = null;
    this.tokenExpiry = 0;
  }
}

// Export a singleton instance
export const salesforceAuth = new SalesforceJWT();

// Export the class for testing or multiple instances if needed
export { SalesforceJWT };
