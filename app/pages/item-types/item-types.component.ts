import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ItemTypeService } from 'src/app/modules/auth/_services/itemType.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-item-types',
  templateUrl: './item-types.component.html',
  styleUrls: ['./item-types.component.scss']
})
export class ItemTypesComponent implements OnInit {
  @ViewChild('itemopenModal') itemopenModal: TemplateRef<any>;
  @ViewChild('openChecklistModal') openChecklistModal: TemplateRef<any>;

  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;
  @ViewChild('confrimBoxChecklist') confrimBoxChecklist: TemplateRef<any>;



  itemTypeFormGroup: FormGroup;
  checklistFormGroup: FormGroup;

  searchGroup: FormGroup;
  isLoading: boolean;
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  isLoading$
  isFlag: number = 1
  flagCheck: number = 1;
  private subscriptions: Subscription[] = [];
  p: number
  isShow = false;
  public checkList = [];
  itemTypeObj: any = {};
  constructor(private fb: FormBuilder, private toastr: ToastrService,
    public cdr: ChangeDetectorRef,
    private modalService: NgbModal, public itemTypeService: ItemTypeService) {

    const sb = this.itemTypeService.isLoading$.subscribe(res => this.isLoading = res);
    this.grouping = this.itemTypeService.grouping;
    this.paginator = this.itemTypeService.paginator;
    this.sorting = this.itemTypeService.sorting;
    this.itemTypeService.fetch();
  }

