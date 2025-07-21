"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { DataDisplay } from "@/components/data-display";
import {
  generateContacts,
  generateCompanies,
  generateTickets,
  generateSalesforceContacts,
  generateSalesforceAccounts,
  generateSalesforceLeads,
  generateSalesforceOpportunities,
  Contact,
  Company,
  Ticket,
  SalesforceContact,
  SalesforceAccount,
  SalesforceLead,
  SalesforceOpportunity,
} from "@/lib/faker-data";

// Reusable component for action buttons
const ActionButton = ({
  onClick,
  disabled = false,
  variant = "primary",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success" | "warning";
  children: React.ReactNode;
}) => {
  const baseClasses =
    "inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border border-blue-600",
    secondary:
      "border border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700 hover:text-white",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600",
    warning:
      "bg-amber-600 hover:bg-amber-700 text-white border border-amber-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

// Reusable loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-gray-300">Checking CRM configuration...</p>
    </div>
  </div>
);

// Reusable card container
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg p-6 ${className}`}
  >
    {children}
  </div>
);

export default function Home() {
  // CRM Selection
  const [selectedCRM, setSelectedCRM] = useState<"hubspot" | "salesforce">(
    "hubspot"
  );

  // HubSpot data
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Salesforce data
  const [salesforceContacts, setSalesforceContacts] = useState<
    SalesforceContact[]
  >([]);
  const [salesforceAccounts, setSalesforceAccounts] = useState<
    SalesforceAccount[]
  >([]);
  const [salesforceLeads, setSalesforceLeads] = useState<SalesforceLead[]>([]);
  const [salesforceOpportunities, setSalesforceOpportunities] = useState<
    SalesforceOpportunity[]
  >([]);

  // Common state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [orgInfo, setOrgInfo] = useState<{ id: string; name?: string }>({
    id: "",
    name: "",
  });

  // Define the tab types based on selected CRM
  const tabTypes =
    selectedCRM === "hubspot"
      ? ["contacts", "companies", "tickets"]
      : ["contacts", "accounts", "leads", "opportunities"];

  useEffect(() => {
    checkCRMConfig();
  }, [selectedCRM]);

  const checkCRMConfig = async () => {
    try {
      const endpoint =
        selectedCRM === "hubspot"
          ? "/api/hubspot/config"
          : "/api/salesforce/config";
      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.configured) {
        setIsConfigured(true);
        if (selectedCRM === "hubspot") {
          setMessage("HubSpot API is configured and ready to use!");
          setOrgInfo({ id: "hubspot-portal", name: "HubSpot" });
        } else {
          setMessage(
            "Salesforce JWT authentication is configured and ready to use!"
          );
          setOrgInfo({
            id: result.userInfo?.organizationId || "unknown",
            name: result.userInfo?.name || "Salesforce",
          });
        }
      } else {
        setIsConfigured(false);
        if (selectedCRM === "hubspot") {
          setMessage(
            "HubSpot API key not configured. Please set HUBSPOT_API_KEY environment variable."
          );
        } else {
          // Use the detailed error message from the JWT authentication system
          setMessage(
            result.error ||
              "Salesforce JWT authentication not configured. Please check the required environment variables: SF_CLIENT_ID, SF_USERNAME, SF_LOGIN_URL, SF_PRIVATE_KEY_PATH"
          );
        }
        setOrgInfo({ id: "", name: "" });
      }
    } catch (error) {
      console.error(`Error checking ${selectedCRM} configuration:`, error);
      setIsConfigured(false);
      setMessage(
        `Error checking ${selectedCRM} configuration. Please ensure the API credentials are set.`
      );
      setOrgInfo({ id: "", name: "" });
    } finally {
      setIsCheckingConfig(false);
    }
  };

  const generateData = (
    type:
      | "contacts"
      | "companies"
      | "tickets"
      | "accounts"
      | "leads"
      | "opportunities",
    count: number = 5
  ) => {
    if (selectedCRM === "hubspot") {
      switch (type) {
        case "contacts":
          setContacts(generateContacts(count));
          break;
        case "companies":
          setCompanies(generateCompanies(count));
          break;
        case "tickets":
          setTickets(generateTickets(count));
          break;
      }
    } else {
      // salesforce
      switch (type) {
        case "contacts":
          setSalesforceContacts(generateSalesforceContacts(count));
          break;
        case "accounts":
          setSalesforceAccounts(generateSalesforceAccounts(count));
          break;
        case "leads":
          setSalesforceLeads(generateSalesforceLeads(count));
          break;
        case "opportunities":
          setSalesforceOpportunities(generateSalesforceOpportunities(count));
          break;
      }
    }
    setMessage(`${count} ${type} generated successfully!`);
  };

  const associateContactsToCompanies = async () => {
    if (!isConfigured) {
      setMessage(
        "HubSpot API is not configured. Please set HUBSPOT_API_KEY environment variable."
      );
      return;
    }

    setIsLoading(true);
    setMessage("");
    setApiLogs([]);

    try {
      const response = await fetch("/api/hubspot/associations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.logs) {
        console.log("=== HubSpot Contact-Company Associations API Logs ===");
        result.logs.forEach((log: string) => {
          console.log(log);
        });
        console.log("=== End Logs ===");
        setApiLogs(result.logs);
      }

      if (result.success) {
        setMessage(
          `Successfully created ${
            result.summary.associationsCreated
          } contact-company associations! ${
            result.summary.associationsFailed > 0
              ? `${result.summary.associationsFailed} failed.`
              : ""
          }`
        );
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(
        `Error creating associations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const associateContactsToTickets = async () => {
    if (!isConfigured) {
      setMessage(
        "HubSpot API is not configured. Please set HUBSPOT_API_KEY environment variable."
      );
      return;
    }

    setIsLoading(true);
    setMessage("");
    setApiLogs([]);

    try {
      const response = await fetch("/api/hubspot/contact-ticket-associations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.logs) {
        console.log("=== HubSpot Contact-Ticket Associations API Logs ===");
        result.logs.forEach((log: string) => {
          console.log(log);
        });
        console.log("=== End Logs ===");
        setApiLogs(result.logs);
      }

      if (result.success) {
        setMessage(
          `Successfully created ${
            result.summary.associationsCreated
          } contact-ticket associations! ${
            result.summary.associationsFailed > 0
              ? `${result.summary.associationsFailed} failed.`
              : ""
          }`
        );
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(
        `Error creating associations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendToCRM = async (
    type:
      | "contacts"
      | "companies"
      | "tickets"
      | "accounts"
      | "leads"
      | "opportunities"
  ) => {
    if (!isConfigured) {
      setMessage(
        `${
          selectedCRM === "hubspot" ? "HubSpot" : "Salesforce"
        } API is not configured. Please set the required environment variables.`
      );
      return;
    }

    setIsLoading(true);
    setMessage("");
    setApiLogs([]);

    try {
      let data:
        | Contact[]
        | Company[]
        | Ticket[]
        | SalesforceContact[]
        | SalesforceAccount[]
        | SalesforceLead[]
        | SalesforceOpportunity[];
      let endpoint: string;
      let bodyKey: string;

      if (selectedCRM === "hubspot") {
        switch (type) {
          case "contacts":
            data = contacts;
            endpoint = "/api/hubspot/contacts";
            bodyKey = "contacts";
            break;
          case "companies":
            data = companies;
            endpoint = "/api/hubspot/companies";
            bodyKey = "companies";
            break;
          case "tickets":
            data = tickets;
            endpoint = "/api/hubspot/tickets";
            bodyKey = "tickets";
            break;
          default:
            throw new Error(`Invalid type for HubSpot: ${type}`);
        }
      } else {
        // salesforce
        switch (type) {
          case "contacts":
            data = salesforceContacts;
            endpoint = "/api/salesforce/contacts";
            bodyKey = "contacts";
            break;
          case "accounts":
            data = salesforceAccounts;
            endpoint = "/api/salesforce/accounts";
            bodyKey = "accounts";
            break;
          case "leads":
            data = salesforceLeads;
            endpoint = "/api/salesforce/leads";
            bodyKey = "leads";
            break;
          case "opportunities":
            data = salesforceOpportunities;
            endpoint = "/api/salesforce/opportunities";
            bodyKey = "opportunities";
            break;
          default:
            throw new Error(`Invalid type for Salesforce: ${type}`);
        }
      }

      if (data.length === 0) {
        setMessage(`No ${type} to send. Please generate some data first!`);
        setIsLoading(false);
        return;
      }

      // Console log the data before sending to CRM to inspect schema
      console.log(
        `=== ${
          selectedCRM === "hubspot" ? "HUBSPOT" : "SALESFORCE"
        } ${type.toUpperCase()} DATA BEING SENT ===`
      );
      console.log(
        `📊 Sending ${data.length} ${type} to ${
          selectedCRM === "hubspot" ? "HubSpot" : "Salesforce"
        }`
      );
      console.log("📋 Data Schema:", data);
      console.log("🔗 Endpoint:", endpoint);
      console.log("🔑 Body Key:", bodyKey);
      console.log(
        "========================================================================================"
      );

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [bodyKey]: data,
        }),
      });

      const result = await response.json();

      // Log to browser console
      if (result.logs) {
        console.log(
          `=== ${selectedCRM === "hubspot" ? "HubSpot" : "Salesforce"} ${
            type.charAt(0).toUpperCase() + type.slice(1)
          } API Logs ===`
        );
        result.logs.forEach((log: string) => {
          console.log(log);
        });
        console.log("=== End Logs ===");

        // Also store logs for UI display
        setApiLogs(result.logs);
      }

      if (result.success) {
        setMessage(
          `Successfully sent ${result.summary.successful} ${type} to ${
            selectedCRM === "hubspot" ? "HubSpot" : "Salesforce"
          }! ${
            result.summary.failed > 0 ? `${result.summary.failed} failed.` : ""
          }`
        );
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(
        `Error sending data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDataForType = (type: string) => {
    if (selectedCRM === "hubspot") {
      switch (type) {
        case "contacts":
          return contacts;
        case "companies":
          return companies;
        case "tickets":
          return tickets;
        default:
          return [];
      }
    } else {
      // salesforce
      switch (type) {
        case "contacts":
          return salesforceContacts;
        case "accounts":
          return salesforceAccounts;
        case "leads":
          return salesforceLeads;
        case "opportunities":
          return salesforceOpportunities;
        default:
          return [];
      }
    }
  };

  // Generate buttons for data operations
  const renderDataButtons = (type: string) => {
    const data = getDataForType(type);
    const capitalizedType =
      selectedCRM === "hubspot"
        ? type.charAt(0).toUpperCase() + type.slice(1)
        : type === "accounts"
        ? "Accounts"
        : type === "opportunities"
        ? "Opportunities"
        : type === "leads"
        ? "Leads"
        : type.charAt(0).toUpperCase() + type.slice(1);

    const typedType = type as
      | "contacts"
      | "companies"
      | "tickets"
      | "accounts"
      | "leads"
      | "opportunities";

    return (
      <div className="flex gap-4 mb-8 flex-wrap">
        <ActionButton
          onClick={() => generateData(typedType, 5)}
          disabled={isLoading}
        >
          Generate 5 {capitalizedType}
        </ActionButton>
        <ActionButton
          onClick={() => generateData(typedType, 10)}
          disabled={isLoading}
        >
          Generate 10 {capitalizedType}
        </ActionButton>
        <ActionButton
          onClick={() => sendToCRM(typedType)}
          disabled={isLoading || data.length === 0 || !isConfigured}
          variant="secondary"
        >
          {isLoading
            ? "Sending..."
            : `Send to ${selectedCRM === "hubspot" ? "HubSpot" : "Salesforce"}`}
        </ActionButton>
      </div>
    );
  };

  const renderTabContent = (type: string) => {
    const data = getDataForType(type);

    return (
      <div className="p-8">
        {renderDataButtons(type)}

        {/* Association buttons - only for HubSpot */}
        {selectedCRM === "hubspot" && (
          <div className="flex gap-4 mb-8 flex-wrap">
            <ActionButton
              onClick={associateContactsToCompanies}
              disabled={isLoading}
              variant="success"
            >
              Associate Contacts to Companies
            </ActionButton>
            <ActionButton
              onClick={associateContactsToTickets}
              disabled={isLoading}
              variant="warning"
            >
              Associate Contacts to Tickets
            </ActionButton>
          </div>
        )}

        <DataDisplay
          data={
            data as
              | Contact[]
              | Company[]
              | Ticket[]
              | SalesforceContact[]
              | SalesforceAccount[]
              | SalesforceLead[]
              | SalesforceOpportunity[]
          }
          type={
            type as
              | "contacts"
              | "companies"
              | "tickets"
              | "accounts"
              | "leads"
              | "opportunities"
          }
          crmType={selectedCRM}
        />
      </div>
    );
  };

  if (isCheckingConfig) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-8">
      <div className="max-w-6xl mx-auto px-4 w-full">
        {/* Header Section */}
        <Card className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              CRM Data Generator
            </h1>
            <p className="text-gray-300 text-lg">
              Generate fake data and send it to your CRM using the API
            </p>
          </div>
        </Card>

        {/* CRM Selection */}
        <Card className="mb-8">
          <div>
            <label className="block text-base font-semibold text-white mb-2">
              Select CRM
            </label>
            <select
              value={selectedCRM}
              onChange={(e) =>
                setSelectedCRM(e.target.value as "hubspot" | "salesforce")
              }
              className="bg-gray-700 border border-gray-600 rounded-md text-white px-4 py-3 text-base min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hubspot">HubSpot</option>
              <option value="salesforce">Salesforce</option>
            </select>
          </div>
        </Card>

        {/* Configuration Status */}
        <Card
          className={`mb-8 ${
            isConfigured
              ? "bg-emerald-900 bg-opacity-20 border-emerald-500 border-opacity-50"
              : "bg-red-900 bg-opacity-20 border-red-500 border-opacity-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-white">
              {isConfigured
                ? `✅ ${
                    selectedCRM === "hubspot" ? "HubSpot" : "Salesforce"
                  } API Configured${
                    orgInfo.id
                      ? ` - ${orgInfo.name ? `${orgInfo.name} ` : ""}Org ID: ${
                          orgInfo.id
                        }`
                      : ""
                  }`
                : `❌ ${
                    selectedCRM === "hubspot" ? "HubSpot" : "Salesforce"
                  } API Not Configured`}
            </span>
            <ActionButton onClick={checkCRMConfig} variant="secondary">
              Refresh Status
            </ActionButton>
          </div>
          <p className="text-gray-300 mt-2">{message}</p>
        </Card>

        {/* Message Display */}
        {message && !message.includes("API") && (
          <Card
            className={`mb-8 ${
              message.includes("Error") || message.includes("failed")
                ? "bg-red-900 bg-opacity-20 border-red-500 border-opacity-50"
                : "bg-emerald-900 bg-opacity-20 border-emerald-500 border-opacity-50"
            }`}
          >
            <p className="text-gray-300">{message}</p>
          </Card>
        )}

        {/* API Logs Display */}
        {apiLogs.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-lg">
                API Logs (also in browser console)
              </span>
              <ActionButton onClick={() => setApiLogs([])} variant="secondary">
                Clear
              </ActionButton>
            </div>
            <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-auto max-h-64 border border-gray-800">
              {apiLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Card className="overflow-hidden">
          <Tabs defaultValue="contacts" className="w-full">
            <div className="border-b border-gray-600 bg-gray-600 bg-opacity-80">
              <TabsList
                className="grid w-full bg-gray-600 bg-opacity-80 border-none h-16 gap-0"
                style={{
                  gridTemplateColumns: `repeat(${tabTypes.length}, 1fr)`,
                }}
              >
                {tabTypes.map((type) => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="bg-transparent text-gray-400 border-none rounded-none h-full text-base font-medium capitalize border-r border-gray-600 last:border-r-0 transition-all duration-200 hover:bg-gray-600 hover:bg-opacity-50 hover:text-gray-200 data-[state=active]:bg-gray-300 data-[state=active]:text-gray-800 data-[state=active]:font-semibold"
                  >
                    {selectedCRM === "hubspot"
                      ? type.charAt(0).toUpperCase() + type.slice(1)
                      : type === "accounts"
                      ? "Accounts"
                      : type === "opportunities"
                      ? "Opportunities"
                      : type === "leads"
                      ? "Leads"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabTypes.map((type) => (
              <TabsContent
                key={type}
                value={type}
                className="m-0 bg-gray-700 bg-opacity-80 border-t border-gray-600"
              >
                {renderTabContent(type)}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
