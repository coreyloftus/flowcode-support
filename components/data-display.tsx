import { Contact, Company, Ticket } from "@/lib/faker-data";

interface DataDisplayProps {
  data: Contact[] | Company[] | Ticket[];
  type: "contacts" | "companies" | "tickets";
}

export function DataDisplay({ data, type }: DataDisplayProps) {
  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
        No {type} generated yet. Click &quot;Generate Data&quot; to create some!
      </div>
    );
  }

  const renderContactRow = (contact: Contact) => (
    <tr key={contact.id} style={{ borderBottom: "1px solid #4b5563" }}>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        {contact.firstname} {contact.lastname}
      </td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>{contact.email}</td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>{contact.company}</td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>{contact.jobtitle}</td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>{contact.phone}</td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        {contact.city}, {contact.state}
      </td>
    </tr>
  );

  const renderCompanyRow = (company: Company) => (
    <tr key={company.id} style={{ borderBottom: "1px solid #4b5563" }}>
      <td style={{ padding: "24px", color: "#d1d5db" }}>{company.name}</td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>{company.domain}</td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>{company.industry}</td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        {company.numberofemployees}
      </td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        ${company.annualrevenue.toLocaleString()}
      </td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        {company.city}, {company.state}
      </td>
    </tr>
  );

  const renderTicketRow = (ticket: Ticket) => (
    <tr key={ticket.id} style={{ borderBottom: "1px solid #4b5563" }}>
      <td style={{ padding: "24px", color: "#d1d5db" }}>{ticket.subject}</td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        {ticket.hs_ticket_priority}
      </td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        {ticket.hs_ticket_category}
      </td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        {ticket.hs_ticket_source}
      </td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        {ticket.hs_pipeline_stage}
      </td>
      <td style={{ padding: "24px", color: "#d1d5db" }}>
        {ticket.hs_ticket_owner_id}
      </td>
    </tr>
  );

  const getHeaders = () => {
    switch (type) {
      case "contacts":
        return ["Name", "Email", "Company", "Job Title", "Phone", "Location"];
      case "companies":
        return [
          "Name",
          "Domain",
          "Industry",
          "Employees",
          "Annual Revenue",
          "Location",
        ];
      case "tickets":
        return [
          "Subject",
          "Priority",
          "Category",
          "Source",
          "Pipeline Stage",
          "Owner ID",
        ];
      default:
        return [];
    }
  };

  const renderRow = (item: Contact | Company | Ticket) => {
    switch (type) {
      case "contacts":
        return renderContactRow(item as Contact);
      case "companies":
        return renderCompanyRow(item as Company);
      case "tickets":
        return renderTicketRow(item as Ticket);
      default:
        return null;
    }
  };

  return (
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
            {getHeaders().map((header) => (
              <th
                key={header}
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
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ borderTop: "1px solid #4b5563" }}>
          {data.map(renderRow)}
        </tbody>
      </table>
      <div style={{ marginTop: "16px", fontSize: "14px", color: "#9ca3af" }}>
        Total {type}: {data.length}
      </div>
    </div>
  );
}
