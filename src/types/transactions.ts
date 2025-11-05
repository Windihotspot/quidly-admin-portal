// Transaction structure from API response
export interface Transaction {
  merchantid: string;
  paymentid: string;
  txid: string | null;
  paymentreference: string;
  amount: number;
  status: number;
  entrydt: string;
  id: number;
  channelid: string;
  apikey: string;
  scheme: string | null;
  jsondata: string;
  payment_status: number;
}

// Summary data structure from quarterly/monthly/weekly APIs
export interface SummaryData {
  this_quarter_transactions?: number;
  this_quarter_total_amount?: number;
  last_quarter_transactions?: number;
  last_quarter_total_amount?: number;
  pct_change_transactions?: string;
  pct_change_amount?: string;
  this_month_transactions?: number;
  this_month_total_amount?: number;
  last_month_transactions?: number;
  last_month_total_amount?: number;
  this_week_transactions?: number;
  this_week_total_amount?: number;
  last_week_transactions?: number;
  last_week_total_amount?: number;
}

// Quarter data for chart - enhanced with value support
export interface QuarterData {
  quarter: string;
  count: number;
  value: number; // Total transaction value for the quarter
}

// Chart view type
export type ChartViewType = 'count' | 'value';

// API response structure
export interface ApiResponse {
  status: number;
  jsresult: Transaction[] | SummaryData[];
}

// Card details for JSON masking
export interface CardDetails {
  cardno: string;
  cvv: string;
  expirymonth: string;
  expiryyear: string;
  cardholder?: string;
}

// Customer details
export interface CustomerDetails {
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  country?: string;
}

// JSON data structure
export interface TransactionJsonData {
  cardDetails?: CardDetails;
  customerDetails?: CustomerDetails;
}
