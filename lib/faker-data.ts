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
  // hs_ticket_type: string;
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
  // Generate realistic ticket content based on category and type
  const ticketType = faker.helpers.arrayElement([
    "question",
    "bug",
    "feature_request",
    "complaint",
    "compliment",
  ]);

  const ticketCategory = faker.helpers.arrayElement([
    "general",
    "technical",
    "billing",
    "feature_request",
    "bug_report",
  ]);

  const content = generateRealisticTicketContent(ticketType, ticketCategory);
  const subject = generateRealisticTicketSubject(ticketType, ticketCategory);

  return {
    id: faker.string.uuid(),
    subject: subject,
    content: content,
    hs_ticket_priority: faker.helpers.arrayElement([
      "low",
      "medium",
      "high",
      "urgent",
    ]),
    hs_ticket_category: ticketCategory,
    hs_ticket_owner_id: faker.string.numeric(6),
    hs_pipeline: "0",
    hs_pipeline_stage: "1",
    hs_ticket_source: faker.helpers.arrayElement([
      "email",
      "chat",
      "phone",
      "web_form",
      "social_media",
    ]),
    // hs_ticket_type: ticketType,
  };
}

function generateRealisticTicketContent(
  type: string,
  category: string
): string {
  const technicalIssues = [
    "I'm experiencing persistent error logs in my UI that I can't seem to resolve. The errors show 'Connection timeout' and 'Authentication failed' messages. I've tried restarting the service and clearing the cache, but the issue persists. Can you help me troubleshoot this?",

    "Our integration is failing with a 500 error when trying to sync data. I've checked the API documentation and our credentials are correct. The error occurs specifically when processing large datasets. We've tried reducing the batch size but it still fails. Any suggestions?",

    "The dashboard is showing incorrect metrics and the data seems to be stale. I've refreshed the page multiple times and cleared my browser cache, but the numbers don't update. This is affecting our reporting accuracy. Please investigate.",

    "I'm getting a 'Permission denied' error when trying to access certain features. I have admin privileges and this worked fine last week. I've tried logging out and back in, but the issue remains. What could be causing this?",

    "The system is running very slowly and sometimes times out completely. I've monitored the server resources and they seem normal. This started happening after the latest update. Can you check if there's a known issue?",

    "I'm seeing duplicate records being created in our database. This is causing data integrity issues. I've checked our sync settings and they look correct. How can we prevent this from happening?",

    "The API is returning inconsistent results. Sometimes it works fine, other times it returns empty responses. I've tested with different parameters and the behavior is unpredictable. This is affecting our production environment.",

    "I'm getting SSL certificate errors when trying to connect to the service. The certificate appears to be valid when I check it manually. This started happening after a recent server maintenance. Any ideas?",

    "The webhook notifications are not being delivered reliably. Some events are missing and others are delayed. I've verified our endpoint is working correctly. Can you check the webhook delivery system?",

    "I'm experiencing intermittent connectivity issues with the mobile app. It works fine on WiFi but fails on cellular networks. I've tested on multiple devices and carriers. Is this a known issue?",
  ];

  const billingIssues = [
    "I noticed an unexpected charge on my latest invoice. The amount doesn't match what I was quoted. I've reviewed my usage and it seems within normal limits. Can you help me understand this charge?",

    "I'm trying to update my billing information but the system won't accept my new credit card. I've verified the card details are correct and the card is active. What might be causing this issue?",

    "I received a payment failure notification but my payment method is current and has sufficient funds. I've tried updating the payment method but still get the same error. Can you investigate?",

    "I'm being charged for features I'm not using. I've reviewed my subscription and there are add-ons I didn't request. How can I remove these and get a refund for the unused period?",

    "The invoice I received doesn't include the discount I was promised. I have the email confirmation showing the promotional rate. Can you apply the correct pricing?",

    "I'm trying to cancel my subscription but the system keeps giving me an error. I've followed the cancellation process multiple times. Can you help me complete this?",

    "I was charged twice for the same service period. I can see two identical charges on my statement. Can you refund the duplicate charge?",

    "The pricing shown on your website doesn't match what I'm being charged. I signed up based on the advertised price but my invoice is higher. Can you explain the difference?",
  ];

  const featureRequests = [
    "I would love to see an export feature for our analytics data. Currently, we have to manually copy the data which is time-consuming. This would be very helpful for our reporting needs.",

    "Could you add support for custom webhooks? We need to integrate with our internal systems and having customizable webhook payloads would make this much easier.",

    "It would be great to have a bulk import feature for user data. We're migrating from another system and manually adding hundreds of users is not practical.",

    "I'd like to request a mobile app for iOS. Many of our team members work remotely and need access on their phones. The web version works but a native app would be much better.",

    "Could you add multi-language support? We have international users who would benefit from localized interfaces.",

    "I'd like to see more granular permission controls. Currently, users either have full access or very limited access. We need something in between.",

    "Could you add an API rate limiting feature? We want to prevent abuse of our API endpoints by implementing request throttling.",

    "I'd like to request a dark mode theme. Many of our users work in low-light environments and would appreciate this option.",
  ];

  const generalQuestions = [
    "I'm new to the platform and would like to know the best practices for setting up our first integration. What should I consider before getting started?",

    "Can you explain the difference between the different subscription tiers? I'm trying to choose the right plan for our needs.",

    "I'm having trouble understanding the documentation for the API. Could you provide some examples of common use cases?",

    "What's the recommended way to handle user authentication in our integration? I want to make sure we're following security best practices.",

    "I'm interested in the enterprise features but need more information about the implementation process. What does the onboarding look like?",

    "Can you help me understand the data retention policies? I need to know how long our data is stored and what happens when we cancel.",

    "I'm looking for training resources for my team. Do you offer any webinars or documentation for getting up to speed quickly?",

    "What's the typical response time for support requests? I want to set proper expectations with my team.",
  ];

  const complaints = [
    "I've been waiting for a response to my previous ticket for over a week. This is unacceptable for a paid service. I need immediate assistance.",

    "The system has been down for the past 3 hours and this is affecting our business operations. We're losing money every minute. When will this be resolved?",

    "I've contacted support multiple times about the same issue and keep getting different answers. This is frustrating and unprofessional.",

    "The recent update broke several features we rely on. We weren't notified about these changes and now our workflow is disrupted.",

    "The customer service I've received has been poor. Representatives don't seem to understand our technical requirements.",

    "The pricing changes were implemented without proper notice. This is a significant increase that we weren't prepared for.",

    "The system performance has degraded significantly over the past month. Response times are unacceptable for a business-critical application.",

    "I've been trying to get a simple question answered for days. The support process is too complicated and slow.",
  ];

  const compliments = [
    "I just wanted to say thank you for the excellent support I received last week. The team was knowledgeable and resolved my issue quickly.",

    "The new dashboard features are fantastic! They've made our workflow much more efficient. Great job on the implementation.",

    "I'm really impressed with the platform's reliability. We've been using it for 6 months now and haven't experienced any downtime.",

    "The documentation is very well written and easy to follow. It made our integration process much smoother than expected.",

    "Your customer service team is outstanding. They always go above and beyond to help us succeed.",

    "The recent update included exactly the features we were looking for. It's clear you listen to customer feedback.",

    "The API is very well designed and easy to work with. Our developers love how intuitive it is.",

    "I appreciate how responsive your team is to feature requests. It shows you care about your customers' needs.",
  ];

  // Select content based on type and category
  if (type === "bug" || category === "bug_report") {
    return faker.helpers.arrayElement(technicalIssues);
  } else if (category === "billing") {
    return faker.helpers.arrayElement(billingIssues);
  } else if (type === "feature_request" || category === "feature_request") {
    return faker.helpers.arrayElement(featureRequests);
  } else if (type === "complaint") {
    return faker.helpers.arrayElement(complaints);
  } else if (type === "compliment") {
    return faker.helpers.arrayElement(compliments);
  } else if (type === "question" || category === "general") {
    return faker.helpers.arrayElement(generalQuestions);
  } else {
    // Default to technical issues for technical category
    return faker.helpers.arrayElement(technicalIssues);
  }
}

