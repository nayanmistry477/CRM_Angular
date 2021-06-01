import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SupplierService } from 'src/app/modules/auth/_services/supplier.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {
  @ViewChild('openModal') openModal : TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox : TemplateRef<any>;

  isLoading$ 
  formGroup: FormGroup;
  searchGroup:FormGroup;
  isFlag:number = 1;
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  isLoading: boolean;
  isDeleting:boolean = false;
  supplierObj:any={};
  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder,public cdr:ChangeDetectorRef,private toastr: ToastrService, private modalService: NgbModal, public supplierService: SupplierService) {

      this.modalService.dismissAll()
      const sb = this.supplierService.isLoading$.subscribe(res => this.isLoading = res); 
      this.grouping = this.supplierService.grouping;
      this.paginator = this.supplierService.paginator;
      this.sorting = this.supplierService.sorting;
      this.supplierService.fetch();
    }

    supplier:any={

      id:undefined,
      supplierName:''

    }

  ngOnInit(): void {

    this.formGroup = this.fb.group({
      id:[''],
      supplierName:['',Validators.compose([Validators.required])]
    });
    this.searchForm(); 
  }


  editModal(){
    this.isFlag = 1;
    this.formGroup.reset();  
    this.formGroup.markAsUntouched();
    this.supplierObj = {};
    this.modalService.open(this.openModal);
 
 }

 editSupplier(data){
  this.isFlag = 2;
  this.modalService.open(this.openModal)
  // this.supplierObj = data
  this.formGroup.controls['id'].setValue(data.id); 

  this.formGroup.controls['supplierName'].setValue(data.supplierName); 
 }
 closeModal(){
  // this.formGroup.reset();
   this.modalService.dismissAll(); 
  //  this.formGroup.markAsUntouched(); 
 }

 onSubmit(){
  this.formGroup.markAllAsTouched();
  if (!this.formGroup.valid) {
    return;
  } else {
  this.isLoading$ = true;  
   var obj = this.formGroup.value
  this.supplierService.createSupplier(obj)
  .subscribe(
    data => {
      console.log(data.data.status)
      if (data.data.status == 0) { 
        this.toastr.error(data.data.message)
        this.isLoading$  = false;
      } else {
        this.toastr.success(data.data.message)
        this.supplierService.fetch();
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
    this.supplierService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.supplierService.patchState({ paginator });
  }
 updateSupplier(){
  this.formGroup.markAllAsTouched();
  if (!this.formGroup.valid) {
    return;
  } else {
  this.isLoading$ = true;   
  var obj = this.formGroup.value

  this.supplierService.updateSupplier(obj)
    .subscribe(
      data => {
         if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isLoading$  = false;
        } else {
          this.toastr.success(data.data.message)
          this.supplierService.fetch();
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
 editDeleteModal(data){
   this.modalService.open(this.confrimBox)
  this.supplierObj = data;
 }
 closeDelete(){
   this.modalService.dismissAll();
 }
 deleteSupplier(){ 
  this.isDeleting  = true;

  this.supplierService.deleteSupplier(this.supplierObj)
    .subscribe(
      data => {
        console.log(data.data.status)
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isDeleting = false;
        } else {
          this.toastr.success(data.data.message)
          this.supplierService.fetch();
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
 searchForm() {
  this.searchGroup = this.fb.group({
    searchTerm: [''],
  });
  const searchEvent = this.searchGroup.controls.searchTerm.valueChanges
    .pipe(
      /*
    The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator,
    we are limiting the amount of server requests emitted to a maximum of one every 150ms
    */
      debounceTime(150),
      distinctUntilChanged()
    )
    .subscribe((val) => this.search(val));
  this.subscriptions.push(searchEvent);
}

val:string
search(searchTerm: string) { 
  this.supplierService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
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
