const SibApiV3Sdk = require('sib-api-v3-sdk');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const { loadResume, queryResume } = require("./resumeParser");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Brevo API setup
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

loadResume()
  .then(() => {
    console.log("Resume loaded successfully!");
  })
  .catch((error) => {
    console.error("Error loading resume:", error.message);
    console.log("Server will continue running, but resume features may not work.");
  });

app.post("/chat", (req, res) => {
  const { question } = req.body;
  const answer = queryResume(question);
  res.json({ answer });
});

app.post("/send-email", async (req, res) => {
  const { recipient, subject, body } = req.body;
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = `<p>${body}</p>`;
    sendSmtpEmail.sender = { name: "MCP Server", email: `${process.env.EMAIL_USER}` };
    sendSmtpEmail.to = [{ email: recipient }];

    const result = await emailApi.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', result);
    res.json({ success: true, message: "Email sent!" });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ success: false, error: "Failed to send email: " + error.message });
  }
});