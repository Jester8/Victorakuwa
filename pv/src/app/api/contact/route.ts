const RECIPIENT_FALLBACK = "vakuwa@gmail.com";
const PURPOSES = [
  "Invitation to speak",
  "Church or ministry invitation",
  "Mentorship",
  "Book enquiry",
  "Other message",
] as const;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\r/g, "").slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Please complete the form and try again." }, { status: 400 });
  }

  // Bots fill hidden fields; accept their submission without sending email.
  if (typeof body.website === "string" && body.website.trim()) {
    return Response.json({ message: "Thank you. Your message has been sent." });
  }

  const name = clean(body.name, 100).replace(/\s+/g, " ");
  const email = clean(body.email, 254);
  const purpose = clean(body.purpose, 80);
  const organization = clean(body.organization, 120);
  const eventDate = clean(body.eventDate, 20);
  const venue = clean(body.venue, 160);
  const message = clean(body.message, 4000);

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
    return Response.json({ error: "Add your name, a valid email address, and a message of at least 10 characters." }, { status: 400 });
  }
  if (!(PURPOSES as readonly string[]).includes(purpose)) {
    return Response.json({ error: "Choose an enquiry type from the list." }, { status: 400 });
  }
  if (eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return Response.json({ error: "Check the event date and try again." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return Response.json(
      { error: "The contact form is not connected yet. Please use the official links to get in touch." },
      { status: 503 }
    );
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Enquiry: ${purpose}`,
    organization ? `Church or organization: ${organization}` : "",
    eventDate ? `Event date: ${eventDate}` : "",
    venue ? `Venue or location: ${venue}` : "",
    "",
    "Message:",
    message,
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [process.env.CONTACT_TO_EMAIL?.trim() || RECIPIENT_FALLBACK],
        reply_to: email,
        subject: `${purpose}: ${name}`,
        text,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ error: "Your message could not be sent right now. Please try again later." }, { status: 502 });
    }
    return Response.json({ message: "Thank you. Your message has been sent." });
  } catch {
    return Response.json({ error: "Your message could not be sent right now. Please try again later." }, { status: 502 });
  }
}
