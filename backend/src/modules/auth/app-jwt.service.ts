import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JWTPayload } from 'jose';
import { TextEncoder } from 'node:util';
import { loadJose } from '../../common/utils/load-jose';
import { AuthUser } from './types/auth-user.type';

type AppJwtPayload = JWTPayload & {
  kullanici_id: string;
  eposta: string;
  ad_soyad: string;
  roller: string[];
};

@Injectable()
export class AppJwtService {
  private readonly secret: Uint8Array;
  private readonly expiresIn: string;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.getOrThrow<string>('JWT_SECRET');
    this.secret = new TextEncoder().encode(secret);
    this.expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '8h');
  }

  async sign(user: AuthUser) {
    const { SignJWT } = await loadJose();
    const payload: AppJwtPayload = {
      kullanici_id: user.kullanici_id,
      eposta: user.eposta,
      ad_soyad: user.ad_soyad,
      roller: user.roller,
    };

    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setSubject(user.kullanici_id)
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: this.expiresIn,
    };
  }

  async verify(token: string): Promise<AuthUser> {
    try {
      const { jwtVerify } = await loadJose();
      const { payload } = await jwtVerify<AppJwtPayload>(token, this.secret, {
        algorithms: ['HS256'],
      });

      if (
        !payload.kullanici_id ||
        !payload.eposta ||
        !payload.ad_soyad ||
        !Array.isArray(payload.roller)
      ) {
        throw new UnauthorizedException('JWT payload gecersiz.');
      }

      return {
        kullanici_id: payload.kullanici_id,
        eposta: payload.eposta,
        ad_soyad: payload.ad_soyad,
        roller: payload.roller,
      };
    } catch {
      throw new UnauthorizedException('JWT gecersiz veya suresi dolmus.');
    }
  }
}
