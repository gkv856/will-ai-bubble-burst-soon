import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("subscribers").insert({ email });

    // 23505 = unique_violation — treat "already subscribed" as a success.
    if (error && error.code !== "23505") {
      return NextResponse.json({ error: "Could not save your email. Try again." }, { status: 500 });
    }

    if (!error) {
      const siteUrl = `${new URL(request.url).origin}/`;
      await sendWelcomeEmail(email, siteUrl).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Signups are not configured yet." }, { status: 503 });
  }
}
