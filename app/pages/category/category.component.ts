import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryService } from 'src/app/modules/auth/_services/category.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  @ViewChild('categoryopenModal') categoryopenModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;

  isLoading$ 
  isLoading: boolean; 
  categoryGroup: FormGroup;
  searchGroup:FormGroup;
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  categoryObj: any = {};
  isFlag:number = 1;
  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: NgbModal,
    public cdr:ChangeDetectorRef,
    public categoryService: CategoryService) {
    const sb = this.categoryService.isLoading$.subscribe(res => this.isLoading = res);

    this.grouping = this.categoryService.grouping;
    this.paginator = this.categoryService.paginator;
    this.sorting = this.categoryService.sorting;
    this.categoryService.fetch();
  }

  ngOnInit(): void {
    
    this.categoryGroup = this.fb.group({
      id:[''],
      categoryName: ['', Validators.compose([Validators.required])]

    });
    this.searchForm();
  }
  editModal() {
    this.isFlag = 1;
    this.modalService.open(this.categoryopenModal);
    this.categoryObj = {};
    this.categoryGroup.reset();
  }
  closeModal() {
    // this.categoryService.fetch()
    this.modalService.dismissAll();
    // this.categoryGroup.reset();
  }

  editCategory(data){
    this.isFlag = 2;
    this.modalService.open(this.categoryopenModal)
    this.categoryObj = data;

    this.categoryGroup.controls['id'].setValue(data.id); 

    this.categoryGroup.controls['categoryName'].setValue(data.categoryName); 
  }
  editDelete(data){
    this.modalService.open(this.confrimBox)
    this.categoryObj = data;
  }

  addCategory(){

    this.categoryGroup.markAllAsTouched();
    if (!this.categoryGroup.valid) {
      return;
    } else {
    this.isLoading$ = true;  
    var Obj = this.categoryGroup.value;
    this.categoryService.createCategory(Obj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message);
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message); 
            this.categoryGroup.reset();
            this.categoryGroup.untouched;
            this.modalService.dismissAll();
            this.categoryService.fetch();
            this.isLoading$  = false;
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
      }
  }

  updateCategory(){

    this.categoryGroup.markAllAsTouched();
    if (!this.categoryGroup.valid) {
      return;
    } else {
    this.isLoading$ = true;   
    var Obj = this.categoryGroup.value;

    this.categoryService.updateCatgory(Obj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message);
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message); 
            this.categoryGroup.reset();
            this.categoryGroup.untouched;
            this.modalService.dismissAll();
            this.categoryService.fetch();
            this.isLoading$  = false;
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
      }
  }

  isDeleting:boolean = false;
  deleteCategory(){ 
    this.isDeleting = true;  
    this.categoryService.deleteCategory(this.categoryObj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message);
            this.isDeleting = false;
            this.cdr.markForCheck();
          } else {
            this.toastr.success(data.data.message); 
            this.categoryGroup.reset();
            this.categoryGroup.untouched;
            this.modalService.dismissAll();
            this.categoryService.fetch(); 
            this.isDeleting = false;
            this.cdr.markForCheck();

          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }

  closeDelete(){

    this.modalService.dismissAll();
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
    this.categoryService.patchState({ sorting });
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
    this.categoryService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  // pagination
  paginate(paginator: PaginatorState) {
    this.categoryService.patchState({ paginator });
  }
   // helpers for View
   isControlValid(controlName: string): boolean {
    const control = this.categoryGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.categoryGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.categoryGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.categoryGroup.controls[controlName];
    return control.dirty || control.touched;
  }

}
