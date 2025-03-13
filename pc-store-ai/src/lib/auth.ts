import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthSession {
  user: AuthUser;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    
    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
      }
    };
  } catch {
    return null;
  }
}
