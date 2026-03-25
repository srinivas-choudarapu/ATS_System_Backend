const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendPasswordEmail = async (to, password) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Temporary Password",
    text: `Your temporary password is: ${password}\nPlease login and change it immediately.`
  });
};

module.exports = sendPasswordEmail;