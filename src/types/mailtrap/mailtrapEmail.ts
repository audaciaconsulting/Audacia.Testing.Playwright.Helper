export interface MailtrapEmail {
  id: number;
  inbox_id: number;
  subject: string;
  sent_at: Date;
  from_email: string;
  from_name: string;
  to_email: string;
  to_name: string;
  created_at: string;
}
