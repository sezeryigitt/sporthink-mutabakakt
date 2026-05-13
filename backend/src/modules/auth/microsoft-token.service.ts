import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JWTPayload } from 'jose';
import { loadJose } from '../../common/utils/load-jose';

type MicrosoftIdTokenPayload = JWTPayload & {
  aud?: string | string[];
  iss?: string;
  tid?: string;
  oid?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
};

export type VerifiedMicrosoftIdentity = {
  email: string;
  fullName: string;
  oid: string;
  tid: string;
};

@Injectable()
export class MicrosoftTokenService {
  private readonly clientId: string;
  private readonly authorityHost: string;
  private readonly allowedDomains: string[];
  private readonly allowedTenantIds: string[];

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.getOrThrow<string>('MICROSOFT_CLIENT_ID');
    const authority = this.config
      .getOrThrow<string>('MICROSOFT_AUTHORITY')
      .replace(/\/$/, '');
    this.authorityHost = this.resolveAuthorityHost(authority);
    const allowedDomains =
      this.config.get<string>('MICROSOFT_ALLOWED_DOMAINS') ??
      this.config.get<string>('MICROSOFT_ALLOWED_DOMAIN') ??
      'sporthink.com.tr,ogr.deu.edu.tr';
    this.allowedDomains = allowedDomains
      .split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean);
    this.allowedTenantIds = (
      this.config.get<string>('MICROSOFT_ALLOWED_TENANT_IDS') ??
      this.config.get<string>('MICROSOFT_TENANT_ID') ??
      ''
    )
      .split(',')
      .map((tenantId) => tenantId.trim().toLowerCase())
      .filter(Boolean);
  }

  async verify(idToken: string): Promise<VerifiedMicrosoftIdentity> {
    let payload: MicrosoftIdTokenPayload;

    try {
      const { createRemoteJWKSet, decodeJwt, jwtVerify } = await loadJose();
      const decoded = decodeJwt<MicrosoftIdTokenPayload>(idToken);
      const tenantId = decoded.tid?.toLowerCase();

      if (!tenantId || !this.isAllowedTenant(tenantId)) {
        throw new UnauthorizedException('Microsoft tenant dogrulanamadi.');
      }

      const issuer = `${this.authorityHost}/${tenantId}/v2.0`;
      const jwks = createRemoteJWKSet(
        new URL(`${this.authorityHost}/${tenantId}/discovery/v2.0/keys`),
      );
      const result = await jwtVerify<MicrosoftIdTokenPayload>(idToken, jwks, {
        audience: this.clientId,
        issuer,
      });
      payload = result.payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Microsoft token dogrulanamadi.');
    }

    const email = (payload.preferred_username ?? payload.email ?? '').trim().toLowerCase();

    if (!payload.tid || !this.isAllowedTenant(payload.tid)) {
      throw new UnauthorizedException('Microsoft tenant dogrulanamadi.');
    }

    if (!payload.oid) {
      throw new UnauthorizedException('Microsoft kullanici kimligi eksik.');
    }

    if (!this.isAllowedEmail(email)) {
      throw new ForbiddenException(
        'Yalnizca izinli Microsoft e-posta domainleri kabul edilir.',
      );
    }

    return {
      email,
      fullName: payload.name?.trim() || email,
      oid: payload.oid,
      tid: payload.tid,
    };
  }

  private isAllowedEmail(email: string) {
    return this.allowedDomains.some((domain) => email.endsWith(`@${domain}`));
  }

  private isAllowedTenant(tenantId: string) {
    if (this.allowedTenantIds.length === 0) {
      return true;
    }

    return this.allowedTenantIds.includes(tenantId.toLowerCase());
  }

  private resolveAuthorityHost(authority: string) {
    const url = new URL(authority.replace('{tenant_id}', 'organizations'));
    return `${url.protocol}//${url.host}`;
  }
}
