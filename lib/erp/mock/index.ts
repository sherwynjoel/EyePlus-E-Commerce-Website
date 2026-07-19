import { prisma } from "@/lib/db/client";
import type {
  ErpAdapter,
  ErpCustomerDto,
  ErpItemDto,
  ErpSalesOrderDto,
  ErpStockLevelDto,
} from "@/lib/erp/contract";

/**
 * Mock ERPNext adapter, backed by our own Postgres tables. Simulates network
 * latency and writes to ErpSyncLog on every call so the admin ERP-sync screen
 * has real activity to show even before a real ERPNext instance exists.
 */

async function simulateLatency() {
  await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));
}

async function logSync(params: {
  entityType: "CUSTOMER" | "ITEM" | "SALES_ORDER" | "STOCK";
  entityId: string;
  direction: "PUSH" | "PULL";
  status: "SUCCESS" | "FAILED";
  payload?: unknown;
  error?: string;
}) {
  await prisma.erpSyncLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      direction: params.direction,
      status: params.status,
      payload: params.payload as never,
      error: params.error,
    },
  });
}

export const mockErpAdapter: ErpAdapter = {
  customers: {
    async upsertCustomer(input: ErpCustomerDto) {
      await simulateLatency();
      await logSync({ entityType: "CUSTOMER", entityId: input.code, direction: "PUSH", status: "SUCCESS", payload: input });
      return { erpCustomerId: `mock-cust-${input.code}` };
    },
    async getCustomer(code: string) {
      await simulateLatency();
      await logSync({ entityType: "CUSTOMER", entityId: code, direction: "PULL", status: "SUCCESS" });
      return null;
    },
  },

  items: {
    async listItems() {
      await simulateLatency();
      const products = await prisma.product.findMany({ where: { erpItemCode: { not: null } } });
      await logSync({ entityType: "ITEM", entityId: "*", direction: "PULL", status: "SUCCESS" });
      return products.map((p) => ({ code: p.erpItemCode!, name: p.name }));
    },
    async getItem(code: string) {
      await simulateLatency();
      const product = await prisma.product.findUnique({ where: { erpItemCode: code } });
      await logSync({ entityType: "ITEM", entityId: code, direction: "PULL", status: product ? "SUCCESS" : "FAILED" });
      return product ? { code: product.erpItemCode!, name: product.name } : null;
    },
    async upsertItem(input: ErpItemDto) {
      await simulateLatency();
      await logSync({ entityType: "ITEM", entityId: input.code, direction: "PUSH", status: "SUCCESS", payload: input });
      return { erpItemId: `mock-item-${input.code}` };
    },
  },

  stock: {
    async getStockLevels(itemCode: string): Promise<ErpStockLevelDto[]> {
      await simulateLatency();
      const variant = await prisma.productVariant.findUnique({
        where: { erpItemCode: itemCode },
        include: { inventory: true },
      });
      await logSync({ entityType: "STOCK", entityId: itemCode, direction: "PULL", status: "SUCCESS" });
      if (!variant) return [];
      return variant.inventory.map((inv) => ({
        itemCode,
        warehouseCode: inv.warehouseCode,
        quantityOnHand: inv.quantityOnHand,
      }));
    },
    async reserveStock(itemCode: string, warehouseCode: string, quantity: number) {
      await simulateLatency();
      const variant = await prisma.productVariant.findUnique({ where: { erpItemCode: itemCode } });
      if (variant) {
        await prisma.inventory.updateMany({
          where: { variantId: variant.id, warehouseCode },
          data: { quantityReserved: { increment: quantity } },
        });
      }
      await logSync({ entityType: "STOCK", entityId: itemCode, direction: "PUSH", status: "SUCCESS", payload: { quantity, action: "reserve" } });
    },
    async releaseStock(itemCode: string, warehouseCode: string, quantity: number) {
      await simulateLatency();
      const variant = await prisma.productVariant.findUnique({ where: { erpItemCode: itemCode } });
      if (variant) {
        await prisma.inventory.updateMany({
          where: { variantId: variant.id, warehouseCode },
          data: { quantityReserved: { decrement: quantity } },
        });
      }
      await logSync({ entityType: "STOCK", entityId: itemCode, direction: "PUSH", status: "SUCCESS", payload: { quantity, action: "release" } });
    },
  },

  pricing: {
    async getItemPrice(itemCode: string, priceListCode: string) {
      await simulateLatency();
      const variant = await prisma.productVariant.findUnique({ where: { erpItemCode: itemCode } });
      if (!variant) return null;
      const price = await prisma.price.findFirst({
        where: { variantId: variant.id, priceList: { code: priceListCode as never } },
        orderBy: { effectiveFrom: "desc" },
      });
      await logSync({ entityType: "ITEM", entityId: itemCode, direction: "PULL", status: "SUCCESS" });
      return price ? Number(price.sellingPrice) : null;
    },
  },

  salesOrders: {
    async createSalesOrder(input: ErpSalesOrderDto) {
      await simulateLatency();
      await logSync({ entityType: "SALES_ORDER", entityId: input.orderNumber, direction: "PUSH", status: "SUCCESS", payload: input });
      return { erpSalesOrderId: `mock-so-${input.orderNumber}` };
    },
    async updateStatus(erpSalesOrderId: string, status: string) {
      await simulateLatency();
      await logSync({ entityType: "SALES_ORDER", entityId: erpSalesOrderId, direction: "PUSH", status: "SUCCESS", payload: { status } });
    },
  },
};
