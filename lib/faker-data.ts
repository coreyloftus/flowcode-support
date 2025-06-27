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

export interface Association {
  contactId: string;
  companyId: string;
}

// Helper function to generate realistic domain from company name
function generateDomainFromCompanyName(companyName: string): string {
  // Remove common words and special characters
  const cleanName = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\b(inc|corp|llc|ltd|company|co|and|the|&)\b/g, "") // Remove common business words
    .trim()
    .replace(/\s+/g, ""); // Remove spaces

  // If the name is too short, add some variation
  if (cleanName.length < 3) {
    return `${cleanName}${faker.string.alphanumeric(3)}.com`;
  }

  // Add common TLDs
  const tlds = [".com", ".net", ".org", ".co", ".io", ".tech", ".app"];
  const tld = faker.helpers.arrayElement(tlds);

  return `${cleanName}${tld}`;
}

// Helper function to generate email from name and domain
function generateEmailFromName(
  firstName: string,
  lastName: string,
  domain: string
): string {
  const emailFormats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}@${domain}`,
  ];

  return faker.helpers.arrayElement(emailFormats);
}

// Sample of realistic company names that could exist
const realisticCompanyNames = [
  "Acme Corporation",
  "TechFlow Solutions",
  "Global Innovations Inc",
  "Bright Future Technologies",
  "Peak Performance Systems",
  "NextGen Dynamics",
  "Strategic Partners Group",
  "Elite Business Solutions",
  "Innovation Labs",
  "Future Forward Consulting",
  "Digital Transformation Co",
  "Smart Solutions Hub",
  "Enterprise Excellence",
  "Visionary Ventures",
  "Progressive Systems",
  "Advanced Analytics Corp",
  "Creative Solutions Team",
  "Dynamic Development Group",
  "Strategic Solutions Inc",
  "Innovation Partners LLC",
];

export function generateContact(): Contact {
  // Generate a realistic company name
  const companyName = faker.helpers.arrayElement(realisticCompanyNames);
  const domain = generateDomainFromCompanyName(companyName);

  const firstname = faker.person.firstName();
  const lastname = faker.person.lastName();
  const email = generateEmailFromName(firstname, lastname, domain);

  return {
    id: faker.string.uuid(),
    email: email,
    firstname: firstname,
    lastname: lastname,
    phone: faker.phone.number(),
    company: companyName,
    jobtitle: faker.person.jobTitle(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
    country: faker.location.country(),
    website: `https://www.${domain}`,
  };
}

