const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

//function to make connect and send mails by SMTP PORT
const sendMessage = async (option) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: process.env.FROM_EMAIL + `<${process.env.FROM_EMAIL}>`,
    to: option.to,
    subject: option.subject,
    text: option.text,
  };

  const info = await transporter.sendMail(message);

  console.log(info.messageId);
};

module.exports = sendMessage;
