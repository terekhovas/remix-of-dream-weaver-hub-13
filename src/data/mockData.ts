// Property management mock data

const streetNames = [
  "Ερμού", "Σταδίου", "Πανεπιστημίου", "Ακαδημίας", "Βασιλίσσης Σοφίας",
  "Πατησίων", "Αλεξάνδρας", "Κηφισίας", "Βουλιαγμένης", "Συγγρού",
  "Μεσογείων", "Ιπποκράτους", "Σόλωνος", "Χαριλάου Τρικούπη", "Θεμιστοκλέους",
  "Μαυρομιχάλη", "Ασκληπιού", "Λυκαβηττού", "Κολοκοτρώνη", "Αιόλου",
];

const cities = ["Athens", "Thessaloniki", "Piraeus", "Glyfada", "Kifisia", "Marousi", "Voula", "Chalandri", "Kolonaki", "Pagrati"];
const postcodes = ["10563", "54624", "18533", "16675", "14562", "15122", "16673", "15233", "10673", "11635"];

const firstNames = ["Γιώργος", "Μαρία", "Δημήτρης", "Ελένη", "Νίκος", "Αικατερίνη", "Κώστας", "Σοφία", "Αλέξανδρος", "Χριστίνα", "Παναγιώτης", "Αναστασία", "Ιωάννης", "Βασιλική", "Μιχάλης", "Δέσποινα", "Σπύρος", "Ευαγγελία", "Θεόδωρος", "Φωτεινή"];
const lastNames = ["Παπαδόπουλος", "Βασιλείου", "Αντωνίου", "Γεωργίου", "Νικολάου", "Κωνσταντίνου", "Δημητρίου", "Ιωάννου", "Χριστοδούλου", "Αθανασίου", "Μαρκόπουλος", "Καραγιάννης", "Σταυρόπουλος", "Λιάκος", "Μπακόπουλος", "Τσαούσης", "Ρήγας", "Κατσαρός", "Μπαλάφας", "Δαλιάνης"];

const electricityCompanies = ["ΔΕΗ", "Energa", "Protergia", "Elpedison", "Watt+Volt", "Zenith", "NRG"];
const waterCompanies = ["ΕΥΔΑΠ"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startYear: number, endYear: number): string {
  const year = randomInt(startYear, endYear);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generateTenant() {
  const firstName = randomFrom(firstNames);
  const lastName = randomFrom(lastNames);
  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `69${randomInt(10, 99)} ${randomInt(100, 999)} ${randomInt(1000, 9999)}`,
  };
}

export type KeyHolder = "tenant" | "landlord" | "agent";
export type UtilityTransferStatus = "transferred" | "not-transferred";
export type ServiceChargeStatus = "paid" | "outstanding" | "n/a";
export type CertificateStatus = "valid" | "expiring" | "expired";
export type DepositStatus = "held" | "returned";
export type PaymentPunctuality = "green" | "yellow" | "red";
export type ManagementAgreementType =
  | "sublease-guaranteed"
  | "sublease-no-guarantee"
  | "mgmt-collect-rent"
  | "mgmt-owner-collects";

