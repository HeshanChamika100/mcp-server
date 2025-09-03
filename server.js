const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const { loadResume, queryResume } = require("./resumeParser");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

// Start the server first
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Load resume after server starts
loadResume()
  .then(() => {
    console.log("Resume loaded successfully!");
  })
  .catch((error) => {
    console.error("Error loading resume:", error.message);
    console.log("Server will continue running, but resume features may not work.");
  });

// Chat endpoint
app.post("/chat", (req, res) => {
  const { question } = req.body;
  const answer = queryResume(question);
  res.json({ answer });
});

// Email endpoint
app.post("/send-email", async (req, res) => {
  const { recipient, subject, body } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject,
      text: body,
    });

    res.json({ success: true, message: "Email sent!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});


