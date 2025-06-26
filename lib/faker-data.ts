import { faker } from "@faker-js/faker";

export interface Contact {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  company: string;
  jobtitle: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  website: string;
  // lifecycle_stage: string;
  // lead_status: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  website: string;
  industry: string;
  description: string;
  numberofemployees: number;
  annualrevenue: number;
}

export interface Ticket {
  id: string;
  subject: string;
  content: string;
  hs_ticket_priority: string;
  hs_ticket_category: string;
  hs_ticket_owner_id: string;
  hs_pipeline: string;
  hs_pipeline_stage: string;
  hs_ticket_source: string;
  hs_ticket_type: string;
}

export function generateContact(): Contact {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    jobtitle: faker.person.jobTitle(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
    country: faker.location.country(),
    website: faker.internet.url(),
    // lifecycle_stage: faker.helpers.arrayElement([
    //   "lead",
    //   "marketingqualifiedlead",
    //   "salesqualifiedlead",
    //   "opportunity",
    //   "customer",
    //   "evangelist",
    //   "other",
    // ]),
    // lead_status: faker.helpers.arrayElement([
    //   "new",
    //   "open",
    //   "inprogress",
    //   "open",
    //   "unqualified",
    //   "qualified",
    //   "recycledlead",
    //   "disqualified",
    // ]),
  };
}

export function generateCompany(): Company {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    domain: faker.internet.domainName(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
    country: faker.location.country(),
    website: faker.internet.url(),
    industry: faker.helpers.arrayElement([
      "technology",
      "healthcare",
      "finance",
      "education",
      "retail",
      "manufacturing",
      "consulting",
      "real_estate",
    ]),
    description: faker.company.catchPhrase(),
    numberofemployees: faker.number.int({ min: 1, max: 10000 }),
    annualrevenue: faker.number.int({ min: 10000, max: 1000000000 }),
  };
}

export function generateTicket(): Ticket {
  return {
    id: faker.string.uuid(),
    subject: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    hs_ticket_priority: faker.helpers.arrayElement([
      "low",
      "medium",
      "high",
      "urgent",
    ]),
    hs_ticket_category: faker.helpers.arrayElement([
      "general",
      "technical",
      "billing",
      "feature_request",
      "bug_report",
    ]),
    hs_ticket_owner_id: faker.string.numeric(6),
    hs_pipeline: "0",
    hs_pipeline_stage: faker.helpers.arrayElement([
      "open",
      "waiting_on_customer",
      "waiting_on_third_party",
      "closed",
    ]),
    hs_ticket_source: faker.helpers.arrayElement([
      "email",
      "chat",
      "phone",
      "web_form",
      "social_media",
    ]),
    hs_ticket_type: faker.helpers.arrayElement([
      "question",
      "bug",
      "feature_request",
      "complaint",
      "compliment",
    ]),
  };
}

export function generateContacts(count: number): Contact[] {
  return Array.from({ length: count }, () => generateContact());
}

export function generateCompanies(count: number): Company[] {
  return Array.from({ length: count }, () => generateCompany());
}

export function generateTickets(count: number): Ticket[] {
  return Array.from({ length: count }, () => generateTicket());
}
