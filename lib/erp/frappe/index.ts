import type { ErpAdapter } from "@/lib/erp/contract";

/**
 * Placeholder for the real ERPNext (Frappe REST API) adapter.
 * Implement this against the same ErpAdapter contract once a real
 * ERPNext instance is provisioned, then switch ERP_ADAPTER=frappe.
 */
export const frappeErpAdapter: ErpAdapter = {
  customers: {
    async upsertCustomer() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
    async getCustomer() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
  },
  items: {
    async listItems() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
    async getItem() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
    async upsertItem() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
  },
  stock: {
    async getStockLevels() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
    async reserveStock() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
    async releaseStock() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
  },
  pricing: {
    async getItemPrice() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
  },
  salesOrders: {
    async createSalesOrder() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
    async updateStatus() {
      throw new Error("Frappe ERP adapter is not implemented yet.");
    },
  },
};
