export interface ErpCustomerDto {
  code: string;
  name: string;
  phone: string;
}

export interface ErpItemDto {
  code: string;
  name: string;
}

export interface ErpStockLevelDto {
  itemCode: string;
  warehouseCode: string;
  quantityOnHand: number;
}

export interface ErpSalesOrderItemDto {
  itemCode: string;
  quantity: number;
  rate: number;
}

export interface ErpSalesOrderDto {
  orderNumber: string;
  customerCode: string;
  items: ErpSalesOrderItemDto[];
  grandTotal: number;
}

/**
 * All ERPNext integration flows through this interface. Business logic in
 * lib/services depends only on this contract, never on a concrete adapter,
 * so swapping the mock for a real Frappe client later touches only
 * lib/erp/index.ts.
 */
export interface ErpAdapter {
  customers: {
    upsertCustomer(input: ErpCustomerDto): Promise<{ erpCustomerId: string }>;
    getCustomer(code: string): Promise<ErpCustomerDto | null>;
  };
  items: {
    listItems(): Promise<ErpItemDto[]>;
    getItem(code: string): Promise<ErpItemDto | null>;
    upsertItem(input: ErpItemDto): Promise<{ erpItemId: string }>;
  };
  stock: {
    getStockLevels(itemCode: string): Promise<ErpStockLevelDto[]>;
    reserveStock(itemCode: string, warehouseCode: string, quantity: number): Promise<void>;
    releaseStock(itemCode: string, warehouseCode: string, quantity: number): Promise<void>;
  };
  pricing: {
    getItemPrice(itemCode: string, priceListCode: string): Promise<number | null>;
  };
  salesOrders: {
    createSalesOrder(input: ErpSalesOrderDto): Promise<{ erpSalesOrderId: string }>;
    updateStatus(erpSalesOrderId: string, status: string): Promise<void>;
  };
}
