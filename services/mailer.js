var nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  }
});

const getConfirmationMessage = (email, confirmation_token) => {
  var message = {
    from: 'no-reply@askwizzy.ai',
    to: email,
    subject: "WizzyAI - Please confirm your email",
    html: `
        <div>
            <p>Please confirm your email doing click in the button below:</p>
            <a href="${process.env.API_URL}/accounts/verify?token=${confirmation_token}">Confirm</a>
        </div>
    `,
  };
  return message;
};

const sendConfirmationEmail = async (email, confirmation_token) => {
  const message = getConfirmationMessage(email, confirmation_token);
  await transporter.sendMail(message, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
};

module.exports = {
  sendConfirmationEmail,
};