export interface Landlord {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface ManagementAgreementDetails {
  type: ManagementAgreementType;
  startDate: string;
  endDate: string;
  landlord: Landlord;
  guaranteedRent?: number; // for sublease-guaranteed
  ownerPayment?: number;   // for mgmt-collect-rent (we collect, pay owner)
  commissionPercent?: number; // for mgmt-owner-collects & sublease-no-guarantee
  documentAttached: boolean;
}

export interface PriceAdjustment {
  date: string;
  price: number;
  reason?: string;
}

export interface PropertySpecs {
  squareMeters: number;
  floor: string;
  bedrooms: number;
  bathrooms: number;
  wcs: number;
  yearBuilt: number;
  yearRenovated?: number;
  waterMeterNumber: string;
  electricityMeterNumber: string;
  rentIncludesBills: boolean;
  furnishingPdfName: string;
  photos: string[];
  lat: number;
  lng: number;
}

export interface Tenant {
  name: string;
  email: string;
  phone: string;
}

export interface Tenancy {
  tenant: Tenant;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  cpiIndexed: boolean;
  agreementAttached: boolean;
  isFuture?: boolean;
}

export interface Certificate {
  type: string;
  label: string;
  status: CertificateStatus;
  validUntil: string;
  rating?: string;
  attachmentName?: string;
}

export interface UtilityDetail {
  type: "electricity" | "water" | "internet";
  provider: string;
  transferStatus: UtilityTransferStatus;
  transferDate?: string;
  transferProofAttached?: boolean;
  monthlyAmount: number;
  payments: { month: string; paid: boolean; proofAttached?: boolean }[];
  lastBillDate: string;
  meterNumber?: string;
  landlineNumber?: string;
  internetNumber?: string;
}

export interface ServiceChargeDetail {
  status: ServiceChargeStatus;
  annualAmount: number;
  payments: { month: string; paid: boolean; proofAttached?: boolean }[];
  buildingManager?: { name: string; phone: string; email: string };
}

export interface CommunicationLog {
  date: string;
  type: "whatsapp" | "phone" | "email" | "in-person" | "maintenance";
  summary: string;
  author: string;
  description?: string;
  agreedSteps?: string;
}

export interface Agent {
  name: string;
  company: string;
  phone: string;
  email: string;
  feePercent: number;
  contractAttached: boolean;
}

export interface ListingKPIs {
  views: number;
  calls: number;
  viewings: number;
  inquiries: number;
}

export interface VacantListing {
  listingUrl: string;
  isLive: boolean;
  photos: string[];
  agents: Agent[];
  kpis: ListingKPIs;
}

export interface DepositReturn {
  bankReference: string;
  transferDate: string;
  authorizedBy: string;
  proofAttached: boolean;
}

export interface ArrearsStage {
  stage: "D1" | "D7" | "D30";
  active: boolean;
  smsTriggered?: boolean;
  emailTriggered?: boolean;
  callMade?: boolean;
  formalNotice?: boolean;
  lawyerNotified?: boolean;
  evictionInitiated?: boolean;
}

export interface InvestmentData {
  purchasePrice: number;
  capex: number;
  debt: number;
  debtTerms?: string;
  excelModelUrl?: string;
  netYield: number;
  grossYield: number;
  irrWithFinance: number;
  irrWithoutFinance: number;
}

export interface OccupancyEntry {
  month: string;
  year: number;
  occupied: boolean;
  tenantName?: string;
  tenancyStart?: string;
  tenancyEnd?: string;
  monthlyRent?: number;
}

export interface MarketData {
  marketRent: number;
  actualRent: number;
  source: string;
  lastUpdated: string;
}

export interface MaintenanceItem {
  description: string;
  reportDate: string;
  resolveDate?: string;
  cost: number;
  resolutionDays: number;
  propertyManager: string;
  notes?: string;
}

export interface PeriodicalCheck {
  date: string;
  propertyManager: string;
  status: "completed" | "scheduled";
  comments?: string;
  photos: number;
  nextCheckDate: string;
}

export interface PayoutEntry {
  month: string;
  year: number;
  collectedRent: number;
  fee: number;
  payout: number;
  paid: boolean;
  paidDate?: string;
  paymentRef?: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  postcode: string;
  status: "let" | "vacant";
  propertyManager: string;
  vacantSinceDate?: string;
  // Project grouping
  projectId?: string;
  projectName?: string;
  apartmentLabel?: string;
  // Specs
  specs: PropertySpecs;
  // Tax & landlord
  landlordTaxId?: string; // 9-digit AFM
  landlord: Landlord;
  // PMC fee
  pmcFeePercent: number; // 10 or 15
  // Tenant payment punctuality
  paymentPunctuality?: PaymentPunctuality;
  // Price adjustment log (vacant)
  priceAdjustments?: PriceAdjustment[];
  deposit: {
    status: DepositStatus;
    amount: number;
    datePaid?: string;
    dueDate?: string;
    heldAt?: string;
    paymentRef?: string;
    proofAttached?: boolean;
    returnDetails?: DepositReturn;
  };
  keys: {
    tenant: boolean;
    landlord: boolean;
    agent: boolean;
    givenDates: { holder: KeyHolder; date: string; location?: string }[];
  };
  utilities: {
    electricity: UtilityTransferStatus;
    water: UtilityTransferStatus;
    internet: UtilityTransferStatus;
  };
  utilityDetails: UtilityDetail[];
  serviceCharges: ServiceChargeDetail;
  currentTenancy: Tenancy | null;
  futureTenancy?: Tenancy | null;
  previousTenancies: Tenancy[];
  certificates: Certificate[];
  communicationLogs: CommunicationLog[];
  vacantListing?: VacantListing;
  arrearsStages?: ArrearsStage[];
  rentPaymentDay: number;
  rentHistory: { month: string; year: number; amount: number; paid: boolean; paidDate?: string }[];
  investment: InvestmentData;
  occupancy: OccupancyEntry[];
  marketData: MarketData;
  maintenanceItems?: MaintenanceItem[];
  periodicalChecks?: PeriodicalCheck[];
  managementAgreement: ManagementAgreementDetails;
  payoutHistory?: PayoutEntry[];
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthsUpper = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

function generatePayments(): { month: string; paid: boolean }[] {
  const currentMonth = new Date().getMonth();
  return months.map((month, i) => ({
    month,
    paid: i <= currentMonth ? Math.random() > 0.15 : false,
  }));
}

function generateCertificates(): Certificate[] {
  const now = new Date();
  const twoMonthsFromNow = new Date(now);
  twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

  const ydhDate = randomDate(2024, 2029);
  const peaDate = randomDate(2025, 2035);

  function getStatus(dateStr: string): CertificateStatus {
    const d = new Date(dateStr);
    if (d < now) return "expired";
    if (d < twoMonthsFromNow) return "expiring";
    return "valid";
  }

  return [
    { type: "ΥΔΗ", label: "Υπεύθυνη Δήλωση Ηλεκτρολόγου", status: getStatus(ydhDate), validUntil: ydhDate, attachmentName: "ydh_certificate.pdf" },
    { type: "ΠΕΑ", label: "Πιστοποιητικό Ενεργειακής Απόδοσης", status: getStatus(peaDate), validUntil: peaDate, rating: randomFrom(["Α", "Β+", "Β", "Γ", "Δ", "Ε"]), attachmentName: "pea_certificate.pdf" },
  ];
}

function generateCommunicationLogs(): CommunicationLog[] {
  const logCount = randomInt(2, 8);
  const types: CommunicationLog["type"][] = ["whatsapp", "phone", "email", "in-person", "maintenance"];
  const logTemplates = [
    { summary: "Discussed rent payment schedule", description: "Tenant called to discuss the upcoming rent payment. He mentioned a possible delay of 3 days due to payroll processing. We reviewed the payment terms and agreed on a grace period.", agreedSteps: "Tenant to make payment by the 5th. PM to follow up if not received." },
    { summary: "Reported leaking tap in kitchen", description: "Tenant reported a persistent drip from the kitchen mixer tap. Water is leaking from the base when turned on. Photos were shared via WhatsApp showing the issue.", agreedSteps: "Plumber to visit within 48 hours. Tenant to be home between 10-12. PM to confirm appointment." },
    { summary: "Requested permission for redecorating", description: "Tenant requested approval to repaint the bedroom in a light grey colour. Current walls have minor scuffs. Tenant will use a professional painter.", agreedSteps: "Landlord approval pending. PM to respond within 5 working days with conditions." },
    { summary: "Confirmed boiler service appointment", description: "Annual boiler servicing confirmed with the approved contractor. Tenant was informed of the date and time window. Access arrangements confirmed.", agreedSteps: "Contractor visits on the confirmed date. PM to collect service report and update records." },
    { summary: "Follow-up on maintenance request", description: "Called tenant to follow up on the previously reported issue with the bathroom extractor fan. Contractor visited last week and replaced the motor.", agreedSteps: "Tenant confirms the fan is working properly. No further action required. Case closed." },
    { summary: "Quarterly property inspection completed", description: "Conducted quarterly inspection of the property. Overall condition is satisfactory. Minor wear noted on the hallway flooring. All appliances in working order.", agreedSteps: "Report to be filed. Hallway flooring to be monitored at next inspection. No immediate action needed." },
    { summary: "Discussed tenancy renewal options", description: "Met with tenant to discuss renewal of the tenancy agreement expiring in 2 months. Tenant expressed interest in a 2-year renewal. Discussed potential CPI rent adjustment.", agreedSteps: "PM to prepare renewal offer with updated rent. Tenant to respond within 14 days." },
    { summary: "Reported noise complaint from neighbours", description: "Received a complaint from the downstairs neighbour about noise during late hours. Discussed the issue with the tenant who acknowledged the situation.", agreedSteps: "Tenant agreed to be more mindful of noise after 22:00. PM to monitor the situation over the next 30 days." },
  ];
  const authors = ["Γιάννης (PM)", "Μαρία (PM)", "Νίκος (PM)", "Admin"];

  return Array.from({ length: logCount }, () => {
    const template = randomFrom(logTemplates);
    return {
      date: randomDate(2024, 2026),
      type: randomFrom(types),
      summary: template.summary,
      description: template.description,
      agreedSteps: template.agreedSteps,
      author: randomFrom(authors),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateOccupancy(isLet: boolean, currentTenancy: Tenancy | null, futureTenancy?: Tenancy | null): OccupancyEntry[] {
  const entries: OccupancyEntry[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  for (let yr = 2024; yr <= 2027; yr++) {
    for (let m = 0; m < 12; m++) {
      let occupied = false;
      let tenantName: string | undefined;
      let tenancyStart: string | undefined;
      let tenancyEnd: string | undefined;
      let monthlyRent: number | undefined;

      if (currentTenancy) {
        const start = new Date(currentTenancy.startDate);
        const end = new Date(currentTenancy.endDate);
        const monthDate = new Date(yr, m);
        if (monthDate >= new Date(start.getFullYear(), start.getMonth()) && monthDate <= new Date(end.getFullYear(), end.getMonth())) {
          occupied = true;
          tenantName = currentTenancy.tenant.name;
          tenancyStart = currentTenancy.startDate;
          tenancyEnd = currentTenancy.endDate;
          monthlyRent = currentTenancy.monthlyRent;
        }
      }

      if (!occupied && futureTenancy) {
        const start = new Date(futureTenancy.startDate);
        const end = new Date(futureTenancy.endDate);
        const monthDate = new Date(yr, m);
        if (monthDate >= new Date(start.getFullYear(), start.getMonth()) && monthDate <= new Date(end.getFullYear(), end.getMonth())) {
          occupied = true;
          tenantName = futureTenancy.tenant.name;
          tenancyStart = futureTenancy.startDate;
          tenancyEnd = futureTenancy.endDate;
          monthlyRent = futureTenancy.monthlyRent;
        }
      }

      entries.push({
        month: months[m],
        year: yr,
        occupied,
        tenantName,
        tenancyStart,
        tenancyEnd,
        monthlyRent,
      });
    }
  }
  return entries;
}

function generateAfm(): string {
  let s = "";
  for (let i = 0; i < 9; i++) s += randomInt(0, 9);
  return s;
}

function generateLandlord(): Landlord {
  const fn = randomFrom(firstNames);
  const ln = randomFrom(lastNames);
  return {
    name: `${fn} ${ln}`,
    phone: `69${randomInt(10, 99)} ${randomInt(100, 999)} ${randomInt(1000, 9999)}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@landlord.gr`,
    address: `${randomInt(1, 200)} ${randomFrom(streetNames)}, ${randomFrom(cities)}`,
  };
}

function generateSpecs(seed: number): PropertySpecs {
  const beds = randomInt(1, 4);
  return {
    squareMeters: randomInt(40, 180),
    floor: randomFrom(["Ground", "1st", "2nd", "3rd", "4th", "5th", "6th"]),
    bedrooms: beds,
    bathrooms: randomInt(1, Math.max(1, beds - 1)),
    wcs: randomInt(1, 2),
    yearBuilt: randomInt(1960, 2020),
    yearRenovated: Math.random() > 0.4 ? randomInt(2018, 2024) : undefined,
    waterMeterNumber: `W-${randomInt(100000, 999999)}`,
    electricityMeterNumber: `E-${randomInt(1000000, 9999999)}`,
    rentIncludesBills: Math.random() > 0.6,
    furnishingPdfName: "furnishing_inventory.pdf",
    photos: Array.from({ length: 6 }, (_, j) => `https://picsum.photos/seed/spec-${seed}-${j}/800/600`),
    lat: 37.98 + (Math.random() - 0.5) * 0.1,
    lng: 23.72 + (Math.random() - 0.5) * 0.1,
  };
}

const mgmtTypes: ManagementAgreementType[] = ["sublease-guaranteed", "sublease-no-guarantee", "mgmt-collect-rent", "mgmt-owner-collects"];

function buildPropertyCore(opts: {
  index: number;
  id: string;
  address: string;
  city: string;
  postcode: string;
  projectId?: string;
  projectName?: string;
  apartmentLabel?: string;
  forceLet?: boolean;
}): Property {
  const i = opts.index;
  const isLet = opts.forceLet !== undefined ? opts.forceLet : Math.random() > 0.15;

  const currentTenancy: Tenancy | null = isLet ? {
    tenant: generateTenant(),
    startDate: randomDate(2023, 2025),
    endDate: randomDate(2025, 2027),
    monthlyRent: randomInt(4, 20) * 100,
    cpiIndexed: Math.random() > 0.5,
    agreementAttached: Math.random() > 0.3,
  } : null;

  const hasFutureTenancy = !isLet && Math.random() > 0.5;
  const futureTenancy: Tenancy | null = hasFutureTenancy ? {
    tenant: generateTenant(),
    startDate: randomDate(2026, 2026),
    endDate: randomDate(2027, 2028),
    monthlyRent: randomInt(5, 20) * 100,
    cpiIndexed: Math.random() > 0.5,
    agreementAttached: false,
    isFuture: true,
  } : null;

  const prevCount = randomInt(0, 4);
  const previousTenancies: Tenancy[] = Array.from({ length: prevCount }, () => ({
    tenant: generateTenant(),
    startDate: randomDate(2018, 2022),
    endDate: randomDate(2022, 2024),
    monthlyRent: randomInt(4, 18) * 100,
    cpiIndexed: Math.random() > 0.5,
    agreementAttached: Math.random() > 0.5,
  }));

  const keysConfig = {
    tenant: isLet ? Math.random() > 0.2 : false,
    landlord: Math.random() > 0.3,
    agent: Math.random() > 0.4,
    givenDates: [] as { holder: KeyHolder; date: string; location?: string }[],
  };
  if (keysConfig.tenant) keysConfig.givenDates.push({ holder: "tenant", date: randomDate(2023, 2025) });
  if (keysConfig.landlord) keysConfig.givenDates.push({ holder: "landlord", date: randomDate(2022, 2025), location: randomFrom(["Office safe", "Key room", "Reception desk"]) });
  if (keysConfig.agent) keysConfig.givenDates.push({ holder: "agent", date: randomDate(2023, 2025) });

  const elecTransfer: UtilityTransferStatus = isLet ? (Math.random() > 0.2 ? "transferred" : "not-transferred") : "not-transferred";
  const waterTransfer: UtilityTransferStatus = isLet ? (Math.random() > 0.2 ? "transferred" : "not-transferred") : "not-transferred";
  const internetTransfer: UtilityTransferStatus = isLet ? (Math.random() > 0.3 ? "transferred" : "not-transferred") : "not-transferred";

  const scRandom = Math.random();
  const scStatus: ServiceChargeStatus = scRandom > 0.6 ? "paid" : scRandom > 0.2 ? "outstanding" : "n/a";

  const depositStatus: DepositStatus = isLet ? "held" : (Math.random() > 0.5 ? "held" : "returned");
  const depositProofAttached = Math.random() > 0.3; // some held but missing proof
  const depositReturnDetails: DepositReturn | undefined = depositStatus === "returned" ? {
    bankReference: `REF-${randomInt(100000, 999999)}`,
    transferDate: randomDate(2024, 2025),
    authorizedBy: randomFrom(["Γιάννης Σταυρόπουλος - Head of PM", "Μαρία Αντωνίου - Head of PM", "Νίκος Παπαδόπουλος - Head of PM"]),
    proofAttached: Math.random() > 0.3,
  } : undefined;

  const vacantListing: VacantListing | undefined = !isLet ? {
    listingUrl: `https://www.spitogatos.gr/property-${randomInt(10000, 99999)}`,
    isLive: Math.random() > 0.3,
    photos: Array.from({ length: randomInt(3, 8) }, (_, j) => `https://picsum.photos/seed/${i * 10 + j}/800/600`),
    agents: Array.from({ length: randomInt(1, 3) }, () => ({
      name: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
      company: randomFrom(["RE/MAX", "Engel & Völkers", "Sotheby's", "Century 21", "Coldwell Banker", "Akireal"]),
      phone: `69${randomInt(10, 99)} ${randomInt(100, 999)} ${randomInt(1000, 9999)}`,
      email: `agent${randomInt(1, 99)}@${randomFrom(["remax", "engelvoelkers", "century21"])}.gr`,
      feePercent: randomFrom([1, 1.2, 1.5, 2, 2.5]),
      contractAttached: Math.random() > 0.3,
    })),
    kpis: {
      views: randomInt(50, 2500),
      calls: randomInt(2, 45),
      viewings: randomInt(0, 15),
      inquiries: randomInt(5, 80),
    },
  } : undefined;

  const rentPaymentDay = randomFrom([1, 5, 10, 15, 25]);
  const baseRent = currentTenancy?.monthlyRent || randomInt(4, 20) * 100;
  const cpiAnniversaryMonth = currentTenancy ? new Date(currentTenancy.startDate).getMonth() : randomInt(0, 11);
  const rentHistory: Property["rentHistory"] = [];
  let currentRent = baseRent;
  for (let yr = 2024; yr <= 2026; yr++) {
    for (let m = 0; m < 12; m++) {
      if (yr > 2024 && m === cpiAnniversaryMonth) {
        currentRent = Math.round(currentRent * 1.02);
      }
      const monthDate = new Date(yr, m);
      const now = new Date();
      const isPast = monthDate < now;
      const paid = isPast ? (isLet ? Math.random() > 0.1 : false) : false;
      rentHistory.push({
        month: months[m],
        year: yr,
        amount: currentRent,
        paid,
        paidDate: paid ? `${yr}-${String(m + 1).padStart(2, "0")}-${String(rentPaymentDay + randomInt(-2, 5)).padStart(2, "0")}` : undefined,
      });
    }
  }

  // Payment punctuality based on rent history
  let punctuality: PaymentPunctuality = "green";
  if (isLet) {
    const lateCount = randomInt(0, 5);
    if (lateCount === 0) punctuality = "green";
    else if (lateCount <= 2) punctuality = "yellow";
    else punctuality = "red";
  }

  const currentMonthIdx = new Date().getMonth();
  const currentYearRents = rentHistory.filter(r => r.year === 2025);
  const hasArrears = isLet && currentYearRents.some(r => !r.paid && months.indexOf(r.month) <= currentMonthIdx);
  const arrearsStages: ArrearsStage[] | undefined = hasArrears ? (() => {
    const dayOfMonth = new Date().getDate();
    const daysSincePayment = dayOfMonth - rentPaymentDay;
    return [
      { stage: "D1" as const, active: daysSincePayment >= 1, smsTriggered: daysSincePayment >= 1, emailTriggered: daysSincePayment >= 1 },
      { stage: "D7" as const, active: daysSincePayment >= 7, callMade: daysSincePayment >= 7 ? Math.random() > 0.3 : false, formalNotice: daysSincePayment >= 7 },
      { stage: "D30" as const, active: daysSincePayment >= 30, lawyerNotified: daysSincePayment >= 30 ? Math.random() > 0.5 : false, evictionInitiated: false },
    ];
  })() : undefined;

  const purchasePrice = randomInt(50, 500) * 1000;
  const capex = randomInt(5, 80) * 1000;
  const debt = Math.random() > 0.4 ? randomInt(30, 300) * 1000 : 0;
  const annualRent = baseRent * 12;
  const totalInvestment = purchasePrice + capex;
  const investment: InvestmentData = {
    purchasePrice,
    capex,
    debt,
    debtTerms: debt > 0 ? `${randomFrom([15, 20, 25, 30])}yr @ ${randomFrom([2.5, 3.0, 3.5, 4.0, 4.5])}%` : undefined,
    excelModelUrl: Math.random() > 0.4 ? `https://docs.google.com/spreadsheets/d/${randomInt(100000, 999999)}` : undefined,
    grossYield: parseFloat(((annualRent / purchasePrice) * 100).toFixed(1)),
    netYield: parseFloat(((annualRent * 0.75 / totalInvestment) * 100).toFixed(1)),
    irrWithFinance: parseFloat((randomInt(8, 18) + Math.random()).toFixed(1)),
    irrWithoutFinance: parseFloat((randomInt(4, 10) + Math.random()).toFixed(1)),
  };

  const marketRent = baseRent + randomInt(-200, 300);
  const marketData: MarketData = {
    marketRent: Math.max(300, marketRent),
    actualRent: baseRent,
    source: "spitogatos.gr",
    lastUpdated: randomDate(2025, 2026),
  };

  const occupancy = generateOccupancy(isLet, currentTenancy, futureTenancy);

  const pmNames = ["Γιάννης Σ.", "Μαρία Α.", "Νίκος Π.", "Ελένη Κ.", "Κώστας Δ."];
  const propertyManager = randomFrom(pmNames);

  const maintenanceDescriptions = [
    "Changed leaky pipe in bathroom", "Leak from the roof — waterproofing repair",
    "Broken window lock replacement", "Boiler servicing and repair",
    "Electrical socket replacement in kitchen", "Repainted living room walls",
    "Fixed broken door handle", "AC unit maintenance",
  ];
  const maintenanceItems: MaintenanceItem[] = Array.from({ length: randomInt(0, 4) }, () => ({
    description: randomFrom(maintenanceDescriptions),
    reportDate: randomDate(2024, 2025),
    resolveDate: Math.random() > 0.2 ? randomDate(2025, 2026) : undefined,
    cost: randomInt(50, 2000),
    resolutionDays: randomInt(1, 30),
    propertyManager,
    notes: Math.random() > 0.5 ? "Contractor handled on-site. Tenant notified." : undefined,
  }));

  const periodicalChecks: PeriodicalCheck[] = Array.from({ length: randomInt(1, 4) }, (_, j) => ({
    date: randomDate(2024, 2026),
    propertyManager,
    status: j === 0 ? "scheduled" as const : "completed" as const,
    comments: j > 0 ? randomFrom(["Property in good condition", "Minor wear on kitchen counter", "All appliances working", "Needs painting in hallway"]) : undefined,
    photos: j > 0 ? randomInt(3, 12) : 0,
    nextCheckDate: randomDate(2026, 2027),
  }));

  // Management agreement
  const mgmtType = randomFrom(mgmtTypes);
  const startBase = currentTenancy ? new Date(currentTenancy.startDate) : new Date(2024, randomInt(0, 11), randomInt(1, 28));
  const mgmtEnd = new Date(startBase);
  mgmtEnd.setFullYear(mgmtEnd.getFullYear() + 2);
  const landlord = generateLandlord();
  const pmcFeePercent = randomFrom([10, 15]);
  const managementAgreement: ManagementAgreementDetails = {
    type: mgmtType,
    startDate: startBase.toISOString().split("T")[0],
    endDate: mgmtEnd.toISOString().split("T")[0],
    landlord,
    guaranteedRent: mgmtType === "sublease-guaranteed" ? Math.round(baseRent * (0.85 + Math.random() * 0.1)) : undefined,
    ownerPayment: mgmtType === "mgmt-collect-rent" ? Math.round(baseRent * (1 - pmcFeePercent / 100)) : undefined,
    commissionPercent: (mgmtType === "mgmt-owner-collects" || mgmtType === "sublease-no-guarantee") ? pmcFeePercent : undefined,
    documentAttached: Math.random() > 0.2,
  };

  // Price adjustments (vacant)
  const priceAdjustments: PriceAdjustment[] | undefined = !isLet ? (() => {
    const count = randomInt(1, 4);
    const startPrice = randomInt(7, 15) * 100;
    const arr: PriceAdjustment[] = [];
    let cur = startPrice;
    for (let k = 0; k < count; k++) {
      arr.push({
        date: randomDate(2024, 2025),
        price: cur,
        reason: k === 0 ? "Initial listing price" : randomFrom(["Market adjustment", "Reduced due to low interest", "Repositioning"]),
      });
      cur = Math.round(cur * (0.93 + Math.random() * 0.04));
    }
    return arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })() : undefined;

  // Payout history
  const payoutHistory: PayoutEntry[] = rentHistory.map((r, idx) => {
    const fee = Math.round(r.amount * (pmcFeePercent / 100));
    const payout = r.amount - fee;
    const isPast = new Date(r.year, months.indexOf(r.month)) < new Date();
    const wasPaid = r.paid && Math.random() > 0.15;
    const monthIdx = months.indexOf(r.month);
    return {
      month: r.month,
      year: r.year,
      collectedRent: r.amount,
      fee,
      payout,
      paid: isPast && wasPaid,
      paidDate: isPast && wasPaid ? `${r.year}-${String(monthIdx + 1).padStart(2, "0")}-${String(rentPaymentDay + randomInt(2, 8)).padStart(2, "0")}` : undefined,
      paymentRef: isPast && wasPaid ? `${landlord.name.replace(/\s/g, "")}-${monthsUpper[monthIdx]}-${r.year}` : undefined,
    };
  });

  return {
    id: opts.id,
    address: opts.address,
    city: opts.city,
    postcode: opts.postcode,
    status: isLet ? "let" : "vacant",
    propertyManager,
    vacantSinceDate: !isLet ? randomDate(2024, 2025) : undefined,
    projectId: opts.projectId,
    projectName: opts.projectName,
    apartmentLabel: opts.apartmentLabel,
    specs: generateSpecs(i),
    landlordTaxId: generateAfm(),
    landlord,
    pmcFeePercent,
    paymentPunctuality: isLet ? punctuality : undefined,
    priceAdjustments,
    deposit: {
      status: depositStatus,
      amount: randomInt(4, 20) * 100,
      datePaid: randomDate(2022, 2025),
      dueDate: randomDate(2025, 2027),
      heldAt: randomFrom(["Company bank account", "Escrow account", "Trust account"]),
      paymentRef: `PAY-${randomInt(100000, 999999)}`,
      proofAttached: depositStatus === "held" ? depositProofAttached : true,
      returnDetails: depositReturnDetails,
    },
    keys: keysConfig,
    utilities: { electricity: elecTransfer, water: waterTransfer, internet: internetTransfer },
    utilityDetails: [
      {
        type: "electricity",
        provider: randomFrom(electricityCompanies),
        transferStatus: elecTransfer,
        transferDate: elecTransfer === "transferred" ? randomDate(2024, 2025) : undefined,
        transferProofAttached: elecTransfer === "transferred" ? Math.random() > 0.3 : false,
        monthlyAmount: randomInt(40, 150),
        payments: generatePayments().map(p => ({ ...p, proofAttached: p.paid && Math.random() > 0.2 })),
        lastBillDate: randomDate(2025, 2026),
        meterNumber: `E-${randomInt(1000000, 9999999)}`,
      },
      {
        type: "water",
        provider: randomFrom(waterCompanies),
        transferStatus: waterTransfer,
        transferDate: waterTransfer === "transferred" ? randomDate(2024, 2025) : undefined,
        transferProofAttached: waterTransfer === "transferred" ? Math.random() > 0.3 : false,
        monthlyAmount: randomInt(20, 80),
        payments: generatePayments().map(p => ({ ...p, proofAttached: p.paid && Math.random() > 0.2 })),
        lastBillDate: randomDate(2025, 2026),
        meterNumber: `W-${randomInt(100000, 999999)}`,
      },
      {
        type: "internet",
        provider: randomFrom(["Cosmote", "Vodafone", "Nova", "Wind"]),
        transferStatus: internetTransfer,
        transferDate: internetTransfer === "transferred" ? randomDate(2024, 2025) : undefined,
        transferProofAttached: internetTransfer === "transferred" ? Math.random() > 0.3 : false,
        monthlyAmount: randomInt(25, 50),
        payments: generatePayments().map(p => ({ ...p, proofAttached: p.paid && Math.random() > 0.2 })),
        lastBillDate: randomDate(2025, 2026),
        landlineNumber: `21${randomInt(0, 9)} ${randomInt(100, 999)} ${randomInt(1000, 9999)}`,
        internetNumber: `INT-${randomInt(100000, 999999)}`,
      },
    ],
    serviceCharges: {
      status: scStatus,
      annualAmount: scStatus === "n/a" ? 0 : randomInt(10, 50) * 100,
      payments: scStatus === "n/a" ? [] : generatePayments().map(p => ({ ...p, proofAttached: p.paid && Math.random() > 0.25 })),
      buildingManager: scStatus !== "n/a" ? {
        name: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
        phone: `69${randomInt(10, 99)} ${randomInt(100, 999)} ${randomInt(1000, 9999)}`,
        email: `bldg.mgr${randomInt(1, 99)}@buildings.gr`,
      } : undefined,
    },
    currentTenancy,
    futureTenancy,
    previousTenancies,
    certificates: generateCertificates(),
    communicationLogs: generateCommunicationLogs(),
    vacantListing,
    arrearsStages,
    rentPaymentDay,
    rentHistory,
    investment,
    occupancy,
    marketData,
    maintenanceItems,
    periodicalChecks,
    managementAgreement,
    payoutHistory,
  };
}

export function generateProperties(count: number = 100): Property[] {
  const standalone = Array.from({ length: count }, (_, i) => {
    const city = randomFrom(cities);
    const cityIndex = cities.indexOf(city);
    const streetNum = randomInt(1, 200);
    const street = randomFrom(streetNames);
    const flatNum = Math.random() > 0.5 ? `Διαμ. ${randomInt(1, 30)}, ` : "";
    return buildPropertyCore({
      index: i,
      id: `prop-${String(i + 1).padStart(3, "0")}`,
      address: `${flatNum}${streetNum} ${street}`,
      city,
      postcode: postcodes[cityIndex] || "10563",
    });
  });

  // Projects: 3 projects × 8 apartments
  const projectDefs = [
    { id: "proj-solonos", name: "Solonos", street: "Σόλωνος", num: 42, city: "Athens", postcode: "10673" },
    { id: "proj-anaxagora", name: "Anaxagora", street: "Αναξαγόρα", num: 18, city: "Athens", postcode: "10552" },
    { id: "proj-eth25", name: "ETH25", street: "Εθνικής Αντιστάσεως", num: 25, city: "Kallithea", postcode: "17672" },
  ];
  let propIdx = count;
  const projectProps: Property[] = [];
  projectDefs.forEach((proj, pi) => {
    for (let a = 1; a <= 8; a++) {
      propIdx++;
      projectProps.push(buildPropertyCore({
        index: propIdx,
        id: `${proj.id}-apt-${a}`,
        address: `${proj.num} ${proj.street} — Apt ${a}`,
        city: proj.city,
        postcode: proj.postcode,
        projectId: proj.id,
        projectName: proj.name,
        apartmentLabel: `Apartment ${a}`,
      }));
    }
  });

  return [...projectProps, ...standalone];
}

export const properties = generateProperties(100);

export interface ProjectGroup {
  id: string;
  name: string;
  city: string;
  apartments: Property[];
}

export function getProjectGroups(props: Property[]): ProjectGroup[] {
  const map = new Map<string, ProjectGroup>();
  for (const p of props) {
    if (!p.projectId) continue;
    if (!map.has(p.projectId)) {
      map.set(p.projectId, { id: p.projectId, name: p.projectName || p.projectId, city: p.city, apartments: [] });
    }
    map.get(p.projectId)!.apartments.push(p);
  }
  return Array.from(map.values());
}

export function getDashboardStats(props: Property[]) {
  const total = props.length;
  const occupied = props.filter(p => p.status === "let").length;
  const vacant = total - occupied;
  const occupancyRate = Math.round((occupied / total) * 100);

  const totalExpectedRent = props.reduce((sum, p) => sum + (p.currentTenancy?.monthlyRent || 0), 0);
  const collectedRent = Math.round(totalExpectedRent * (0.85 + Math.random() * 0.12));
  const collectionRate = Math.round((collectedRent / totalExpectedRent) * 100);
  const arrearsRate = 100 - collectionRate;
  const arrearsAmount = totalExpectedRent - collectedRent;

  const yearlyRevenue = collectedRent * 12;

  // Missed revenue: rent guarantee owed on vacant sublease-guaranteed properties
  const missedRevenueMonthly = props
    .filter(p => p.status === "vacant" && p.managementAgreement.type === "sublease-guaranteed")
    .reduce((s, p) => s + (p.managementAgreement.guaranteedRent || 0), 0);
  const missedRevenueYearly = missedRevenueMonthly * 12;

  // PMC revenue: pmcFeePercent of every let property's rent
  const pmcRevenueMonthly = props
    .filter(p => p.status === "let" && p.currentTenancy)
    .reduce((s, p) => s + Math.round((p.currentTenancy!.monthlyRent) * (p.pmcFeePercent / 100)), 0);
  const pmcRevenueYearly = pmcRevenueMonthly * 12;

  return {
    totalProperties: total,
    occupied,
    vacant,
    occupancyRate,
    monthlyRevenue: collectedRent,
    yearlyRevenue,
    totalExpectedRent,
    collectionRate,
    arrearsRate,
    arrearsAmount,
    missedRevenueMonthly,
    missedRevenueYearly,
    pmcRevenueMonthly,
    pmcRevenueYearly,
  };
}
