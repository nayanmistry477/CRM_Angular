import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ReferredByService } from 'src/app/modules/auth/_services/referredBy.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.scss']
})
export class ReferralsComponent implements OnInit {
  @ViewChild('openModal') openModal : TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;

  isLoading$ 
  formGroup: FormGroup;
  isLoading: boolean;
  public searching: boolean = false;
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  referralObj:any = {};
  isFlag:number = 1;
  private subscriptions: Subscription[] = [];
  isDeleting:boolean = false;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    public referredByService:ReferredByService,
    public cdr:ChangeDetectorRef,
    private toastr: ToastrService) { 
    this.modalService.dismissAll();
    const sb = this.referredByService.isLoading$.subscribe(res => this.isLoading = res); 
    this.grouping = this.referredByService.grouping;
    this.paginator = this.referredByService.paginator;
    this.sorting = this.referredByService.sorting;
    this.referredByService.fetch();
     }

    
  ngOnInit(): void {

    this.formGroup = this.fb.group({ 
      id:[''],
      referredBy:['',Validators.compose([Validators.required])]
    })
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
  editModal(){
    this.isFlag = 1;
    this.modalService.open(this.openModal);
    this.formGroup.reset()
    this.referralObj = {}; 
    this.formGroup.markAsUntouched();
   
 
 }
 closeModal(){
    this.modalService.dismissAll();  
   this.referralObj = {};
 }


 onSubmit(){
  this.formGroup.markAllAsTouched();
  if (!this.formGroup.valid) {
    return;
  } else {
  this.isLoading$ = true;   
  var obj = this.formGroup.value

  this.referredByService.createReferredBy(obj)
    .subscribe(
      data => {
         if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isLoading$  = false;
        } else {
          this.toastr.success(data.data.message)
          this.referredByService.fetch();
          this.formGroup.reset();
          this.formGroup.untouched;  
          this.modalService.dismissAll(); 
          this.isLoading$  = false; 

        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
    }
}

editReferredBy(data){
  this.isFlag = 2;
   this.modalService.open(this.openModal)
   this.formGroup.controls['id'].setValue(data.id);   
   this.formGroup.controls['referredBy'].setValue(data.referredBy);   
 }
 updateReferredBy(){
  this.formGroup.markAllAsTouched();
  if (!this.formGroup.valid) {
    return;
  } else {
  this.isLoading$ = true;   
  var obj = this.formGroup.value

  this.referredByService.updateReferredBy(obj)
    .subscribe(
      data => {
         if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isLoading$  = false;
        } else {
          this.toastr.success(data.data.message)
          this.referredByService.fetch();
          this.formGroup.reset();
          this.formGroup.untouched;  
          this.modalService.dismissAll(); 
          this.isLoading$  = false; 

        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
    }
 }

 editDelete(data){

  this.modalService.open(this.confrimBox);
  this.referralObj = data;
 }
 closeDelete(){
   this.modalService.dismissAll();
 }
 deleteReferredBy(){ 
  this.isDeleting = true;
  this.referredByService.deleteReferredBy(this.referralObj)
    .subscribe(
      data => {
         if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isDeleting = false;
          this.cdr.markForCheck();
        } else {
          this.toastr.success(data.data.message)
          this.referredByService.fetch();
          this.formGroup.reset();
          this.formGroup.untouched;  
          this.modalService.dismissAll();  
          this.isDeleting = false;
          this.cdr.markForCheck();
        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
 }
   // sorting
   sort(column: string) {
    const sorting = this.sorting;
    const isActiveColumn = sorting.column === column;
    if (!isActiveColumn) {
      sorting.column = column;
      sorting.direction = 'asc';
    } else {
      sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
    }
    this.referredByService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.referredByService.patchState({ paginator });
  }


 
 isControlValid(controlName: string): boolean {
  const control = this.formGroup.controls[controlName];
  return control.valid && (control.dirty || control.touched);
}

isControlInvalid(controlName: string): boolean {
  const control = this.formGroup.controls[controlName];
  return control.invalid && (control.dirty || control.touched);
}

controlHasError(validation, controlName): boolean {
  const control = this.formGroup.controls[controlName];
  return control.hasError(validation) && (control.dirty || control.touched);
}

isControlTouched(controlName): boolean {
  const control = this.formGroup.controls[controlName];
  return control.dirty || control.touched;
}
}
