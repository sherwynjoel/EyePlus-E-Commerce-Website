export type SmsTemplate =
  | "OTP_LOGIN"
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DEALER_APPROVED";

const templates: Record<SmsTemplate, (vars: Record<string, string>) => string> = {
  OTP_LOGIN: (v) => `Your EyePlus login code is ${v.code}. It expires in 5 minutes.`,
  ORDER_CONFIRMED: (v) => `Your order ${v.orderNumber} has been confirmed. Thank you for shopping with EyePlus!`,
  ORDER_SHIPPED: (v) => `Your order ${v.orderNumber} has shipped and is on its way.`,
  OUT_FOR_DELIVERY: (v) => `Your order ${v.orderNumber} is out for delivery today.`,
  DELIVERED: (v) => `Your order ${v.orderNumber} has been delivered. Enjoy!`,
  DEALER_APPROVED: (v) => `Your dealer account (${v.dealerCode}) has been approved. You can now access dealer pricing.`,
};

export function renderTemplate(template: SmsTemplate, vars: Record<string, string>): string {
  return templates[template](vars);
}
