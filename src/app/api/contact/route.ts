import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations';
import { sendContactNotification } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = contactSchema.parse(body);

    await sendContactNotification({
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      subject: validated.subject,
      message: validated.message,
    });

    return NextResponse.json({ success: true, message: 'Message delivered to REHAS team' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation error' }, { status: 400 });
  }
}