export function generateCompany(): Company {
  // Generate a realistic company name
  const companyName = faker.helpers.arrayElement(realisticCompanyNames);
  const domain = generateDomainFromCompanyName(companyName);

  return {
    id: faker.string.uuid(),
    name: companyName,
    domain: domain,
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
    country: faker.location.country(),
    website: `https://www.${domain}`,
    industry: faker.helpers.arrayElement([
      "ACCOUNTING",
      "AIRLINES_AVIATION",
      "ALTERNATIVE_DISPUTE_RESOLUTION",
      "ALTERNATIVE_MEDICINE",
      "ANIMATION",
      "APPAREL_FASHION",
      "ARCHITECTURE_PLANNING",
      "ARTS_AND_CRAFTS",
      "AUTOMOTIVE",
      "AVIATION_AEROSPACE",
      "BANKING",
      "BIOTECHNOLOGY",
      "BROADCAST_MEDIA",
      "BUILDING_MATERIALS",
      "BUSINESS_SUPPLIES_AND_EQUIPMENT",
      "CAPITAL_MARKETS",
      "CHEMICALS",
      "CIVIC_SOCIAL_ORGANIZATION",
      "CIVIL_ENGINEERING",
      "COMMERCIAL_REAL_ESTATE",
      "COMPUTER_NETWORK_SECURITY",
      "COMPUTER_GAMES",
      "COMPUTER_HARDWARE",
      "COMPUTER_NETWORKING",
      "COMPUTER_SOFTWARE",
      "INTERNET",
      "CONSTRUCTION",
      "CONSUMER_ELECTRONICS",
      "CONSUMER_GOODS",
      "CONSUMER_SERVICES",
      "COSMETICS",
      "DAIRY",
      "DEFENSE_SPACE",
      "DESIGN",
      "EDUCATION_MANAGEMENT",
      "E_LEARNING",
      "ELECTRICAL_ELECTRONIC_MANUFACTURING",
      "ENTERTAINMENT",
      "ENVIRONMENTAL_SERVICES",
      "EVENTS_SERVICES",
      "EXECUTIVE_OFFICE",
      "FACILITIES_SERVICES",
      "FARMING",
      "FINANCIAL_SERVICES",
      "FINE_ART",
      "FISHERY",
      "FOOD_BEVERAGES",
      "FOOD_PRODUCTION",
      "FUND_RAISING",
      "FURNITURE",
      "GAMBLING_CASINOS",
      "GLASS_CERAMICS_CONCRETE",
      "GOVERNMENT_ADMINISTRATION",
      "GOVERNMENT_RELATIONS",
      "GRAPHIC_DESIGN",
      "HEALTH_WELLNESS_AND_FITNESS",
      "HIGHER_EDUCATION",
      "HOSPITAL_HEALTH_CARE",
      "HOSPITALITY",
      "HUMAN_RESOURCES",
      "IMPORT_AND_EXPORT",
      "INDIVIDUAL_FAMILY_SERVICES",
      "INDUSTRIAL_AUTOMATION",
      "INFORMATION_SERVICES",
      "INFORMATION_TECHNOLOGY_AND_SERVICES",
      "INSURANCE",
      "INTERNATIONAL_AFFAIRS",
      "INTERNATIONAL_TRADE_AND_DEVELOPMENT",
      "INVESTMENT_BANKING",
      "INVESTMENT_MANAGEMENT",
      "JUDICIARY",
      "LAW_ENFORCEMENT",
      "LAW_PRACTICE",
      "LEGAL_SERVICES",
      "LEGISLATIVE_OFFICE",
      "LEISURE_TRAVEL_TOURISM",
      "LIBRARIES",
      "LOGISTICS_AND_SUPPLY_CHAIN",
      "LUXURY_GOODS_JEWELRY",
      "MACHINERY",
      "MANAGEMENT_CONSULTING",
      "MARITIME",
      "MARKET_RESEARCH",
      "MARKETING_AND_ADVERTISING",
      "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
      "MEDIA_PRODUCTION",
      "MEDICAL_DEVICES",
      "MEDICAL_PRACTICE",
      "MENTAL_HEALTH_CARE",
      "MILITARY",
      "MINING_METALS",
      "MOTION_PICTURES_AND_FILM",
      "MUSEUMS_AND_INSTITUTIONS",
      "MUSIC",
      "NANOTECHNOLOGY",
      "NEWSPAPERS",
      "NON_PROFIT_ORGANIZATION_MANAGEMENT",
      "OIL_ENERGY",
      "ONLINE_MEDIA",
      "OUTSOURCING_OFFSHORING",
      "PACKAGE_FREIGHT_DELIVERY",
      "PACKAGING_AND_CONTAINERS",
      "PAPER_FOREST_PRODUCTS",
      "PERFORMING_ARTS",
      "PHARMACEUTICALS",
      "PHILANTHROPY",
      "PHOTOGRAPHY",
      "PLASTICS",
      "POLITICAL_ORGANIZATION",
      "PRIMARY_SECONDARY_EDUCATION",
      "PRINTING",
      "PROFESSIONAL_TRAINING_COACHING",
      "PROGRAM_DEVELOPMENT",
      "PUBLIC_POLICY",
      "PUBLIC_RELATIONS_AND_COMMUNICATIONS",
      "PUBLIC_SAFETY",
      "PUBLISHING",
      "RAILROAD_MANUFACTURE",
      "RANCHING",
      "REAL_ESTATE",
      "RECREATIONAL_FACILITIES_AND_SERVICES",
      "RELIGIOUS_INSTITUTIONS",
      "RENEWABLES_ENVIRONMENT",
      "RESEARCH",
      "RESTAURANTS",
      "RETAIL",
      "SECURITY_AND_INVESTIGATIONS",
      "SEMICONDUCTORS",
      "SHIPBUILDING",
      "SPORTING_GOODS",
      "SPORTS",
      "STAFFING_AND_RECRUITING",
      "SUPERMARKETS",
      "TELECOMMUNICATIONS",
      "TEXTILES",
      "THINK_TANKS",
      "TOBACCO",
      "TRANSLATION_AND_LOCALIZATION",
      "TRANSPORTATION_TRUCKING_RAILROAD",
      "UTILITIES",
      "VENTURE_CAPITAL_PRIVATE_EQUITY",
      "VETERINARY",
      "WAREHOUSING",
      "WHOLESALE",
      "WINE_AND_SPIRITS",
      "WIRELESS",
      "WRITING_AND_EDITING",
      "MOBILE_GAMES",
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

export function generateAssociations(
  contacts: Contact[],
  companies: Company[],
  count: number
): Association[] {
  if (contacts.length === 0 || companies.length === 0) {
    return [];
  }

  const associations: Association[] = [];
  const maxAssociations = Math.min(count, contacts.length, companies.length);

  for (let i = 0; i < maxAssociations; i++) {
    associations.push({
      contactId: contacts[i].id,
      companyId: companies[i].id,
    });
  }

  return associations;
}
