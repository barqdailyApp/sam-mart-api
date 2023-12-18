import { SubscriptionRequest } from "src/modules/subscription/dto/subscription-request";

export class MoyasarPayment {
    id: string;
    status: string;
    amount: number;
    fee: number;
    currency: string;
    refunded: number;
    refunded_at: string | null;
    captured: number;
    captured_at: string | null;
    voided_at: string | null;
    description: string;
    amount_format: string;
    fee_format: string;
    refunded_format: string;
    captured_format: string;
    invoice_id: string | null;
    ip: string;
    callback_url: string;
    created_at: string;
    updated_at: string;
    metadata: SubscriptionRequest;
    source: MoyasarPaymentSource;
  
    constructor(data: any) {
      this.id = data.id;
      this.status = data.status;
      this.amount = data.amount;
      this.fee = data.fee;
      this.currency = data.currency;
      this.refunded = data.refunded;
      this.refunded_at = data.refunded_at;
      this.captured = data.captured;
      this.captured_at = data.captured_at;
      this.voided_at = data.voided_at;
      this.description = data.description;
      this.amount_format = data.amount_format;
      this.fee_format = data.fee_format;
      this.refunded_format = data.refunded_format;
      this.captured_format = data.captured_format;
      this.invoice_id = data.invoice_id;
      this.ip = data.ip;
      this.callback_url = data.callback_url;
      this.created_at = data.created_at;
      this.updated_at = data.updated_at;
      this.metadata =new SubscriptionRequest({... data.metadata});
      this.source = new MoyasarPaymentSource(data.source);
    }
  }
  
  class MoyasarPaymentSource {
    type: string;
    company: string;
    name: string;
    number: string;
    gateway_id: string;
    reference_number: string | null;
    token: string | null;
    message: string;
    transaction_url: string;
  
    constructor(data: any) {
      this.type = data.type;
      this.company = data.company;
      this.name = data.name;
      this.number = data.number;
      this.gateway_id = data.gateway_id;
      this.reference_number = data.reference_number;
      this.token = data.token;
      this.message = data.message;
      this.transaction_url = data.transaction_url;
    }
  }