import { Contact, Company, Ticket } from "@/lib/faker-data";

interface DataDisplayProps {
  data: Contact[] | Company[] | Ticket[];
  type: "contacts" | "companies" | "tickets";
}

export function DataDisplay({ data, type }: DataDisplayProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No {type} generated yet. Click "Generate Data" to create some!
      </div>
    );
  }

  const renderContactRow = (contact: Contact) => (
    <tr key={contact.id} className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">
        {contact.firstname} {contact.lastname}
      </td>
      <td className="px-4 py-2">{contact.email}</td>
      <td className="px-4 py-2">{contact.company}</td>
      <td className="px-4 py-2">{contact.jobtitle}</td>
      <td className="px-4 py-2">{contact.phone}</td>
      <td className="px-4 py-2">{contact.lifecycle_stage}</td>
    </tr>
  );

  const renderCompanyRow = (company: Company) => (
    <tr key={company.id} className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">{company.name}</td>
      <td className="px-4 py-2">{company.domain}</td>
      <td className="px-4 py-2">{company.industry}</td>
      <td className="px-4 py-2">{company.numberofemployees}</td>
      <td className="px-4 py-2">${company.annualrevenue.toLocaleString()}</td>
      <td className="px-4 py-2">
        {company.city}, {company.state}
      </td>
    </tr>
  );

  const renderTicketRow = (ticket: Ticket) => (
    <tr key={ticket.id} className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">{ticket.subject}</td>
      <td className="px-4 py-2">{ticket.hs_ticket_priority}</td>
      <td className="px-4 py-2">{ticket.hs_ticket_category}</td>
      <td className="px-4 py-2">{ticket.hs_ticket_type}</td>
      <td className="px-4 py-2">{ticket.hs_pipeline_stage}</td>
      <td className="px-4 py-2">{ticket.hs_ticket_source}</td>
    </tr>
  );

  const getHeaders = () => {
    switch (type) {
      case "contacts":
        return [
          "Name",
          "Email",
          "Company",
          "Job Title",
          "Phone",
          "Lifecycle Stage",
        ];
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
        return ["Subject", "Priority", "Category", "Type", "Stage", "Source"];
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
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {getHeaders().map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map(renderRow)}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-600">
        Total {type}: {data.length}
      </div>
    </div>
  );
}
