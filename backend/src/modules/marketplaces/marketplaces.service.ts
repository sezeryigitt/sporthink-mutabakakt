import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2';
import { DatabaseService, QueryParam } from '../../database/database.service';
import { ListMarketplacesQuery } from './dto/list-marketplaces.query';

@Injectable()
export class MarketplacesService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(query: ListMarketplacesQuery) {
    const params: QueryParam[] = [];
    const where: string[] = [];

    if (query.aktif_mi !== undefined) {
      where.push('aktif_mi = ?');
      params.push(['true', '1'].includes(query.aktif_mi) ? 1 : 0);
    }

    const rows = await this.database.query<RowDataPacket>(
      `
        SELECT
          pazaryeri_id,
          pazaryeri_kodu,
          pazaryeri_adi,
          aktif_mi,
          olusturma_zamani,
          guncelleme_zamani
        FROM pazaryerleri
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY pazaryeri_adi ASC
      `,
      params,
    );

    return { data: rows };
  }

  async findAccounts(pazaryeriId: string) {
    const rows = await this.database.query<RowDataPacket>(
      `
        SELECT
          pazaryeri_hesap_id,
          pazaryeri_id,
          satici_kodu,
          satici_adi,
          magaza_kodu,
          magaza_adi,
          vergi_no,
          aktif_mi,
          olusturma_zamani,
          guncelleme_zamani
        FROM pazaryeri_hesaplari
        WHERE pazaryeri_id = ?
        ORDER BY aktif_mi DESC, magaza_adi ASC, satici_adi ASC
      `,
      [pazaryeriId],
    );

    return { data: rows };
  }
}
