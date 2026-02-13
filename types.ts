export interface PurchaseOrderLine {
  sourceFile?: string;
  sourceUrl?: string;
  customerName: string;
  soldTo?: string;
  shipTo?: string;
  purchaseOrderNumber: string;
  salesOrg?: string;
  requiredDeliveryDate: string;
  materialNumber: string;
  orderQuantity: string | number;
  unitOfMeasure: string;
  deliveryAddress: string;
}

export enum ProcessingStatus {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  COMPLETE = "COMPLETE",
  ERROR = "ERROR",
}

export interface User {
  username: string;
  role: "admin" | "user";
}

export interface Customer {
  _id: string;
  customer_id: string;
  customer_names: string[];
  sales_org: string;
  ship_to: {
    [key: string]: string; // Dynamic keys for ship to IDs (e.g., "10094706": "Address string")
  };
}

// Global definition for PDF.js loaded via CDN
declare global {
  interface Window {
    pdfjsLib: any;
  }
}
