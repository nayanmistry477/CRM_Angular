import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AccompanyingService } from 'src/app/modules/auth/_services/accompanying.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-accompanying-items',
  templateUrl: './accompanying-items.component.html',
  styleUrls: ['./accompanying-items.component.scss']
})
export class AccompanyingItemsComponent implements OnInit {
  @ViewChild('acItemopenModal') acItemopenModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;

  isLoading$;
  isLoading: boolean;

  ACItemsGroup: FormGroup;
  searchGroup:FormGroup;
  acItemObj: any = {};
  isFlag:number = 1;
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder,
    private toastr: ToastrService, 
    public cdr:ChangeDetectorRef,
    public accompanyingService:AccompanyingService,
    private modalService: NgbModal) { 
      
      const sb = this.accompanyingService.isLoading$.subscribe(res => this.isLoading = res); 
      this.grouping = this.accompanyingService.grouping;
      this.paginator = this.accompanyingService.paginator;
      this.sorting = this.accompanyingService.sorting;
      this.accompanyingService.fetch(); 
    }
    public noWhitespaceValidator(control: FormControl) {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { 'whitespace': true };
  }
  ngOnInit(): void { 
    this.searchForm(); 
    this.ACItemsGroup = this.fb.group({
      id:[''],
      accompanyingName: ['', [Validators.required] ]
  
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
    this.accompanyingService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
  editACItemModal() {
    this.isFlag = 1; 
    this.ACItemsGroup.reset();
    this.acItemObj={};
    this.modalService.open(this.acItemopenModal);

  }
  closeACItem() {
    this.modalService.dismissAll();
    // this.accompanyingService.fetch();
    // this.ACItemsGroup.reset();
  }
  editAccompanying(data){
    this.isFlag = 2;

    this.modalService.open(this.acItemopenModal)
    this.ACItemsGroup.controls['id'].setValue(data.id); 

     this.ACItemsGroup.controls['accompanyingName'].setValue(data.accompanyingName); 

  }
  
  addACItem(){

    this.ACItemsGroup.markAllAsTouched();
    if (!this.ACItemsGroup.valid && this.ACItemsGroup.value.accompanyingName !=" ") {
      return;
    }else{
    this.isLoading$ = true; 
    
    var Obj = this.ACItemsGroup.value;
    this.accompanyingService.createAccompanying(Obj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message)

            this.ACItemsGroup.reset();
            this.ACItemsGroup.untouched;
            this.modalService.dismissAll();
            this.accompanyingService.fetch();
            this.isLoading$  = false;
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
      }
  }

  updateACItem(){

    this.ACItemsGroup.markAllAsTouched();
    if (!this.ACItemsGroup.valid) {
      return;
    }else{
    this.isLoading$ = true; 
    var Obj = this.ACItemsGroup.value;

    this.accompanyingService.updateAccompanying(Obj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message)

            this.ACItemsGroup.reset();
            this.ACItemsGroup.untouched;
            this.modalService.dismissAll();
            this.accompanyingService.fetch();
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
    this.modalService.open(this.confrimBox)
    this.acItemObj = data; 
  }

  closeDelete(){
    this.modalService.dismissAll();
  }

  isDeleting:boolean = false;
  deleteAccompanying(){ 
    this.isDeleting = true;
     
    this.accompanyingService.deleteAccompanying(this.acItemObj)
      .subscribe(
        data => {
          // console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isDeleting = false;
            this.cdr.markForCheck();
          } else {
            this.toastr.success(data.data.message)

            this.ACItemsGroup.reset();
            this.ACItemsGroup.untouched;
            this.modalService.dismissAll();
            this.accompanyingService.fetch(); 
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
      this.accompanyingService.patchState({ sorting });
    }
  
    // pagination
    paginate(paginator: PaginatorState) {
      this.accompanyingService.patchState({ paginator });
    }
 //Accompanying Items
 isACitemsControlValid(controlName: string): boolean {
  const control = this.ACItemsGroup.controls[controlName];
  return control.valid && (control.dirty || control.touched);
}

isACitemsControlInvalid(controlName: string): boolean {
  const control = this.ACItemsGroup.controls[controlName];
  return control.invalid && (control.dirty || control.touched);
}

isACitemscontrolHasError(validation, controlName): boolean {
  const control = this.ACItemsGroup.controls[controlName];
  return control.hasError(validation) && (control.dirty || control.touched);
}

isACitemsControlTouched(controlName): boolean {
  const control = this.ACItemsGroup.controls[controlName];
  return control.dirty || control.touched;
}

}
