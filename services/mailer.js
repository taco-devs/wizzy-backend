var nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  }
});

const getConfirmationMessage = (email, confirmation_token) => {
  var message = {
    from: email,
    to: "whatever@otherdomain.com",
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
