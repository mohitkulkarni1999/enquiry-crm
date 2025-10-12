// Property Types
export const PROPERTY_TYPES = [
  { value: '1rk', label: '1 RK (Room + Kitchen)' },
  { value: '1bhk', label: '1 BHK (1 Bedroom + Hall + Kitchen)' },
  { value: '1.5bhk', label: '1.5 BHK (1 Bedroom + Study + Hall + Kitchen)' },
  { value: '2bhk', label: '2 BHK (2 Bedroom + Hall + Kitchen)' },
  { value: '2.5bhk', label: '2.5 BHK (2 Bedroom + Study + Hall + Kitchen)' },
  { value: '3bhk', label: '3 BHK (3 Bedroom + Hall + Kitchen)' },
  { value: '3.5bhk', label: '3.5 BHK (3 Bedroom + Study + Hall + Kitchen)' },
  { value: '4bhk', label: '4 BHK (4 Bedroom + Hall + Kitchen)' },
  { value: '4bhk-plus', label: '4+ BHK (4+ Bedroom + Hall + Kitchen)' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'studio', label: 'Studio Apartment' },
  { value: 'commercial', label: 'Commercial Space' },
  { value: 'plot', label: 'Plot/Land' }
];

// Budget Ranges
export const BUDGET_RANGES = [
  { value: 'under-5l', label: 'Under ₹5 Lakhs' },
  { value: '5l-10l', label: '₹5 - ₹10 Lakhs' },
  { value: '10l-20l', label: '₹10 - ₹20 Lakhs' },
  { value: '20l-30l', label: '₹20 - ₹30 Lakhs' },
  { value: '30l-50l', label: '₹30 - ₹50 Lakhs' },
  { value: '50l-75l', label: '₹50 - ₹75 Lakhs' },
  { value: '75l-1cr', label: '₹75 Lakhs - ₹1 Crore' },
  { value: '1cr-1.5cr', label: '₹1 - ₹1.5 Crore' },
  { value: '1.5cr-2cr', label: '₹1.5 - ₹2 Crore' },
  { value: '2cr-3cr', label: '₹2 - ₹3 Crore' },
  { value: '3cr-5cr', label: '₹3 - ₹5 Crore' },
  { value: 'above-5cr', label: 'Above ₹5 Crore' }
];

// Enquiry Status
export const ENQUIRY_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  NOT_INTERESTED: 'not_interested',
  UNQUALIFIED: 'unqualified',
  BOOKED: 'booked'
};

// Interest Levels
export const INTEREST_LEVELS = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold'
};

// Booking Progress Stages
export const BOOKING_PROGRESS = [
  { value: 'initial_discussion', label: 'Initial Discussion' },
  { value: 'site_visit_scheduled', label: 'Site Visit Scheduled' },
  { value: 'site_visit_completed', label: 'Site Visit Completed' },
  { value: 'negotiation', label: 'Price Negotiation' },
  { value: 'documentation', label: 'Documentation in Progress' },
  { value: 'token_payment', label: 'Token Payment Done' },
  { value: 'loan_processing', label: 'Loan Processing' },
  { value: 'final_booking', label: 'Final Booking' },
  { value: 'registration', label: 'Registration Complete' }
];

// Sales Persons Data
export const SALES_PERSONS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@company.com",
    specialization: "Residential Properties",
    experience: "5 years",
    available: true
  },
  {
    id: 2,
    name: "Priya Sharma",
    phone: "+91 87654 32109",
    email: "priya.sharma@company.com",
    specialization: "Luxury Apartments",
    experience: "7 years",
    available: true
  },
  {
    id: 3,
    name: "Amit Patel",
    phone: "+91 76543 21098",
    email: "amit.patel@company.com",
    specialization: "Commercial & Plots",
    experience: "4 years",
    available: true
  },
  {
    id: 4,
    name: "Sneha Reddy",
    phone: "+91 65432 10987",
    email: "sneha.reddy@company.com",
    specialization: "Villas & Premium",
    experience: "6 years",
    available: true
  }
];
