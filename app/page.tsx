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

  if (isCheckingConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking HubSpot configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HubSpot Data Generator
          </h1>
          <p className="text-gray-600">
            Generate fake data and send it to HubSpot using the API
          </p>
        </div>

        {/* Configuration Status */}
        <div
          className={`mb-6 p-4 rounded-md ${
            isConfigured
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>
              {isConfigured
                ? "✅ HubSpot API Configured"
                : "❌ HubSpot API Not Configured"}
            </span>
            <Button onClick={checkHubSpotConfig} variant="outline" size="sm">
              Refresh Status
            </Button>
          </div>
          <p className="text-sm mt-1">{message}</p>
        </div>

        {/* Message Display */}
        {message && !message.includes("HubSpot API") && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.includes("Error") || message.includes("failed")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* API Logs Display */}
        {apiLogs.length > 0 && (
          <div className="mb-6 bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-auto max-h-64">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">
                API Logs (also in browser console)
              </span>
              <Button
                onClick={() => setApiLogs([])}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Clear
              </Button>
            </div>
            {apiLogs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="contacts" className="bg-white rounded-lg shadow">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="p-6">
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => generateData("contacts", 5)}
                disabled={isLoading}
              >
                Generate 5 Contacts
              </Button>
              <Button
                onClick={() => generateData("contacts", 10)}
                disabled={isLoading}
              >
                Generate 10 Contacts
              </Button>
              <Button
                onClick={() => sendToHubSpot("contacts")}
                disabled={isLoading || contacts.length === 0 || !isConfigured}
                variant="outline"
              >
                {isLoading ? "Sending..." : "Send to HubSpot"}
              </Button>
            </div>
            <DataDisplay data={contacts} type="contacts" />
          </TabsContent>

          <TabsContent value="companies" className="p-6">
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => generateData("companies", 5)}
                disabled={isLoading}
              >
                Generate 5 Companies
              </Button>
              <Button
                onClick={() => generateData("companies", 10)}
                disabled={isLoading}
              >
                Generate 10 Companies
              </Button>
              <Button
                onClick={() => sendToHubSpot("companies")}
                disabled={isLoading || companies.length === 0 || !isConfigured}
                variant="outline"
              >
                {isLoading ? "Sending..." : "Send to HubSpot"}
              </Button>
            </div>
            <DataDisplay data={companies} type="companies" />
          </TabsContent>

          <TabsContent value="tickets" className="p-6">
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => generateData("tickets", 5)}
                disabled={isLoading}
              >
                Generate 5 Tickets
              </Button>
              <Button
                onClick={() => generateData("tickets", 10)}
                disabled={isLoading}
              >
                Generate 10 Tickets
              </Button>
              <Button
                onClick={() => sendToHubSpot("tickets")}
                disabled={isLoading || tickets.length === 0 || !isConfigured}
                variant="outline"
              >
                {isLoading ? "Sending..." : "Send to HubSpot"}
              </Button>
            </div>
            <DataDisplay data={tickets} type="tickets" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
