import sgMail from '@sendgrid/mail';
import { config } from '../config/index.js';
import { logger } from '../logger/index.js';
import { ApiError } from '../exceptions/ApiError.js';

sgMail.setApiKey(config.email.sendgridApiKey);

export const EmailService = {
  async send({ to, subject, templateId, html, dynamicData }) {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@syncup.com',
      subject,
    };

    if (templateId) {
      msg.templateId = templateId;
      msg.dynamicTemplateData = dynamicData || {};
    } else if (html) {
      msg.html = html;
    }

    try {
      await sgMail.send(msg);
      logger.info({ to, subject }, 'Email sent successfully');
    } catch (err) {
      logger.error({ err, to, subject }, 'Email send failed');
      throw ApiError.internal(err.message || 'Email send failed');
    }
  },
};
