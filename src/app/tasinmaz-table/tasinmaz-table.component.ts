import { Component, OnInit } from '@angular/core';
import { IlService } from '../../services/ilServices/il.service';
import { IlceService } from '../../services/ilceServices/ilce.service';
import { MahalleService } from '../../services/mahalleServices/mahalle.service';
import { TasinmazService } from '../../services/tasinmazServices/tasinmaz.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tasinmaz-table',
  templateUrl: './tasinmaz-table.component.html',
  styleUrls: ['./tasinmaz-table.component.css']
})
export class TasinmazTableComponent implements OnInit {
  tasinmazlar: any[] = [];
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];
  selectedTasinmaz: any = null;

  constructor(
    private ilService: IlService,
    private ilceService: IlceService,
    private mahalleService: MahalleService,
    private tasinmazService: TasinmazService,
    private toastr: ToastrService,
    private router: Router
  ) { 
  
  }

  ngOnInit(): void {
    this.getTasinmazlar();
  }

  getTasinmazlar() {
    this.tasinmazService.getTasinmazlar().subscribe(tasinmazData => {
      this.tasinmazlar = tasinmazData;
      this.getIller();
    });
  }

  getIller() {
    this.ilService.getIller().subscribe(ilData => {
      this.iller = ilData;
      this.getIlceler();
    });
  }

  getIlceler() {
    this.ilceService.getIlceler().subscribe(ilceData => {
      this.ilceler = ilceData;
      this.getMahalleler();
    });
  }

  getMahalleler() {
    this.mahalleService.getMahalleler().subscribe(mahalleData => {
      this.mahalleler = mahalleData;
      this.mergeData();
    });
  }

  mergeData() {
    this.tasinmazlar.forEach(tasinmaz => {
      const mahalle = this.mahalleler.find(m => m.mahalleId === tasinmaz.mahalleId);
      if (mahalle && mahalle.ilce) {
        const ilce = this.ilceler.find(i => i.ilceId === mahalle.ilce.ilceId);
        const il = this.iller.find(il => il.ilId === ilce.il.ilId);
        tasinmaz.ilAd = il ? il.ilAdi : null;
        tasinmaz.ilceAd = ilce ? ilce.ilceAdi : null;
        tasinmaz.mahalleAd = mahalle ? mahalle.mahalleAdi : null;
      }
    });
    this.tasinmazlar.sort((a, b) => a.tasinmazId - b.tasinmazId);
  }

  toggleSelection(tasinmaz: any) {
    if (this.selectedTasinmaz === tasinmaz) {
      this.selectedTasinmaz = null; // Unselect if already selected
    } else {
      this.selectedTasinmaz = tasinmaz; // Select new item
    }
  }

  isSelected(tasinmaz: any): boolean {
    
    return this.selectedTasinmaz === tasinmaz;
  } 

  deleteSelected() {
    const selectedTasinmaz = this.selectedTasinmaz; // Seçili taşınmazı al
    if (!selectedTasinmaz) {
      this.toastr.warning('Lütfen silmek için bir taşınmaz seçin.', 'Uyarı');
      return;
    }

    this.tasinmazService.deleteTasinmaz(selectedTasinmaz.tasinmazId).subscribe(
      () => {
        this.toastr.success('Taşınmaz başarıyla silindi.', 'Başarılı');
        this.getTasinmazlar(); // Tabloyu yenile
        this.selectedTasinmaz = null; // Seçimi temizle
        
      },
      error => {
        this.toastr.error('Taşınmaz silinirken bir hata oluştu.', 'Hata');
      }
    );
  }
  navigateToUpdate() {
    if (!this.selectedTasinmaz) {
      this.toastr.error('Güncellemek için bir taşınmaz seçin.', 'Hata');
      return;
    }
    
    // Seçili taşınmazın ID'sini alın
    const selectedItemId = this.selectedTasinmaz.tasinmazId;
  
    // ID'ye sahip olan sayfaya yönlendirin
    this.router.navigate([`/update-tasinmaz/${selectedItemId}`]);
  } 
}
