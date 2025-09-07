import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/feedback", async (req, res) => {
    try {
      const message = String(req.body?.message || "").trim();
      if (!message) return res.status(400).json({ error: "Message required" });
      const to = "syedanas2465@gmail.com";
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM || "WhisperRead <onboarding@resend.dev>";
      if (!apiKey) {
        console.warn("[feedback] Missing RESEND_API_KEY. Message:", message);
        return res.status(501).json({ error: "Email sender not configured" });
      }
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject: "WhisperRead Feedback", text: message }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return res.status(500).json({ error: data?.message || "Failed to send" });
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "Server error" });
    }
  });

  return app;
}
