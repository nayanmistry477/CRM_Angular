import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StorageService } from 'src/app/modules/auth/_services/storage.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-storage-location',
  templateUrl: './storage-location.component.html',
  styleUrls: ['./storage-location.component.scss']
})
export class StorageLocationComponent implements OnInit {
  @ViewChild('storageopenModal') storageopenModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;

  isLoading$
  model: any = {}
  locationGroup: FormGroup;
  searchGroup:FormGroup;
  private subscriptions: Subscription[] = []; 
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  isLoading: boolean;
  isFlag: number = 1;
  locationObj: any = {};
  isDeleting:boolean = false;

  constructor(private fb: FormBuilder,
    private toastr: ToastrService,
    public storageService: StorageService,
    public cdr:ChangeDetectorRef,
    private modalService: NgbModal) {
    this.modalService.dismissAll()

    const sb = this.storageService.isLoading$.subscribe(res => this.isLoading = res);
    this.grouping = this.storageService.grouping;
    this.paginator = this.storageService.paginator;
    this.sorting = this.storageService.sorting;
    this.storageService.fetch();
  }

  ngOnInit(): void {
    this.searchForm();
    this.locationGroup = this.fb.group({
      id: [''],
      storageName: ['', Validators.compose([Validators.required])]
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

  val:string
  search(searchTerm: string) { 
    this.storageService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  editModal() {
    this.isFlag = 1;
    this.modalService.open(this.storageopenModal);
    this.locationObj = {};
    this.locationGroup.reset();
  }

  editStorage(data) {
    this.isFlag = 2;
    this.modalService.open(this.storageopenModal);
    // this.locationObj = data;
    this.locationGroup.controls['id'].setValue(data.id);
    this.locationGroup.controls['storageName'].setValue(data.storageName)

  }

  closeLocation() {
    this.modalService.dismissAll();
    this.locationGroup.markAsUntouched();
    // this.storageService.fetch();

  }

  addLocation() {

    this.locationGroup.markAllAsTouched();
    if (!this.locationGroup.valid) {
      return;
    } else {
      this.isLoading$ = true;
      var Obj = this.locationGroup.value;
      // productObj.isWOOConnected	= this.formGroup.value
      this.storageService.createStorage(Obj)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {

              this.toastr.success(data.data.message)
              this.storageService.fetch();
              this.locationGroup.untouched;
              this.modalService.dismissAll();
              this.isLoading$ = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }

  updateLocation() { 
    this.locationGroup.markAllAsTouched();
    if (!this.locationGroup.valid) {
      return;
    } else {
      this.isLoading$ = true;
      var Obj = this.locationGroup.value;
      this.storageService.updateStorage(Obj)
        .subscribe(
          data => {
            // console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {

              this.toastr.success(data.data.message)
              this.storageService.fetch();
              this.locationGroup.untouched;
              this.modalService.dismissAll();
              this.isLoading$ = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
  }

  editdelete(data) {
    this.modalService.open(this.confrimBox)
    this.locationObj = data;
    this.storageService.fetch();

  }
  deleteStorage() {
    this.isDeleting = true; 

    this.storageService.deleteStorage(this.locationObj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.isDeleting = false;
          } else {

            this.toastr.success(data.data.message)
            this.storageService.fetch();
            this.locationGroup.untouched;
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

  closeDelete() {
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
    this.storageService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.storageService.patchState({ paginator });
  }
  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.locationGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.locationGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.locationGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.locationGroup.controls[controlName];
    return control.dirty || control.touched;
  }

}
