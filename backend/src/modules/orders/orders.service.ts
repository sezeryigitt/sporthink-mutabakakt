import { Injectable, NotFoundException } from '@nestjs/common';
import { RowDataPacket } from 'mysql2';
import { DatabaseService, QueryParam } from '../../database/database.service';
import { OrderDetailQuery } from './dto/order-detail.query';

type QueryParts = {
  clause: string;
  params: QueryParam[];
};

@Injectable()
export class OrdersService {
  constructor(private readonly database: DatabaseService) {}

  async findOne(siparisNo: string, query: OrderDetailQuery) {
    const filter = this.buildOrderFilter(siparisNo, query);

    const [
      siparisSatirlari,
      finansOzeti,
      erpSatisSatirlari,
      erpIadeSatirlari,
      iadeIptalSatirlari,
      finansalHareketler,
      komisyonMutabakatlari,
      desiMutabakatlari,
      karlilikOzetleri,
    ] = await Promise.all([
      this.findOrderLines(filter),
      this.findFinancialSummaryRows(filter),
      this.findErpSalesRows(filter),
      this.findErpReturnRows(filter),
      this.findMarketplaceReturnRows(filter),
      this.findFinancialMovements(filter),
      this.findCommissionReconciliations(filter),
      this.findDesiReconciliations(filter),
      this.findProfitabilitySummaries(filter),
    ]);

    if (siparisSatirlari.length === 0 && finansalHareketler.length === 0) {
      throw new NotFoundException('Siparis bulunamadi.');
    }

    return {
      data: {
        siparis_no: siparisNo,
        pazaryeri_id: query.pazaryeri_id ?? null,
        siparis_satirlari: siparisSatirlari,
        finans_ozeti: finansOzeti,
        erp_satis_satirlari: erpSatisSatirlari,
        erp_iade_satirlari: erpIadeSatirlari,
        pazaryeri_iade_iptal_satirlari: iadeIptalSatirlari,
        pazaryeri_finansal_hareketleri: finansalHareketler,
        komisyon_mutabakatlari: komisyonMutabakatlari,
        desi_mutabakatlari: desiMutabakatlari,
        siparis_karlilik_ozetleri: karlilikOzetleri,
      },
    };
  }

  async findFinancialSummary(siparisNo: string, query: OrderDetailQuery) {
    const rows = await this.findFinancialSummaryRows(this.buildOrderFilter(siparisNo, query));
    return { data: rows };
  }

  private buildOrderFilter(siparisNo: string, query: OrderDetailQuery): QueryParts {
    const clauses = ['siparis_no = ?'];
    const params: QueryParam[] = [siparisNo];

    if (query.pazaryeri_id) {
      clauses.push('pazaryeri_id = ?');
      params.push(query.pazaryeri_id);
    }

    return {
      clause: clauses.join(' AND '),
      params,
    };
  }

  private findOrderLines(filter: QueryParts) {
    return this.database.query<RowDataPacket>(
      `
        SELECT
          siparis_satir_id,
          pazaryeri_id,
          pazaryeri_hesap_id,
          siparis_no,
          pazaryeri_siparis_no,
          paket_no,
          takip_no,
          urun_id,
          barkod,
          sku,
          urun_adi,
          adet,
          birim_fiyat,
          brut_tutar,
          kdv_orani,
          kdv_haric_tutar,
          siparis_durumu,
          siparis_olusturma_zamani,
          kargo_gonderim_zamani,
          kargo_firma_id,
          tahmini_desi,
          pazaryeri_fiyati
        FROM siparis_satirlari
        WHERE ${filter.clause}
        ORDER BY siparis_satir_id ASC
      `,
      filter.params,
    );
  }

  private findFinancialSummaryRows(filter: QueryParts) {
    return this.database.query<RowDataPacket>(
      `
        SELECT
          pazaryeri_id,
          pazaryeri_kodu,
          siparis_no,
          brut_satis_tutari,
          komisyon_gideri,
          kargo_gideri,
          ceza_gideri,
          ek_bedel_gideri,
          diger_gelir_tutari,
          toplam_gider_tutari
        FROM vw_siparis_finans_ozeti
        WHERE ${filter.clause}
        ORDER BY pazaryeri_id ASC
      `,
      filter.params,
    );
  }

  private findErpSalesRows(filter: QueryParts) {
    return this.database.query<RowDataPacket>(
      `
        SELECT
          erp_satis_satir_id,
          siparis_no,
          satis_yeri_kodu,
          satis_yeri_adi,
          fatura_no,
          belge_takip_no,
          urun_id,
          barkod,
          sku,
          marka,
          musteri_kodu,
          musteri_adi,
          adet,
          birim_maliyet,
          toplam_maliyet,
          kdv_haric_tutar,
          kdv_tutari,
          kdv_dahil_tutar,
          fatura_tarihi
        FROM erp_satis_satirlari
        WHERE siparis_no = ?
        ORDER BY erp_satis_satir_id ASC
      `,
      [filter.params[0]],
    );
  }

