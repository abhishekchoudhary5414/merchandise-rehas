import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const CUSTOMER_TOKEN_COOKIE = 'customer_token';
const JWT_SECRET = process.env.JWT_SECRET || 'rehas_admin_jwt_secret_token_2026';

export interface CustomerTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export async function getCustomerUser(): Promise<CustomerTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_COOKIE)?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as CustomerTokenPayload;
    if (!decoded?.userId) return null;
    return decoded;
  } catch {
    return null;
  }
}
