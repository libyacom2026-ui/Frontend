const nodemailer = require("nodemailer");

function clean(value) {
  return String(value || "").trim().replace(/<[^>]*>/g, "").slice(0, 3000);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const name = clean(req.body?.full_name);
    const email = clean(req.body?.email);
    const phone = clean(req.body?.phone);
    const company = clean(req.body?.company);
    const message = clean(req.body?.message);

    if (!name || !phone || !message) return res.status(400).json({ ok: false, error: "Missing required fields" });

    const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "TO_EMAIL"];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) return res.status(500).json({ ok: false, error: `Missing env: ${missing.join(", ")}` });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_PORT || "465") === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const body = [
      "تم استلام طلب تواصل جديد من موقع Nomadic Energy:",
      "",
      `الاسم الكامل: ${name}`,
      `البريد الإلكتروني: ${email || "غير مذكور"}`,
      `رقم الهاتف: ${phone}`,
      `الشركة: ${company || "غير مذكور"}`,
      "",
      "الرسالة:",
      message,
      "",
      `تاريخ الإرسال: ${new Date().toISOString()}`
    ].join("\n");

    await transporter.sendMail({
      from: `"Nomadic Energy Website" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.TO_EMAIL,
      replyTo: email || process.env.SMTP_USER,
      subject: "طلب تواصل جديد من موقع Nomadic Energy",
      text: body
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Unable to send email" });
  }
};