  private findErpReturnRows(filter: QueryParts) {
    return this.database.query<RowDataPacket>(
      `
        SELECT
          erp_iade_satir_id,
          siparis_no,
          iade_fatura_no,
          asil_fatura_no,
          urun_id,
          barkod,
          sku,
          marka,
          musteri_kodu,
          musteri_adi,
          adet,
          kdv_haric_tutar,
          kdv_tutari,
          kdv_dahil_tutar,
          iade_fatura_tarihi
        FROM erp_iade_satirlari
        WHERE siparis_no = ?
        ORDER BY erp_iade_satir_id ASC
      `,
      [filter.params[0]],
    );
  }

  private findMarketplaceReturnRows(filter: QueryParts) {
    return this.database.query<RowDataPacket>(
      `
        SELECT
          pazaryeri_iade_iptal_satir_id,
          pazaryeri_id,
          siparis_satir_id,
          siparis_no,
          paket_no,
          barkod,
          urun_id,
          iade_iptal_turu,
          neden,
          adet,
          tutar,
          iade_iptal_zamani,
          durum
        FROM pazaryeri_iade_iptal_satirlari
        WHERE ${filter.clause}
        ORDER BY pazaryeri_iade_iptal_satir_id ASC
      `,
      filter.params,
    );
  }

  private findFinancialMovements(filter: QueryParts) {
    return this.database.query<RowDataPacket>(
      `
        SELECT
          fh.pazaryeri_finansal_hareket_id,
          fh.pazaryeri_id,
          fh.siparis_satir_id,
          fh.kaynak_belge_id,
          fh.kesinti_kategori_id,
          kk.kesinti_kodu,
          kk.kesinti_adi,
          kk.ana_grup,
          fh.siparis_no,
          fh.pazaryeri_siparis_no,
          fh.paket_no,
          fh.barkod,
          fh.urun_id,
          fh.hareket_yonu,
          fh.tutar,
          fh.kdv_tutari,
          fh.adet,
          fh.desi,
          fh.komisyon_orani_yuzde,
          fh.islem_zamani,
          fh.vade_tarihi,
          fh.fatura_no,
          fh.dis_kayit_no,
          fh.aciklama
        FROM pazaryeri_finansal_hareketleri fh
        JOIN kesinti_kategorileri kk
          ON kk.kesinti_kategori_id = fh.kesinti_kategori_id
        WHERE fh.${filter.clause}
        ORDER BY fh.islem_zamani ASC, fh.pazaryeri_finansal_hareket_id ASC
      `,
      filter.params,
    );
  }

  private findCommissionReconciliations(filter: QueryParts) {
    return this.database.query<RowDataPacket>(
      `
        SELECT
          komisyon_mutabakat_id,
          pazaryeri_id,
          siparis_satir_id,
          siparis_no,
          barkod,
          hesaplanan_matrah_tutari,
          beklenen_oran_yuzde,
          faturalanan_oran_yuzde,
          beklenen_komisyon_tutari,
          faturalanan_komisyon_tutari,
          fark_tutari,
          tolerans_tutari,
          mutabakat_durumu,
          hesaplama_zamani,
          inceleyen_kullanici,
          inceleme_zamani,
          aciklama
        FROM komisyon_mutabakatlari
        WHERE ${filter.clause}
        ORDER BY komisyon_mutabakat_id ASC
      `,
      filter.params,
    );
  }

  private findDesiReconciliations(filter: QueryParts) {
    return this.database.query<RowDataPacket>(
      `
        SELECT
          desi_mutabakat_id,
          pazaryeri_id,
          siparis_satir_id,
          pazaryeri_finansal_hareket_id,
          siparis_no,
          paket_no,
          takip_no,
          kargo_firma_id,
          beklenen_desi,
          faturalanan_desi,
          beklenen_kargo_tutari,
          faturalanan_kargo_tutari,
          desi_farki,
          tutar_farki,
          tolerans_tutari,
          mutabakat_durumu,
          hesaplama_zamani,
          inceleyen_kullanici,
          inceleme_zamani,
          aciklama
        FROM desi_mutabakatlari
        WHERE ${filter.clause}
        ORDER BY desi_mutabakat_id ASC
      `,
      filter.params,
    );
  }

  private findProfitabilitySummaries(filter: QueryParts) {
    return this.database.query<RowDataPacket>(
      `
        SELECT
          siparis_karlilik_ozet_id,
          pazaryeri_id,
          siparis_no,
          ozet_tarihi,
          brut_satis_tutari,
          iade_iptal_tutari,
          komisyon_gideri,
          kargo_gideri,
          ceza_gideri,
          ek_bedel_gideri,
          indirim_tutari,
          vergi_gideri,
          desi_farki_tutari,
          komisyon_farki_tutari,
          urun_maliyeti,
          net_gelir,
          net_kar,
          kar_marji_yuzde,
          genel_mutabakat_durumu,
          zarar_mi,
          hesaplama_zamani
        FROM siparis_karlilik_ozetleri
        WHERE ${filter.clause}
        ORDER BY ozet_tarihi DESC, siparis_karlilik_ozet_id DESC
      `,
      filter.params,
    );
  }
}
