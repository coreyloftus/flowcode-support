"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DataDisplay } from "@/components/data-display";
import {
  generateContacts,
  generateCompanies,
  generateTickets,
  generateAssociations,
  Contact,
  Company,
  Ticket,
  Association,
} from "@/lib/faker-data";

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [apiLogs, setApiLogs] = useState<string[]>([]);

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

  const generateAssociationsData = (count: number = 5) => {
    const newAssociations = generateAssociations(contacts, companies, count);
    setAssociations(newAssociations);
    setMessage(
      `${newAssociations.length} associations generated successfully!`
    );
  };

  const sendToHubSpot = async (
    type: "contacts" | "companies" | "tickets" | "associations"
  ) => {
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
      let data: Contact[] | Company[] | Ticket[] | Association[];
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
        case "associations":
          data = associations;
          endpoint = "/api/hubspot/associations";
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
          }}
        >
          <Tabs defaultValue="contacts" style={{ width: "100%" }}>
            <div style={{ borderBottom: "1px solid #4b5563" }}>
              <TabsList
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  width: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  height: "64px",
                }}
              >
                <TabsTrigger
                  value="contacts"
                  style={{
                    backgroundColor: "transparent",
                    color: "#9ca3af",
                    border: "none",
                    borderRadius: "0",
                    height: "100%",
                    fontSize: "16px",
                  }}
                >
                  Contacts
                </TabsTrigger>
                <TabsTrigger
                  value="companies"
                  style={{
                    backgroundColor: "transparent",
                    color: "#9ca3af",
                    border: "none",
                    borderRadius: "0",
                    height: "100%",
                    fontSize: "16px",
                  }}
                >
                  Companies
                </TabsTrigger>
                <TabsTrigger
                  value="tickets"
                  style={{
                    backgroundColor: "transparent",
                    color: "#9ca3af",
                    border: "none",
                    borderRadius: "0",
                    height: "100%",
                    fontSize: "16px",
                  }}
                >
                  Tickets
                </TabsTrigger>
                <TabsTrigger
                  value="associations"
                  style={{
                    backgroundColor: "transparent",
                    color: "#9ca3af",
                    border: "none",
                    borderRadius: "0",
                    height: "100%",
                    fontSize: "16px",
                  }}
                >
                  Associations
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="contacts" style={{ padding: "32px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  onClick={() => generateData("contacts", 5)}
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
                  Generate 5 Contacts
                </Button>
                <Button
                  onClick={() => generateData("contacts", 10)}
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
                  Generate 10 Contacts
                </Button>
                <Button
                  onClick={() => sendToHubSpot("contacts")}
                  disabled={isLoading || contacts.length === 0 || !isConfigured}
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
              <DataDisplay data={contacts} type="contacts" />
            </TabsContent>

            <TabsContent value="companies" style={{ padding: "32px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  onClick={() => generateData("companies", 5)}
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
                  Generate 5 Companies
                </Button>
                <Button
                  onClick={() => generateData("companies", 10)}
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
                  Generate 10 Companies
                </Button>
                <Button
                  onClick={() => sendToHubSpot("companies")}
                  disabled={
                    isLoading || companies.length === 0 || !isConfigured
                  }
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
              <DataDisplay data={companies} type="companies" />
            </TabsContent>

            <TabsContent value="tickets" style={{ padding: "32px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  onClick={() => generateData("tickets", 5)}
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
                  Generate 5 Tickets
                </Button>
                <Button
                  onClick={() => generateData("tickets", 10)}
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
                  Generate 10 Tickets
                </Button>
                <Button
                  onClick={() => sendToHubSpot("tickets")}
                  disabled={isLoading || tickets.length === 0 || !isConfigured}
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
              <DataDisplay data={tickets} type="tickets" />
            </TabsContent>

            <TabsContent value="associations" style={{ padding: "32px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  onClick={() => generateAssociationsData(5)}
                  disabled={
                    isLoading || contacts.length === 0 || companies.length === 0
                  }
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
                  Generate 5 Associations
                </Button>
                <Button
                  onClick={() => generateAssociationsData(10)}
                  disabled={
                    isLoading || contacts.length === 0 || companies.length === 0
                  }
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
                  Generate 10 Associations
                </Button>
                <Button
                  onClick={() => sendToHubSpot("associations")}
                  disabled={
                    isLoading || associations.length === 0 || !isConfigured
                  }
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
              <div style={{ marginBottom: "24px" }}>
                <p style={{ color: "#d1d5db", marginBottom: "16px" }}>
                  Note: You need to have contacts and companies generated first,
                  and they need to be sent to HubSpot to get real HubSpot IDs.
                </p>
              </div>
              {associations.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      minWidth: "100%",
                      backgroundColor: "rgba(55, 65, 81, 0.8)",
                      border: "1px solid #4b5563",
                      borderRadius: "8px",
                    }}
                  >
                    <thead style={{ backgroundColor: "rgba(75, 85, 99, 0.8)" }}>
                      <tr>
                        <th
                          style={{
                            padding: "24px",
                            textAlign: "left",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#d1d5db",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Contact ID
                        </th>
                        <th
                          style={{
                            padding: "24px",
                            textAlign: "left",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#d1d5db",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Company ID
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: "1px solid #4b5563" }}>
                      {associations.map((association, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px solid #4b5563" }}
                        >
                          <td
                            style={{
                              padding: "24px",
                              fontFamily: "monospace",
                              fontSize: "14px",
                              color: "#d1d5db",
                            }}
                          >
                            {association.contactId}
                          </td>
                          <td
                            style={{
                              padding: "24px",
                              fontFamily: "monospace",
                              fontSize: "14px",
                              color: "#d1d5db",
                            }}
                          >
                            {association.companyId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div
                    style={{
                      marginTop: "16px",
                      fontSize: "14px",
                      color: "#9ca3af",
                    }}
                  >
                    Total associations: {associations.length}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "#9ca3af",
                  }}
                >
                  {`No associations generated yet. Generate contacts and companies first, then click Generate Associations!`}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