function generateRealisticTicketSubject(
  type: string,
  category: string
): string {
  const technicalSubjects = [
    "Error logs showing connection timeout and authentication failures",
    "Integration failing with 500 error during data sync",
    "Dashboard showing incorrect and stale metrics",
    "Permission denied error when accessing features",
    "System running slowly and timing out",
    "Duplicate records being created in database",
    "API returning inconsistent results",
    "SSL certificate errors when connecting",
    "Webhook notifications not being delivered reliably",
    "Mobile app connectivity issues on cellular networks",
  ];

  const billingSubjects = [
    "Unexpected charge on latest invoice",
    "Unable to update billing information",
    "Payment failure notification despite valid payment method",
    "Being charged for unused features",
    "Invoice missing promised discount",
    "Unable to cancel subscription",
    "Duplicate charges for same service period",
    "Pricing discrepancy between website and invoice",
  ];

  const featureRequestSubjects = [
    "Request for analytics data export feature",
    "Need support for custom webhooks",
    "Request for bulk import feature for user data",
    "Request for iOS mobile app",
    "Request for multi-language support",
    "Request for more granular permission controls",
    "Request for API rate limiting feature",
    "Request for dark mode theme",
  ];

  const generalQuestionSubjects = [
    "Best practices for setting up first integration",
    "Understanding subscription tier differences",
    "API documentation clarification needed",
    "User authentication best practices",
    "Enterprise features implementation process",
    "Data retention policy clarification",
    "Training resources for team",
    "Typical support response time expectations",
  ];

  const complaintSubjects = [
    "No response to previous ticket for over a week",
    "System down for 3 hours affecting business operations",
    "Inconsistent answers from support team",
    "Recent update broke essential features",
    "Poor customer service experience",
    "Pricing changes implemented without notice",
    "System performance degradation over past month",
    "Complicated and slow support process",
  ];

  const complimentSubjects = [
    "Thank you for excellent support last week",
    "New dashboard features are fantastic",
    "Impressed with platform reliability",
    "Documentation is very well written",
    "Outstanding customer service team",
    "Recent update included requested features",
    "API is very well designed and intuitive",
    "Appreciate responsiveness to feature requests",
  ];

  // Select subject based on type and category
  if (type === "bug" || category === "bug_report") {
    return faker.helpers.arrayElement(technicalSubjects);
  } else if (category === "billing") {
    return faker.helpers.arrayElement(billingSubjects);
  } else if (type === "feature_request" || category === "feature_request") {
    return faker.helpers.arrayElement(featureRequestSubjects);
  } else if (type === "complaint") {
    return faker.helpers.arrayElement(complaintSubjects);
  } else if (type === "compliment") {
    return faker.helpers.arrayElement(complimentSubjects);
  } else if (type === "question" || category === "general") {
    return faker.helpers.arrayElement(generalQuestionSubjects);
  } else {
    // Default to technical subjects for technical category
    return faker.helpers.arrayElement(technicalSubjects);
  }
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
