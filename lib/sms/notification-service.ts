import { getSmsSender } from "@/lib/sms/msg91";
import { renderTemplate, type SmsTemplate } from "@/lib/sms/templates";

export async function notify(phone: string, template: SmsTemplate, vars: Record<string, string> = {}) {
  const message = renderTemplate(template, vars);
  await getSmsSender().send(phone, message);
}
