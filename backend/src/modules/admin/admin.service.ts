import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2';
import { DatabaseService } from '../../database/database.service';

type AdminUserRow = RowDataPacket & {
  kullanici_id: string;
  eposta: string;
  ad_soyad: string;
  giris_saglayici: string;
  aktif_mi: number;
  son_giris_zamani: string | null;
  olusturma_zamani: string;
  roller: string | null;
  rol_adlari: string | null;
};

type AuditLogRow = RowDataPacket & {
  denetim_log_id: string;
  kullanici_id: string | null;
  kullanici_ad_soyad: string | null;
  kullanici_eposta: string | null;
  aksiyon: string;
  varlik_adi: string | null;
  varlik_id: string | null;
  ip_adresi: string | null;
  olusturma_zamani: string;
};

type StatsRow = RowDataPacket & {
  toplam_kullanici: number;
  aktif_kullanici: number;
  bugun_girisler: number;
  bugun_islemler: number;
};

@Injectable()
export class AdminService {
  constructor(private readonly database: DatabaseService) {}

  async getUsersAndLogs() {
    const [users, auditLogs, [stats]] = await Promise.all([
      this.getUsers(),
      this.getAuditLogs(),
      this.getStats(),
    ]);

    return {
      data: {
        kullanicilar: users.map((user) => ({
          kullanici_id: String(user.kullanici_id),
          eposta: user.eposta,
          ad_soyad: user.ad_soyad,
          giris_saglayici: user.giris_saglayici,
          aktif_mi: Boolean(user.aktif_mi),
          son_giris_zamani: user.son_giris_zamani,
          olusturma_zamani: user.olusturma_zamani,
          roller: user.roller ? user.roller.split(',') : [],
          rol_adlari: user.rol_adlari ? user.rol_adlari.split(',') : [],
        })),
        denetim_loglari: auditLogs.map((log) => ({
          denetim_log_id: String(log.denetim_log_id),
          kullanici_id: log.kullanici_id ? String(log.kullanici_id) : null,
          kullanici_ad_soyad: log.kullanici_ad_soyad,
          kullanici_eposta: log.kullanici_eposta,
          aksiyon: log.aksiyon,
          varlik_adi: log.varlik_adi,
          varlik_id: log.varlik_id,
          ip_adresi: log.ip_adresi,
          olusturma_zamani: log.olusturma_zamani,
        })),
        istatistikler: {
          toplam_kullanici: Number(stats?.toplam_kullanici ?? 0),
          aktif_kullanici: Number(stats?.aktif_kullanici ?? 0),
          bugun_girisler: Number(stats?.bugun_girisler ?? 0),
          bugun_islemler: Number(stats?.bugun_islemler ?? 0),
        },
      },
    };
  }

  private getUsers() {
    return this.database.query<AdminUserRow>(
      `
        SELECT
          k.kullanici_id,
          k.eposta,
          k.ad_soyad,
          k.giris_saglayici,
          k.aktif_mi,
          DATE_FORMAT(k.son_giris_zamani, '%Y-%m-%dT%H:%i:%s') AS son_giris_zamani,
          DATE_FORMAT(k.olusturma_zamani, '%Y-%m-%dT%H:%i:%s') AS olusturma_zamani,
          GROUP_CONCAT(r.rol_kodu ORDER BY r.rol_kodu SEPARATOR ',') AS roller,
          GROUP_CONCAT(r.rol_adi ORDER BY r.rol_kodu SEPARATOR ',') AS rol_adlari
        FROM kullanicilar k
        LEFT JOIN kullanici_rolleri kr ON kr.kullanici_id = k.kullanici_id
        LEFT JOIN roller r ON r.rol_id = kr.rol_id
        GROUP BY
          k.kullanici_id,
          k.eposta,
          k.ad_soyad,
          k.giris_saglayici,
          k.aktif_mi,
          k.son_giris_zamani,
          k.olusturma_zamani
        ORDER BY k.olusturma_zamani DESC, k.kullanici_id DESC
      `,
    );
  }

  private getAuditLogs() {
    return this.database.query<AuditLogRow>(
      `
        SELECT
          dl.denetim_log_id,
          dl.kullanici_id,
          k.ad_soyad AS kullanici_ad_soyad,
          k.eposta AS kullanici_eposta,
          dl.aksiyon,
          dl.varlik_adi,
          dl.varlik_id,
          dl.ip_adresi,
          DATE_FORMAT(dl.olusturma_zamani, '%Y-%m-%dT%H:%i:%s') AS olusturma_zamani
        FROM denetim_loglari dl
        LEFT JOIN kullanicilar k ON k.kullanici_id = dl.kullanici_id
        ORDER BY dl.olusturma_zamani DESC, dl.denetim_log_id DESC
        LIMIT 250
      `,
    );
  }

  private getStats() {
    return this.database.query<StatsRow>(
      `
        SELECT
          (SELECT COUNT(*) FROM kullanicilar) AS toplam_kullanici,
          (SELECT COUNT(*) FROM kullanicilar WHERE aktif_mi = 1) AS aktif_kullanici,
          (
            SELECT COUNT(*)
            FROM denetim_loglari
            WHERE aksiyon IN ('auth.microsoft.login_success', 'LOGIN')
              AND DATE(olusturma_zamani) = CURRENT_DATE()
          ) AS bugun_girisler,
          (
            SELECT COUNT(*)
            FROM denetim_loglari
            WHERE DATE(olusturma_zamani) = CURRENT_DATE()
          ) AS bugun_islemler
      `,
    );
  }
}
