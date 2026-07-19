import type { ErpAdapter } from "@/lib/erp/contract";
import { mockErpAdapter } from "@/lib/erp/mock";
import { frappeErpAdapter } from "@/lib/erp/frappe";

let adapter: ErpAdapter | null = null;

/**
 * Swapping ERP providers is a one-line change: set ERP_ADAPTER=frappe
 * once lib/erp/frappe is implemented. Nothing else in the codebase
 * should import mockErpAdapter or frappeErpAdapter directly.
 */
export function getErpAdapter(): ErpAdapter {
  if (!adapter) {
    adapter = process.env.ERP_ADAPTER === "frappe" ? frappeErpAdapter : mockErpAdapter;
  }
  return adapter;
}
