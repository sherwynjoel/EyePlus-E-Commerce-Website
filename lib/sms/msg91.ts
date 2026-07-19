interface SmsSender {
  send(phone: string, message: string): Promise<void>;
}

class ConsoleSmsSender implements SmsSender {
  async send(phone: string, message: string): Promise<void> {
    console.log(`[sms:console] -> ${phone}: ${message}`);
  }
}

class Msg91SmsSender implements SmsSender {
  async send(phone: string, message: string): Promise<void> {
    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID;
    if (!authKey || !senderId) {
      throw new Error("MSG91_AUTH_KEY / MSG91_SENDER_ID are not configured");
    }

    const response = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({
        sender: senderId,
        mobiles: phone,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`MSG91 request failed with status ${response.status}`);
    }
  }
}

let sender: SmsSender | null = null;

export function getSmsSender(): SmsSender {
  if (!sender) {
    sender = process.env.SMS_SENDER === "msg91" ? new Msg91SmsSender() : new ConsoleSmsSender();
  }
  return sender;
}
