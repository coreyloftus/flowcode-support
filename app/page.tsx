"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DataDisplay } from "@/components/data-display";
import {
  generateContacts,
  generateCompanies,
  generateTickets,
  Contact,
  Company,
  Ticket,
} from "@/lib/faker-data";

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [apiLogs, setApiLogs] = useState<string[]>([]);

  // Define the tab types
  const tabTypes = ["contacts", "companies", "tickets"];

  useEffect(() => {
    checkHubSpotConfig();
  }, []);

  const checkHubSpotConfig = async () => {
    try {
      const response = await fetch("/api/hubspot/config");
      const result = await response.json();

      if (result.configured) {
        setIsConfigured(true);
        setMessage("HubSpot API is configured and ready to use!");
      } else {
        setIsConfigured(false);
        setMessage(
          "HubSpot API key not configured. Please set HUBSPOT_API_KEY environment variable."
        );
      }
    } catch (error) {
      console.error("Error checking HubSpot configuration:", error);
      setIsConfigured(false);
      setMessage(
        "Error checking HubSpot configuration. Please ensure HUBSPOT_API_KEY is set."
      );
    } finally {
      setIsCheckingConfig(false);
    }
  };

  const generateData = (
    type: "contacts" | "companies" | "tickets",
    count: number = 5
  ) => {
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

  const sendToHubSpot = async (type: "contacts" | "companies" | "tickets") => {
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
      let data: Contact[] | Company[] | Ticket[];
      let endpoint: string;

      switch (type) {
        case "contacts":
          data = contacts;
          endpoint = "/api/hubspot/contacts";
          break;
        case "companies":
          data = companies;
          endpoint = "/api/hubspot/companies";
          break;
        case "tickets":
          data = tickets;
          endpoint = "/api/hubspot/tickets";
          break;
      }

      if (data.length === 0) {
        setMessage(`No ${type} to send. Please generate some data first!`);
        setIsLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [type]: data,
        }),
      });

      const result = await response.json();

      // Log to browser console
      if (result.logs) {
        console.log(
          `=== HubSpot ${
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
          `Successfully sent ${result.summary.successful} ${type} to HubSpot! ${
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
  };

  const renderTabContent = (type: string) => {
    const data = getDataForType(type);

    return (
      <div style={{ padding: "32px" }}>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={() =>
              generateData(type as "contacts" | "companies" | "tickets", 5)
            }
            disabled={isLoading}
            style={{
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              padding: "12px 24px",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Generate 5 {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
          <Button
            onClick={() =>
              generateData(type as "contacts" | "companies" | "tickets", 10)
            }
            disabled={isLoading}
            style={{
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              padding: "12px 24px",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Generate 10 {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
          <Button
            onClick={() =>
              sendToHubSpot(type as "contacts" | "companies" | "tickets")
            }
            disabled={isLoading || data.length === 0 || !isConfigured}
            variant="outline"
            style={{
              borderColor: "#6b7280",
              color: "#d1d5db",
              padding: "12px 24px",
              backgroundColor: "transparent",
            }}
          >
            {isLoading ? "Sending..." : "Send to HubSpot"}
          </Button>
        </div>

        {/* Association buttons for all tabs */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={associateContactsToCompanies}
            disabled={isLoading}
            style={{
              backgroundColor: "#10b981",
              color: "#ffffff",
              padding: "12px 24px",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Associate Contacts to Companies
          </Button>
          <Button
            onClick={associateContactsToTickets}
            disabled={isLoading}
            style={{
              backgroundColor: "#f59e0b",
              color: "#ffffff",
              padding: "12px 24px",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Associate Contacts to Tickets
          </Button>
        </div>

        <DataDisplay
          data={data as Contact[] | Company[] | Ticket[]}
          type={type as "contacts" | "companies" | "tickets"}
        />
      </div>
    );
  };

  if (isCheckingConfig) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              animation: "spin 1s linear infinite",
              borderRadius: "50%",
              height: "48px",
              width: "48px",
              borderBottom: "2px solid #ffffff",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ color: "#d1d5db" }}>Checking HubSpot configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 0",
      }}
    >
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 16px",
          width: "100%",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            marginBottom: "32px",
            backgroundColor: "rgba(55, 65, 81, 0.8)",
            border: "1px solid #4b5563",
            borderRadius: "8px",
            padding: "32px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#ffffff",
                marginBottom: "16px",
                letterSpacing: "-0.025em",
              }}
            >
              HubSpot Data Generator
            </h1>
            <p style={{ color: "#d1d5db", fontSize: "18px" }}>
              Generate fake data and send it to HubSpot using the API
            </p>
          </div>
        </div>

        {/* Configuration Status */}
        <div
          style={{
            marginBottom: "32px",
            borderRadius: "8px",
            padding: "24px",
            backgroundColor: isConfigured
              ? "rgba(34, 197, 94, 0.2)"
              : "rgba(239, 68, 68, 0.2)",
            border: `1px solid ${
              isConfigured ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)"
            }`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{ fontSize: "18px", fontWeight: "500", color: "#ffffff" }}
            >
              {isConfigured
                ? "✅ HubSpot API Configured"
                : "❌ HubSpot API Not Configured"}
            </span>
            <Button
              onClick={checkHubSpotConfig}
              variant="outline"
              size="sm"
              style={{
                borderColor: "#6b7280",
                color: "#d1d5db",
                padding: "8px 16px",
              }}
            >
              Refresh Status
            </Button>
          </div>
          <p style={{ color: "#d1d5db", marginTop: "8px" }}>{message}</p>
        </div>

        {/* Message Display */}
        {message && !message.includes("HubSpot API") && (
          <div
            style={{
              marginBottom: "32px",
              borderRadius: "8px",
              padding: "24px",
              backgroundColor:
                message.includes("Error") || message.includes("failed")
                  ? "rgba(239, 68, 68, 0.2)"
                  : "rgba(34, 197, 94, 0.2)",
              border: `1px solid ${
                message.includes("Error") || message.includes("failed")
                  ? "rgba(239, 68, 68, 0.5)"
                  : "rgba(34, 197, 94, 0.5)"
              }`,
            }}
          >
            <p style={{ color: "#d1d5db" }}>{message}</p>
          </div>
        )}

        {/* API Logs Display */}
        {apiLogs.length > 0 && (
          <div
            style={{
              marginBottom: "32px",
              backgroundColor: "rgba(55, 65, 81, 0.8)",
              border: "1px solid #4b5563",
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "18px",
                }}
              >
                API Logs (also in browser console)
              </span>
              <Button
                onClick={() => setApiLogs([])}
                variant="outline"
                size="sm"
                style={{
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  padding: "8px 16px",
                }}
              >
                Clear
              </Button>
            </div>
            <div
              style={{
                backgroundColor: "#000000",
                color: "#4ade80",
                padding: "16px",
                borderRadius: "6px",
                fontFamily: "monospace",
                fontSize: "14px",
                overflow: "auto",
                maxHeight: "256px",
                border: "1px solid #1f2937",
              }}
            >
              {apiLogs.map((log, index) => (
                <div key={index} style={{ marginBottom: "4px" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <div
          style={{
            backgroundColor: "rgba(55, 65, 81, 0.8)",
            border: "1px solid #4b5563",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Tabs defaultValue="contacts" style={{ width: "100%" }}>
            <div
              style={{
                borderBottom: "1px solid #4b5563",
                backgroundColor: "rgba(75, 85, 99, 0.8)",
              }}
            >
              <TabsList
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  width: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  height: "64px",
                  gap: "0",
                }}
              >
                {tabTypes.map((type) => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    style={{
                      backgroundColor: "transparent",
                      color: "#9ca3af",
                      border: "none",
                      borderRadius: "0",
                      height: "100%",
                      fontSize: "16px",
                      fontWeight: "500",
                      textTransform: "capitalize",
                      borderRight: "1px solid #4b5563",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabTypes.map((type) => (
              <TabsContent
                key={type}
                value={type}
                style={{
                  margin: "0",
                  backgroundColor: "rgba(55, 65, 81, 0.8)",
                  borderTop: "1px solid #4b5563",
                }}
              >
                {renderTabContent(type)}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
