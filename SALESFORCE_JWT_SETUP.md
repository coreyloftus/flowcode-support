# Salesforce JWT Authentication Setup

This application uses JWT Bearer Flow for authenticating with Salesforce APIs. This provides a secure, token-based authentication method that doesn't require manual token management.

## Prerequisites

1. **Salesforce Connected App**: You need a connected app configured in your Salesforce org with JWT Bearer Flow enabled
2. **Digital Certificate**: A private/public key pair for signing JWT tokens
3. **User Authorization**: The Salesforce user must be authorized to use the connected app

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Salesforce JWT Authentication
SF_CLIENT_ID=your_connected_app_consumer_key
SF_USERNAME=your_salesforce_username
SF_LOGIN_URL=https://login.salesforce.com
SF_PRIVATE_KEY_PATH=./path/to/your/private.key
```

### Environment Variable Details

- **`SF_CLIENT_ID`**: The Consumer Key from your Salesforce Connected App
- **`SF_USERNAME`**: The Salesforce username that will be used for authentication
- **`SF_LOGIN_URL`**: Your Salesforce login URL (use `https://orgfarm-f37d87dd30-dev-ed.develop.my.salesforce.com/services/oauth2/authorize?response_type=code&client_id=3MVG9dAEux2v1sLv.xIUU.GseCDcwTalRb5qDNmocH3Bbb6nWIBW.SZYTsCRNGlO8xJxjwDebwNyFwl9MwwgG&redirect_uri=http://localhost:3000/api/salesforce/callback` for sandbox)
- **`SF_PRIVATE_KEY_PATH`**: Path to your private key file (relative to project root)

## Setup Instructions

### 1. Create a Connected App in Salesforce

1. Log into your Salesforce org
2. Go to **Setup** → **App Manager**
3. Click **New Connected App**
4. Fill in the basic information:
   - Connected App Name: `CRM Seeder JWT`
   - API Name: `CRM_Seeder_JWT`
   - Contact Email: Your email
5. Enable OAuth Settings:
   - Check **Enable OAuth Settings**
   - Callback URL: `https://login.salesforce.com/services/oauth2/success` (placeholder)
6. Select OAuth Scopes:
   - **Full access (full)**
   - **Perform requests on your behalf at any time (refresh_token, offline_access)**
7. Check **Use digital signatures**
8. Upload your public certificate (see step 2)
9. Save the Connected App

### 2. Generate Digital Certificate

You can generate a private/public key pair using OpenSSL:

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate signing request
openssl req -new -key server.key -out server.csr

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

- Upload `server.crt` to your Salesforce Connected App
- Keep `server.key` secure and reference it in `SF_PRIVATE_KEY_PATH`

### 3. Configure Connected App Policies

After creating the Connected App:

1. Go to **Setup** → **App Manager**
2. Find your app and click the dropdown → **Manage**
3. Click **Edit Policies**
4. Set the following:
   - **Permitted Users**: Admin approved users are pre-authorized
   - **IP Relaxation**: Relax IP restrictions (or configure as needed)
   - **Refresh Token Policy**: Refresh token is valid until revoked
5. Save the policies

### 4. Authorize the User

1. Go to **Setup** → **App Manager**
2. Find your app and click the dropdown → **Manage**
3. Click **Manage Profiles** or **Manage Permission Sets**
4. Add the user/profile that will be used for authentication

### 5. Test the Configuration

Once everything is set up, you can test the JWT authentication by hitting the config endpoint:

```bash
GET /api/salesforce/config
```

This will attempt to authenticate and return connection details.

## Security Best Practices

1. **Private Key Security**:

   - Never commit your private key to version control
   - Store it securely and limit access
   - Consider using environment variables for the key content in production

2. **User Permissions**:

   - Use a dedicated integration user with minimal required permissions
   - Regularly audit and rotate credentials

3. **Connected App Security**:
   - Restrict IP ranges if possible
   - Monitor usage through Salesforce's OAuth usage reports
   - Set appropriate session timeout policies

## Troubleshooting

### Common Issues

1. **"JWT validation failed"**:

   - Verify the private key matches the uploaded certificate
   - Check that the user is authorized for the connected app
   - Ensure the connected app has JWT Bearer Flow enabled

2. **"User not authorized"**:

   - Add the user to the connected app's authorized users
   - Check profile/permission set assignments
   - Redirect user to the Oauth grant login `https://orgfarm-f37d87dd30-dev-ed.develop.my.salesforce.com/services/oauth2/authorize?response_type=code&client_id=3MVG9dAEux2v1sLv.xIUU.GseCDcwTalRb5qDNmocH3Bbb6nWIBW.SZYTsCRNGlO8xJxjwDebwNyFwl9MwwgG&redirect_uri=http://localhost:3000/api/salesforce/callback`

3. **"Invalid audience"**:

   - Verify `SF_LOGIN_URL` matches your org type (production vs sandbox)

4. **"Private key file not found"**:
   - Check the path in `SF_PRIVATE_KEY_PATH`
   - Ensure the file exists and is readable

### Debug Endpoints

- **`GET /api/salesforce/config`**: Test JWT authentication and connection
- Check browser console and server logs for detailed error messages

## API Endpoints

Once JWT authentication is configured, these Salesforce API endpoints are available:

- **`POST /api/salesforce/accounts`**: Create Salesforce accounts
- **`POST /api/salesforce/contacts`**: Create Salesforce contacts
- **`POST /api/salesforce/leads`**: Create Salesforce leads
- **`POST /api/salesforce/opportunities`**: Create Salesforce opportunities
- **`GET /api/salesforce/config`**: Test authentication and get org info

All endpoints use the JWT authentication automatically and provide detailed logging of the operations performed.
