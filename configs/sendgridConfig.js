import dotenv from 'dotenv';
dotenv.config();
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: {
      email: process.env.OWNER_EMAIL,
      name: 'Starter File | Testing',
    },
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error.message);
  }
};
