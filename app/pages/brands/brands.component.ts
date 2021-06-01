import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BrandService } from 'src/app/modules/auth/_services/brand.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
  @ViewChild('brandopenModal') brandopenModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;

  isLoading$ 
  isLoading: boolean;
  isFlag:number = 1;
  brandGroup: FormGroup;
  searchGroup:FormGroup;
  brandObj: any = {};
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder,
    private toastr: ToastrService, 
    public brandService:BrandService,
    public cdr:ChangeDetectorRef,
    private modalService: NgbModal) { 

      const sb = this.brandService.isLoading$.subscribe(res => this.isLoading = res); 
      this.grouping = this.brandService.grouping;
      this.paginator = this.brandService.paginator;
      this.sorting = this.brandService.sorting;
      this.brandService.fetch(); 
    }

  ngOnInit(): void {
    this.searchForm();
    this.brandGroup = this.fb.group({

      id:[''],
      brandName: ['', Validators.compose([Validators.required])]

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
    this.brandService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
  editBrandModal() {
    this.isFlag = 1; 
    this.brandObj = {};
    this.modalService.open(this.brandopenModal);
    this.brandGroup.reset();
  }

  closeBrand() {
    this.modalService.dismissAll();
    // this.brandService.fetch(); 
    // this.brandGroup.reset();
  }

  addBrand(){
    this.brandGroup.markAllAsTouched();
    if (!this.brandGroup.valid) {
      return;
    }else{
    this.isLoading$ = true; 
    var Obj = this.brandGroup.value;

    this.brandService.createBrand(Obj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message)

            this.brandGroup.reset();
            this.brandGroup.untouched;
            this.modalService.dismissAll();
            this.brandService.fetch();
            this.isLoading$  = false;
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
      }
  }

  editBrand(data){

    this.isFlag = 2;
    // this.brandObj = data;
    this.modalService.open(this.brandopenModal);
    this.brandGroup.controls['id'].setValue(data.id);  
    this.brandGroup.controls['brandName'].setValue(data.brandName); 
  }

  updateBrand(){
    this.brandGroup.markAllAsTouched();
    if (!this.brandGroup.valid) {
      return;
    }else{
    this.isLoading$ = true; 
    var Obj = this.brandGroup.value;
    this.brandService.updateBrand(Obj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message)

            this.brandGroup.reset();
            this.brandGroup.untouched;
            this.modalService.dismissAll();
            this.brandService.fetch();
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
    this.brandObj = data;
  }
  closeDelete(){
    this.modalService.dismissAll();

  }
  isDeleting:boolean=false;
  deleteBrand(){ 
    this.isDeleting = true;
    this.brandService.deleteBrand(this.brandObj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isDeleting = false;
            this.cdr.markForCheck();
          } else {
            this.toastr.success(data.data.message)

            this.brandGroup.reset();
            this.brandGroup.untouched;
            this.modalService.dismissAll();
            this.brandService.fetch(); 
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
      this.brandService.patchState({ sorting });
    }
  
    // pagination
    paginate(paginator: PaginatorState) {
      this.brandService.patchState({ paginator });
    }
  isBrandControlValid(controlName: string): boolean {
    const control = this.brandGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isBrandControlInvalid(controlName: string): boolean {
    const control = this.brandGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isBrandcontrolHasError(validation, controlName): boolean {
    const control = this.brandGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isBrandControlTouched(controlName): boolean {
    const control = this.brandGroup.controls[controlName];
    return control.dirty || control.touched;
  }

}
