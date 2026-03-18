import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    return NextResponse.json(
      { error: "Waitlist endpoint not configured." },
      { status: 500 }
    );
  }

  let body: {
    firstName?: string;
    email?: string;
    phone?: string;
    npcPersonality?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  console.log("[waitlist] received:", JSON.stringify(body));

  if (!body.firstName || !body.email) {
    return NextResponse.json(
      { error: "First name and email are required." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: body.firstName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() ?? "",
        npcPersonality: body.npcPersonality?.trim() ?? "",
      }),
    });

    const responseText = await res.text();
    console.log("[waitlist] script response:", res.status, responseText);

    if (!res.ok) {
      throw new Error(`Apps Script responded with status ${res.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[waitlist] Failed to write to sheet:", err);
    return NextResponse.json(
      { error: "Failed to save. Please try again." },
      { status: 502 }
    );
  }
}
