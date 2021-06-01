import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmailSettingsService } from 'src/app/modules/auth/_services/emailSettings.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
interface EncryptionType {

 
  encryption: string;
}
@Component({
  selector: 'app-email-settings',
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.scss']
})
export class EmailSettingsComponent implements OnInit {

  public filteredencryptionTypeMulti: ReplaySubject<EncryptionType[]> = new ReplaySubject<EncryptionType[]>(1);

  public encryptionTypeMultiFilterCtrl: FormControl = new FormControl();
  protected _onDestroy = new Subject<void>();

  isLoading$
  model: any = {}
  formGroup:FormGroup;
  isLoading: boolean; 
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  public searching: boolean = false;
  private encryptionVal: EncryptionType[] = [
    { encryption: 'SSL'},
    { encryption: 'TSL'}, 
    { encryption: 'None' }, 
 

  ];
  constructor(private fb: FormBuilder,public cdr:ChangeDetectorRef,private toastr: ToastrService,private emailSettingsService:EmailSettingsService, private modalService: NgbModal) {
    const sb = this.emailSettingsService.isLoading$.subscribe(res => this.isLoading = res);
  this.getAllEmailSettings();
   }

  ngOnInit(): void {
    this.filteredencryptionTypeMulti.next(this.encryptionVal.slice()); 
    this.encryptionTypeMultiFilterCtrl.valueChanges
    .pipe(
      takeUntil(this._onDestroy))
    .subscribe(() => {
      this.searching = false;
      this.filterReferrals()
    },
      error => {
        // no errors in our simulated example
        this.searching = false;
        // handle error...
      });

      this.formGroup = this.fb.group({

        fromAddress: [''],
        server: [''],
        username: [''],
        password: [''],
        port: [''], 
        encryptiontype:[''],
        isSSL:['']
      })
  }


  public sslObj:any={};
  getAllEmailSettings(){

    this.emailSettingsService.getAllEmailSettings()
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.status == 0) { 
          
            this.isLoading$  = false;
          } else {
            var result = data.result[0];

            this.formGroup.controls['fromAddress'].setValue(result.fromAddress); 
            this.formGroup.controls['server'].setValue(result.server); 
            this.formGroup.controls['username'].setValue(result.username); 
            this.formGroup.controls['password'].setValue(result.password); 
            this.formGroup.controls['port'].setValue(result.port); 
            this.formGroup.controls['encryptiontype'].setValue(result.encryptiontype); 
            this.formGroup.controls['isSSL'].setValue( result.isSSL ); 
            this.sslObj =result.isSSL 
            this.cdr.markForCheck();
            } 
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }

  changeSSl(data){
  
    if(data == false){
    this.sslObj = "" 

    }else{
       this.sslObj = "true" 

    }
  }
  onSubmit(){
    this.isLoading$ = true;   
    var Obj = this.formGroup.value;
    Obj.isSSL = this.sslObj
    this.emailSettingsService.createEmailSettings(Obj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message);
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message);  
            this.getAllEmailSettings();
            this.isLoading$  = false;

            }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  selectEncryptionType(val){

  }
  
  filterReferrals() {
    if (!this.encryptionVal) {
      return;
    }
    // get the search keyword
    let search = this.encryptionTypeMultiFilterCtrl.value;
    if (!search) {
      this.filteredencryptionTypeMulti.next(this.encryptionVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredencryptionTypeMulti.next(
      this.encryptionVal.filter(item => item.encryption.toLowerCase().indexOf(search) > -1 || item.encryption.toUpperCase().indexOf(search) > -1)
    );
  }
}
