import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validations';
import { sendContactNotification } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = contactSchema.parse(body);

    // Save to Database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        subject: validated.subject || null,
        message: validated.message,
        status: 'UNREAD',
      },
    });

    // Send email notification (non-blocking failure)
    try {
      await sendContactNotification({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        subject: validated.subject,
        message: validated.message,
      });
    } catch (emailErr) {
      console.error('Failed to send contact notification email:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Message delivered to REHAS team',
      submissionId: submission.id,
    });
  } catch (error: any) {
    console.error('Contact submission error:', error);
    return NextResponse.json({ error: error.message || 'Validation error' }, { status: 400 });
  }
}