  ngOnInit(): void {
    this.searchForm();
    this.itemTypeFormGroup = this.fb.group({
      id: [''],
      itemTypeName: ['', Validators.compose([Validators.required])],
    })
    this.checklistFormGroup = this.fb.group({
      id:[''],
      itemTypeID: [''],
      name: ['']
    })
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

  val: string
  search(searchTerm: string) {
    this.itemTypeService.patchState({ searchTerm: searchTerm.toLocaleLowerCase() });
  }
  editItemModal() {
    this.isFlag = 1;
    this.modalService.open(this.itemopenModal);
    this.itemTypeObj = {};
    this.itemTypeFormGroup.reset();
  }
  closeItemTypeModal() {
    this.modalService.dismissAll();
    // this.itemTypeFormGroup.reset(); 

  }

  editItemType(data) {
    this.isShow = true; 
    console.log(data)
    this.itemTypeObj = data;
    this.getCheckListByID(data.id) 
    this.itemTypeFormGroup.controls['id'].setValue(data.id);
    this.itemTypeFormGroup.controls['itemTypeName'].setValue(data.itemTypeName)
  }

  isChecklist: boolean = false;
  addItemType() {

    this.itemTypeFormGroup.markAllAsTouched();
    if (!this.itemTypeFormGroup.valid) {
      return;
    } else {
      this.isLoading$ = true;
      var Obj = this.itemTypeFormGroup.value;
      this.itemTypeService.createItemType(Obj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message);
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message);
              this.itemTypeFormGroup.reset();
              this.itemTypeFormGroup.untouched;
              this.modalService.dismissAll();
              this.itemTypeService.fetch();
              this.isLoading$ = false;
            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }

  updateItemType() {

    this.itemTypeFormGroup.markAllAsTouched();
    if (!this.itemTypeFormGroup.valid) {
      return;
    } else {
      this.isLoading$ = true;
      var Obj = this.itemTypeFormGroup.value;
      this.itemTypeService.updateItemType(Obj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message);
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message);
              this.itemTypeFormGroup.untouched;
              this.modalService.dismissAll();
              this.itemTypeService.fetch();
              this.isLoading$ = false;
              this.cdr.markForCheck()
            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }

  editDelete(data) {

    this.modalService.open(this.confrimBox)
    this.itemTypeObj = data;

    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     confirmButton: 'btn btn-success',
    //     cancelButton: 'btn btn-danger'
    //   },
    //   buttonsStyling: false
    // })

    // swalWithBootstrapButtons.fire({
    //   title: 'Are you sure?',
    //   text: "You won't be able to revert this!",
    //   icon: 'warning',
    //   showCancelButton: true,
    //   confirmButtonText: 'Yes, delete it!',
    //   cancelButtonText: 'No, cancel!',
    //   reverseButtons: true
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     swalWithBootstrapButtons.fire(
    //       'Deleted!',
    //       'Your file has been deleted.',
    //       'success'
    //     )
    //   } else if (
    //     /* Read more about handling dismissals below */
    //     result.dismiss === Swal.DismissReason.cancel
    //   ) {
    //     swalWithBootstrapButtons.fire(
    //       'Cancelled',
    //       'Your imaginary file is safe :)',
    //       'error'
    //     )
    //   }
    // })
  }

  isDeleting: boolean = false;
  deleteItemType() {

    this.isDeleting = true;
    this.itemTypeService.deleteItemType(this.itemTypeObj)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            this.toastr.error(data.data.message);
            this.isDeleting = false;
            this.cdr.markForCheck();
          } else {
            this.toastr.success(data.data.message);
            this.itemTypeFormGroup.reset();
            this.itemTypeFormGroup.untouched;
            this.modalService.dismissAll();
            this.itemTypeService.fetch();
            this.isDeleting = false;
            this.cdr.markForCheck();
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  closeDelete() {
    this.modalService.dismissAll();
  }
  backToMain(){
    this.isShow = false;
    this.itemTypeService.fetch()
    this.itemTypeObj = {}
    this.checkList = [];
  }
  addChecklistItem() {

    this.checklistFormGroup.markAllAsTouched();
    if (!this.checklistFormGroup.valid) {
      return;
    } else {
      this.isChecklist = true;
      var Obj = this.checklistFormGroup.value;
      Obj.itemTypeID = this.itemTypeObj.id;
      this.itemTypeService.createChecklist(Obj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message);
              this.isChecklist = false;
            } else {
              this.toastr.success(data.data.message);
              this.checklistFormGroup.reset();  
              this.modalService.dismissAll();
              this.getCheckListByID(this.itemTypeObj.id)   
              this.isChecklist = false;
              this.cdr.markForCheck()
            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }
  checkObj:any={}
  editChecklist(item) {
    this.flagCheck = 2;
    this.modalService.open(this.openChecklistModal);
    this.checklistFormGroup.controls['name'].setValue(item.name);
    this.checklistFormGroup.controls['id'].setValue(item.id);
    this.checkObj = item;

  }
  editChecklistItem() {
    this.flagCheck = 1;
    this.modalService.open(this.openChecklistModal)
    this.checklistFormGroup.reset()
  }
  delVal: any = {}
  editDeleteChecklist(item) {
    this.modalService.open(this.confrimBoxChecklist)
    this.delVal = item; 
    console.log(item)
  }
  updateChecklistItem() {
    this.checklistFormGroup.markAllAsTouched();
    if (!this.checklistFormGroup.valid) {
      return;
    } else {
      this.isChecklist = true;
      var Obj = this.checklistFormGroup.value;
      this.itemTypeService.updateChecklist(Obj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message);
              this.isChecklist = false;
            } else {
              this.toastr.success(data.data.message);
              this.checklistFormGroup.reset();
              this.checklistFormGroup.untouched;
              this.modalService.dismissAll();
              this.getCheckListByID(this.checkObj.itemTypeID)
              this.itemTypeService.fetch();
              this.isChecklist = false;
            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }
  
  deleteChecklistItem() {
    this.isChecklist = true;
    this.itemTypeService.deleteChecklist(this.delVal)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            this.toastr.error(data.data.message);
            this.isChecklist= false;
          } else {
            this.toastr.success(data.data.message);  
            this.getCheckListByID(this.delVal.itemTypeID) 
            this.modalService.dismissAll(); 
            this.isChecklist= false; 
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  closeChecklistModal() {
    this.modalService.dismissAll(this.openChecklistModal)
    this.checklistFormGroup.reset();
    this.itemTypeService.fetch()
  }

  closeDeleteChecklist() {
    this.modalService.dismissAll()
  }

  getCheckListByID(val) {

    var data = {
      itemTypeID:val
    }
    this.itemTypeService.getCheckListByID(data)
      .subscribe(
        data => {
          if (data.status == 0) {

            this.checkList = [];
            this.cdr.markForCheck()
          } else {

            this.checkList = data.result 

            this.cdr.markForCheck()
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
    this.itemTypeService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.itemTypeService.patchState({ paginator });
  }
  // Item type  
  isItemControlValid(controlName: string): boolean {
    const control = this.itemTypeFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isItemControlInvalid(controlName: string): boolean {
    const control = this.itemTypeFormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isItemcontrolHasError(validation, controlName): boolean {
    const control = this.itemTypeFormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isItemControlTouched(controlName): boolean {
    const control = this.itemTypeFormGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  //CheckList Form

  // Item type  
  isCheckItemControlValid(controlName: string): boolean {
    const control = this.checklistFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isCheckItemControlInvalid(controlName: string): boolean {
    const control = this.checklistFormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isCheckItemcontrolHasError(validation, controlName): boolean {
    const control = this.checklistFormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isCheckItemControlTouched(controlName): boolean {
    const control = this.checklistFormGroup.controls[controlName];
    return control.dirty || control.touched;
  }
}
