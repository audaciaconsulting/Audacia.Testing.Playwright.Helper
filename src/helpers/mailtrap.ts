import { APIRequestContext } from '@playwright/test';
import { MailtrapAttachment } from '../types/mailtrap/mailtrapAttachment.js';
import { MailtrapEmail } from '../types/mailtrap/mailtrapEmail.js';
import { MailtrapContentType } from '../types/mailtrap/mailtrapContentType.enum.js';

export class MailtrapHelper {
  private request: APIRequestContext;
  private accountId: string;
  private inboxId: string;
  private apiToken: string;

  private getMessagesEndpoint: string;
  private getEmailAttachmentsEndpoint: (messageId: string) => string;
  private getEmailContentEndpoint: (messageId: string) => string;

  constructor(
    request: APIRequestContext,
    accountId: string,
    inboxId: string,
    apiToken: string,
  ) {
    this.request = request;
    this.accountId = accountId;
    this.inboxId = inboxId;
    this.apiToken = apiToken;
    this.getMessagesEndpoint = `api/accounts/${this.accountId}/inboxes/${this.inboxId}/messages`;
    this.getEmailAttachmentsEndpoint = (messageId: string) => `api/accounts/${this.accountId}/inboxes/${this.inboxId}/messages/${messageId}/attachments`;
    this.getEmailContentEndpoint = (messageId: string) => `api/accounts/${this.accountId}/inboxes/${this.inboxId}/messages/${messageId}`;
  }

  /**
   * Gets the top 30 emails from the inbox.
   * 
   * @param parameters The following optional parameters can be passed in
   * Search: `{ search: searchTerm }`
   * Page: `{ page: pageNumber }`
   * @returns 
   */
  public async getEmails(parameters?: {
    [key: string]: string | number | boolean;
  }) {
    const response = await this.request.get(this.getMessagesEndpoint, {
      headers: {
        'Accept': 'application/json',
        'Api-Token': this.apiToken,
      },
      params: parameters,
    });

    const emails: MailtrapEmail[] = await response.json();

    return emails;
  }

  /**
   * 
   * @param searchTerm
   * @returns 
   */
  public async searchEmails(searchTerm: string) {
    const searchParams = { search: searchTerm };
    return await this.getEmails(searchParams);
  }

  /**
   * Returns the list of attachments along with their filenames and the url to download the file, for the provided email Id.
   * 
   * @param messageId 
   * @returns 
   */
  public async getEmailAttachmentsList(messageId: string) {
    const response = await this.request.get(this.getEmailAttachmentsEndpoint(messageId), {
      headers: {
        'Accept': 'application/json',
        'Api-Token': this.apiToken,
      },
    });

    const attachments: MailtrapAttachment[] = await response.json();

    return attachments;
  }

  /**
   * Downloads an attachment using the provided url path.
   * 
   * @param downloadPath 
   * @returns 
   */
  public async downloadAttachment(downloadPath: string) {
    return await this.request.get(downloadPath, {
      headers: {
        'Accept': 'application/json',
        'Api-Token': this.apiToken,
      },
    });
  }

  /**
   * Returns the email body content as text or html.
   * 
   * @param messageId 
   * @param mailtrapContentType 
   * @returns 
   */
  public async getEmailContent(messageId: string, mailtrapContentType: MailtrapContentType) {
    let emailContentUrl = this.getEmailContentEndpoint(messageId);
    if (mailtrapContentType == MailtrapContentType.Html) {
      emailContentUrl = emailContentUrl + '/body.html';
    }
    else {
      emailContentUrl = emailContentUrl + '/body.txt';
    }

    return await this.request.get(emailContentUrl, {
      headers: {
        'Accept': 'application/json',
        'Api-Token': this.apiToken,
      },
    });
  }
}
