import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

type AuditInput = {
  kullaniciId?: string | null;
  aksiyon: string;
  varlikAdi?: string | null;
  varlikId?: string | null;
  ipAdresi?: string | null;
  kullaniciAracisi?: string | null;
  ekVeri?: Record<string, unknown> | null;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly database: DatabaseService) {}

  async write(input: AuditInput) {
    await this.database.execute(
      `
        INSERT INTO denetim_loglari (
          kullanici_id,
          aksiyon,
          varlik_adi,
          varlik_id,
          ip_adresi,
          kullanici_aracisi,
          ek_veri
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.kullaniciId ?? null,
        input.aksiyon,
        input.varlikAdi ?? null,
        input.varlikId ?? null,
        input.ipAdresi ?? null,
        input.kullaniciAracisi ?? null,
        input.ekVeri ? JSON.stringify(input.ekVeri) : null,
      ],
    );
  }
}
