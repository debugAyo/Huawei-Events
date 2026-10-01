import { NextRequest, NextResponse } from "next/server";
import { sendEmail, isEmailConfigured } from "@/lib/email";

export async function GET(request: NextRequest) {
  const testEmail = request.nextUrl.searchParams.get("email");
  
  if (!testEmail) {
    return NextResponse.json({ 
      error: "Add ?email=your@email.com to test",
      isEmailConfigured,
      hasApiKey: Boolean(process.env.RESEND_API_KEY),
      apiKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 10) || "NOT SET"
    });
  }

  const result = await sendEmail({
    to: testEmail,
    subject: "Test Email from Huawei ICT Academy",
    html: "<p>This is a test email to verify Resend integration.</p>",
  });

  return NextResponse.json({ 
    success: result.success,
    error: result.error,
    isEmailConfigured,
    testEmail
  });
}