import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CategoryService } from 'src/app/modules/auth/_services/category.service';
import { ProductService } from 'src/app/modules/auth/_services/product.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
interface Category { 
  category: string;
}
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  @ViewChild('openModal') openModal : TemplateRef<any>;
  @ViewChild('categoryopenModal')categoryopenModal:TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;


  isLoading$
  model:any={}
  formGroup: FormGroup;
  filterGroup: FormGroup;
  searchGroup: FormGroup;
  isWooIdSelected:Boolean = false;
  isShow: Boolean = false;
  public searching: boolean = false;
  categoryGroup:FormGroup;
  isLoading: boolean;

  product: any = {
    productName:'',
    wooProductID: undefined,
    sellPrice: '',
    costPrice: '', 
    category:'',
    isWOOConnected:false
  };
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  productObj:any={};
  categoryObj:any = {
    categoryName:''
   }
   isFlag:number = 1
   isDeleting:boolean = false;

  private categoryVal: any[] = [];
  public filteredcategoryMulti:ReplaySubject<Category[]> = new ReplaySubject<Category[]>(1);
  public categoryMultiFilterCtrl: FormControl =new FormControl();
  protected _onDestroy = new Subject<void>(); 
  private subscriptions: Subscription[] = [];
  constructor(private fb: FormBuilder,
    private toastr: ToastrService,
    public cdr:ChangeDetectorRef,
    public categoryService: CategoryService,
    private modalService: NgbModal, public productService: ProductService) {
 
    this.modalService.dismissAll();
    const sb = this.productService.isLoading$.subscribe(res => this.isLoading = res); 
    this.grouping = this.productService.grouping;
    this.paginator = this.productService.paginator;
    this.sorting = this.productService.sorting;
    this.productService.fetch(); 
   }
  ngOnInit(): void {
    
    this.getAllCategories();
    this.searchForm();
    // this.filteredcategoryMulti.next(this.categoryVal.slice());
    // this.categoryMultiFilterCtrl.valueChanges
    // .pipe(
    //   takeUntil(this._onDestroy))
    // .subscribe(() => {
    //   this.searching = false;
    //   this.filterCategory()
    // },
    //   error => {
    //     // no errors in our simulated example
    //     this.searching = false;
    //     // handle error...
    //   });
    this.formGroup = this.fb.group({
      wooProductID: [this.product.wooProductID],
      productName: [this.product.productName, Validators.compose([Validators.required])],
      sellPrice: [this.product.sellPrice, Validators.required],
      costPrice: [this.product.costPrice,Validators.required],
      isWOOConnected: [this.product.isWOOConnected],
      category:['',Validators.compose([Validators.required])],
      reorderLevel:['',Validators.compose([Validators.required])],
      // quantity:['',Validators.required]
      // dob: [this.customer.dateOfBbirth, Validators.compose([Validators.nullValidator])], 
    });
    this.categoryGroup = this.fb.group({ 
      categoryName:[this.categoryObj.categoryName,Validators.compose([Validators.required])]
    });
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
  checkedEvent(val){
    console.log(val)
  }

  editModal(){
    this.isShow = true;
    this.isFlag = 1;
    this.formGroup.reset();
    this.productObj = {};
    this.formGroup.markAsUntouched();
 
 }
 closeModal(){
  //  this.modalService.dismissAll();
  // this.productService.fetch();
  this.isShow = false;
  //  this.formGroup.reset(); 
  //  this.formGroup.markAsUntouched();

 }
 editCategoryModal(){
  this.modalService.open(this.categoryopenModal)
  this.categoryGroup.reset()
  this.categoryGroup.untouched
}
closeCategoryModal(){
  this.modalService.dismissAll()
  this.categoryGroup.reset();
  this.categoryGroup.untouched;
}
selectCategory(value){
  console.log(value)
}
addCategory(){ 

  this.categoryGroup.markAllAsTouched();
  if (!this.categoryGroup.valid) {
    return;
  }else{
    this.isLoading$ = true;  
    var Obj = this.categoryGroup.value;
    // productObj.isWOOConnected	= this.formGroup.value
  this.categoryService.createCategory(Obj)
    .subscribe(
      data => {
        // console.log(data.data.status)
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isLoading$  = false;
        } else {
          this.toastr.success(data.data.message)
          this.productObj.category = this.categoryGroup.value.categoryName;
           this.getAllCategories();
          this.categoryGroup.untouched;  
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
      this.productService.patchState({ sorting });
    }
  
    // pagination
    paginate(paginator: PaginatorState) {
      this.productService.patchState({ paginator });
    }
 onSubmit(){ 

   if(this.formGroup.value.isWOOConnected == true){
    if(this.formGroup.value.wooProductID != null && this.formGroup.value.wooProductID != ""){
      // alert('With WOO ID');
       this.SubmitProduct();
       } else{
        // alert('Please Enter WOO ID'); 
        this.toastr.warning('Please Enter WOO ID')
        this.formGroup.markAllAsTouched();

      }
    }else{
    
        // alert('done');
        this.SubmitProduct()

        // console.log(this.formGroup.value)
    
    }
 }
 editProduct(data){
   this.isShow = true;
  this.isFlag = 2;
  this.productObj = data;

  
  if(this.productObj.isWOOConnected == "false"){
    this.isWooIdSelected = false; 
    this.productObj.isWOOConnected = false

  }else{

    this.isWooIdSelected = true
    this.productObj.isWOOConnected = true
  }
  console.log(data)
 }
 getAllCategories() { 

  this.productService.getAllCategories()
    .subscribe(
      data => { 
        if (data.status == 0) {  
          this.categoryVal = [];
         } else {  
          var list= [];
          var str={}
          data.result.forEach(element => {
            str={category:element.categoryName};
            list.push(str);
          });
          this.categoryVal = list;
          this.filteredcategoryMulti.next(this.categoryVal.slice()); 
          this.categoryMultiFilterCtrl.valueChanges
          .pipe(
            takeUntil(this._onDestroy))
          .subscribe(() => {
            this.searching = false;
            this.filterCategory()
          },
            error => {
              // no errors in our simulated example
              this.searching = false;
              // handle error...
            });
        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      }); 
}
 deleteProduct(){
  
  this.isDeleting = true;
  this.productService.deleteProduct(this.productObj)
    .subscribe(
      data => {
        console.log(data.data.status)
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isDeleting = false;
          this.cdr.markForCheck();
        } else {
          this.toastr.success(data.data.message)
          this.modalService.dismissAll()
          this.formGroup.reset();
          this.formGroup.untouched; 
          this.productService.fetch(); 
          this.isShow = false;
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
   this.modalService.dismissAll()
  // this.productService.fetch();
}

editDeletemodal(data){
  this.productObj = data;
 this.modalService.open(this.confrimBox)
}
 SubmitProduct(){
 
  this.formGroup.markAllAsTouched();
  if (!this.formGroup.valid) {
    return;
  }else{

 
   var Obj = this.formGroup.value;
   if(Obj.isWOOConnected == null){
     Obj.isWOOConnected = "false"
   } else{
     Obj.isWOOConnected =  JSON.stringify(this.productObj.isWOOConnected);

   }

  const productObj = this.formGroup.value; 

  if(this.formGroup.value.category != undefined && this.formGroup.value.category != null){
    var category = this.formGroup.value.category 
 
    productObj.category = category; 
  }
  this.isLoading$ = true;  
    // productObj.isWOOConnected	 = this.formGroup.value
  this.productService.createProduct(productObj)
    .subscribe(
      data => {
        console.log(data.data.status)
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isLoading$  = false;
        } else {
          this.toastr.success(data.data.message)
          this.productService.fetch();
          this.formGroup.reset();
          this.formGroup.untouched; 
          this.productService.fetch();
          this.isLoading$  = false;
          this.isShow = false;

        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
       }
 }
 updateProduct(){ 

  if( this.isWooIdSelected == true){
    this.productObj.isWOOConnected = "true"

    if(this.formGroup.value.wooProductID != null && this.formGroup.value.wooProductID != ""){
      // alert('With WOO ID');
       this.updateProductSubmit();
       } else{
        // alert('Please Enter WOO ID'); 
        this.toastr.warning('Please Enter WOO ID')
        // this.SubmitProduct()
  
      }

  }else{
    this.productObj.isWOOConnected = "false"
    this.productObj.wooProductID = null
    this.updateProductSubmit();

    
  } 

 }

 updateProductSubmit(){

  this.formGroup.markAllAsTouched();
  if (!this.formGroup.valid) {
    return;
  }else{
      
  this.isLoading$ = true; 
  this.productService.updateProduct(this.productObj)
  .subscribe(
    data => {
      console.log(data.data.status)
      if (data.data.status == 0) { 
        this.toastr.error(data.data.message)
        this.isLoading$  = false;
      } else {
        this.toastr.success(data.data.message)
        this.productService.fetch();
        this.formGroup.reset();
        this.formGroup.untouched; 
        this.productService.fetch();
        this.isLoading$  = false;
        this.isShow = false;

      }
    },
    error => {
      // this.showError(error.statusText);
      console.log(error);
    });
  }
 }

 selectWOO(val){
  
  console.log(val)
  if(val == true){
    this.isWooIdSelected = true;
    this.formGroup.controls['isWOOConnected'].setValue(true)

    
  }else{
   this.isWooIdSelected = false;  
   this.formGroup.controls['isWOOConnected'].setValue(false)

   this.formGroup.controls['wooProductID'].reset() 
  } 
}

filterCategory(){
  if (!this.categoryVal) {
    return;
  }
  // get the search keyword
  let search = this.categoryMultiFilterCtrl.value;
  if (!search) {
    this.filteredcategoryMulti.next(this.categoryVal.slice());
    return;
  } else {
    search = search.toLowerCase();
  }
  // filter the banks
  this.filteredcategoryMulti.next(
    this.categoryVal.filter(sup => sup.category.toLowerCase().indexOf(search) > -1 || sup.category.toUpperCase().indexOf(search) > -1)
  );
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
    this.productService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  // helpers for View
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

 //Category Form
 isCategoryControlValid(controlName: string): boolean {
  const control = this.categoryGroup.controls[controlName];
  return control.valid && (control.dirty || control.touched);
}

isCategoryControlInvalid(controlName: string): boolean {
  const control = this.categoryGroup.controls[controlName];
  return control.invalid && (control.dirty || control.touched);
}

isCategorycontrolHasError(validation, controlName): boolean {
  const control = this.categoryGroup.controls[controlName];
  return control.hasError(validation) && (control.dirty || control.touched);
}

isCategoryControlTouched(controlName): boolean {
  const control = this.categoryGroup.controls[controlName];
  return control.dirty || control.touched;
}
}
