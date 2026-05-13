import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RowDataPacket } from 'mysql2';
import { DatabaseService } from '../../database/database.service';
import { AppJwtService } from './app-jwt.service';
import { AuditLogService } from './audit-log.service';
import { MicrosoftTokenService, VerifiedMicrosoftIdentity } from './microsoft-token.service';
import { AuthUser } from './types/auth-user.type';

type UserRow = RowDataPacket & {
  kullanici_id: string;
  eposta: string;
  ad_soyad: string;
  aktif_mi: number;
};

type RoleRow = RowDataPacket & {
  rol_kodu: string;
};

@Injectable()
export class AuthService {
  private readonly microsoftAdminEmails: string[];

  constructor(
    private readonly database: DatabaseService,
    private readonly microsoftToken: MicrosoftTokenService,
    private readonly appJwt: AppJwtService,
    private readonly audit: AuditLogService,
    config: ConfigService,
  ) {
    this.microsoftAdminEmails = (config.get<string>('MICROSOFT_ADMIN_EMAILS') ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }

  async microsoftLogin(idToken: string, request: Request) {
    let identity: VerifiedMicrosoftIdentity;

    try {
      identity = await this.microsoftToken.verify(idToken);
    } catch (error) {
      await this.audit.write({
        aksiyon: error instanceof ForbiddenException
          ? 'auth.microsoft.domain_rejected'
          : 'auth.microsoft.token_rejected',
        ipAdresi: request.ip,
        kullaniciAracisi: request.headers['user-agent'] ?? null,
      });
      throw error;
    }

    const user = await this.upsertMicrosoftUser(identity, request);
    const token = await this.appJwt.sign(user);

    await this.audit.write({
      kullaniciId: user.kullanici_id,
      aksiyon: 'auth.microsoft.login_success',
      varlikAdi: 'kullanicilar',
      varlikId: user.kullanici_id,
      ipAdresi: request.ip,
      kullaniciAracisi: request.headers['user-agent'] ?? null,
      ekVeri: {
        provider: 'microsoft',
        email: user.eposta,
      },
    });

    return {
      ...token,
      user,
    };
  }

  async currentUser(user: AuthUser) {
    return { data: await this.loadAuthUser(user.kullanici_id) };
  }

  private async upsertMicrosoftUser(
    identity: VerifiedMicrosoftIdentity,
    request: Request,
  ): Promise<AuthUser> {
    const [existingUser] = await this.database.query<UserRow>(
      `
        SELECT kullanici_id, eposta, ad_soyad, aktif_mi
        FROM kullanicilar
        WHERE eposta = ?
        LIMIT 1
      `,
      [identity.email],
    );

    if (existingUser && existingUser.aktif_mi !== 1) {
      await this.audit.write({
        kullaniciId: existingUser.kullanici_id,
        aksiyon: 'auth.microsoft.inactive_user_rejected',
        varlikAdi: 'kullanicilar',
        varlikId: existingUser.kullanici_id,
        ipAdresi: request.ip,
        kullaniciAracisi: request.headers['user-agent'] ?? null,
      });
      throw new ForbiddenException('Kullanici aktif degil.');
    }

    let kullaniciId = existingUser?.kullanici_id;

    if (existingUser) {
      await this.database.execute(
        `
          UPDATE kullanicilar
          SET
            ad_soyad = ?,
            eposta = ?,
            giris_saglayici = 'microsoft',
            microsoft_oid = ?,
            microsoft_tid = ?,
            son_giris_zamani = NOW()
          WHERE kullanici_id = ?
        `,
        [
          identity.fullName,
          identity.email,
          identity.oid,
          identity.tid,
          existingUser.kullanici_id,
        ],
      );
    } else {
      const result = await this.database.execute(
        `
          INSERT INTO kullanicilar (
            eposta,
            ad_soyad,
            parola_hash,
            giris_saglayici,
            microsoft_oid,
            microsoft_tid,
            son_giris_zamani,
            aktif_mi
          ) VALUES (?, ?, NULL, 'microsoft', ?, ?, NOW(), TRUE)
        `,
        [identity.email, identity.fullName, identity.oid, identity.tid],
      );
      kullaniciId = String(result.insertId);

      await this.assignDefaultRole(kullaniciId, identity.email);
      await this.audit.write({
        kullaniciId,
        aksiyon: 'auth.microsoft.user_created',
        varlikAdi: 'kullanicilar',
        varlikId: kullaniciId,
        ipAdresi: request.ip,
        kullaniciAracisi: request.headers['user-agent'] ?? null,
        ekVeri: {
          provider: 'microsoft',
          email: identity.email,
        },
      });
    }

    if (!kullaniciId) {
      throw new UnauthorizedException('Kullanici olusturulamadi.');
    }

    if (this.isMicrosoftAdmin(identity.email)) {
      await this.assignRole(kullaniciId, 'admin');
    } else {
      await this.assignDefaultRoleIfMissing(kullaniciId);
    }

    return this.loadAuthUser(kullaniciId);
  }

  private async loadAuthUser(kullaniciId: string): Promise<AuthUser> {
    const [freshUser] = await this.database.query<UserRow>(
      `
        SELECT kullanici_id, eposta, ad_soyad, aktif_mi
        FROM kullanicilar
        WHERE kullanici_id = ?
        LIMIT 1
      `,
      [kullaniciId],
    );

    if (!freshUser) {
      throw new UnauthorizedException('Kullanici okunamadi.');
    }

    if (freshUser.aktif_mi !== 1) {
      throw new ForbiddenException('Kullanici aktif degil.');
    }

    const roles = await this.database.query<RoleRow>(
      `
        SELECT r.rol_kodu
        FROM roller r
        JOIN kullanici_rolleri kr ON kr.rol_id = r.rol_id
        WHERE kr.kullanici_id = ?
        ORDER BY r.rol_kodu ASC
      `,
      [kullaniciId],
    );

    return {
      kullanici_id: String(freshUser.kullanici_id),
      eposta: freshUser.eposta,
      ad_soyad: freshUser.ad_soyad,
      roller: roles.map((role) => role.rol_kodu),
    };
  }

  private async assignDefaultRole(kullaniciId: string, email: string) {
    await this.assignRole(kullaniciId, this.isMicrosoftAdmin(email) ? 'admin' : 'operasyon');
  }

  private isMicrosoftAdmin(email: string) {
    return this.microsoftAdminEmails.includes(email.toLowerCase());
  }

  private async assignDefaultRoleIfMissing(kullaniciId: string) {
    await this.database.execute(
      `
        INSERT INTO kullanici_rolleri (kullanici_id, rol_id)
        SELECT ?, r.rol_id
        FROM roller r
        WHERE r.rol_kodu = 'operasyon'
          AND NOT EXISTS (
            SELECT 1
            FROM kullanici_rolleri kr
            WHERE kr.kullanici_id = ?
          )
      `,
      [kullaniciId, kullaniciId],
    );
  }

  private async assignRole(kullaniciId: string, roleCode: string) {
    await this.database.execute(
      `
        INSERT INTO kullanici_rolleri (kullanici_id, rol_id)
        SELECT ?, rol_id
        FROM roller
        WHERE rol_kodu = ?
        ON DUPLICATE KEY UPDATE rol_id = VALUES(rol_id)
      `,
      [kullaniciId, roleCode],
    );
  }
}
