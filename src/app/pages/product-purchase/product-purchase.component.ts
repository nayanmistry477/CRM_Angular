import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CategoryService } from 'src/app/modules/auth/_services/category.service';
import { ProductPurchaseService } from 'src/app/modules/auth/_services/product-purchase.service';
import { ProductService } from 'src/app/modules/auth/_services/product.service';
import { SupplierService } from 'src/app/modules/auth/_services/supplier.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';

interface Product {
  id: string;
  name: string;
}

 
@Component({
  selector: 'app-product-purchase',
  templateUrl: './product-purchase.component.html',
  styleUrls: ['./product-purchase.component.scss']
})

export class ProductPurchaseComponent implements OnInit {

  @ViewChild('openModal') openModal : TemplateRef<any>;
  @ViewChild('supplieropenModal') supplieropenModal : TemplateRef<any>;
  @ViewChild('categoryopenModal')categoryopenModal:TemplateRef<any>; 
  @ViewChild('confrimBox')confrimBox:TemplateRef<any>;

  model:any={};
  isLoading$;
  purchaseGroup: FormGroup;
  filterGroup: FormGroup;
  searchGroup: FormGroup;
  productGroup:FormGroup;
  supplierGroup:FormGroup;
  categoryGroup:FormGroup;
  customer:any={}
  selectProductObj:any={}
  isShow: Boolean = false;
  public searching: boolean = false;
  minDate = new Date();

   product: any = {
    id: undefined,
    quantity: '',
    supplier: '', 
    isStock:false,
    wooProductID: undefined,
    sellPrice: '',
    costPrice: '',
    productName: '',
    isWOOConnected: false
  };
  isLoading: boolean;

  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;

  supplier:any = {
    supplierName:''
  }
 categoryObj:any = {
  categoryName:''
 }
 isFlag:number = 1
 porductPurchaseObj:any={}

  private productVal: any[] =  [];

  private supplierVal: any[] = [];

  private categoryVal: any[] = [];
  private subscriptions: Subscription[] = [];
  isDeleting:boolean = false;

  constructor(private fb: FormBuilder,private toastr: ToastrService, 
    private modalService: NgbModal,
    public productService: ProductService,
    private elementRef: ElementRef,
    public cdr:ChangeDetectorRef,
    public categoryService: CategoryService,
    public supplierService: SupplierService,public productpurchaseService: ProductPurchaseService) {


    this.modalService.dismissAll();
    const sb = this.productpurchaseService.isLoading$.subscribe(res => this.isLoading = res); 
    this.grouping = this.productpurchaseService.grouping;
    this.paginator = this.productpurchaseService.paginator;
    this.sorting = this.productpurchaseService.sorting;
    this.productpurchaseService.fetch(); 
   } 

    public filteredProductMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1); 
    public filteredSupplierMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1); 
    public filteredcategoryMulti:ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    public productMultiCtrl: FormControl = new FormControl();
    public categoryMultiFilterCtrl: FormControl =new FormControl();

    protected _onDestroy = new Subject<void>(); 
    public productMultiFilterCtrl: FormControl = new FormControl();
    public supplierMultiFilterCtrl: FormControl = new FormControl();


  ngOnInit(): void {
    var script = document.createElement('script');
    script.src = './assets/js/components/datepicker.js';
    script.type = 'text/javascript'; 
    this.elementRef.nativeElement.appendChild(script);
    this.getAllProducts();
    this.getAllSuppliers()
    this.searchForm();
  //  this.getAllCategories();

    this.purchaseGroup = this.fb.group({
      id:[''],
      productID:[''],
      product: [this.product.product, Validators.compose([Validators.required])],
      quantity: [this.product.quantity, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      supplier: [this.product.supplier,Validators.compose([Validators.required])],
      // isStock: [this.product.isStock, Validators.compose([Validators.required])],

      purchaseDate: ['', Validators.compose([Validators.required])],
     
    });

    this.productGroup = this.fb.group({
      // wooProductID: [this.product.wooProductID, Validators.compose([Validators.required])],
      productName: [this.product.productName, Validators.compose([Validators.required,])],
      sellPrice: [this.product.sellPrice ,Validators.compose([Validators.required])],
      costPrice: [this.product.costPrice ,Validators.compose([Validators.required])],
      // isWOOConnected: [this.product.isWOOConnected,Validators.compose([Validators.required])],
    });

    this.supplierGroup = this.fb.group({ 
      supplierName:[this.supplier.supplierName,Validators.compose([Validators.required])]
    });

    this.categoryGroup = this.fb.group({ 
      categoryName:[this.categoryObj.categoryName,Validators.compose([Validators.required])]
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
    this.productpurchaseService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
  editCategoryModal(){
    this.modalService.open(this.categoryopenModal)
    this.categoryGroup.reset()
    this.categoryGroup.untouched
  }
  closeCategoryModal(){
    this.modalService.dismissAll()
    this.categoryGroup.reset()
    this.categoryGroup.untouched
  }
  editModal(){

    this.isShow = true;
    this.isFlag = 1;
    this.purchaseGroup.reset();
    this.porductPurchaseObj = {}; 
    //  this.modalService.open(this.openModal);
     this.purchaseGroup.markAsUntouched(); 
  
  }
  closeSupplierModal() {
    this.supplierGroup.reset()
    this.modalService.dismissAll();
    this.supplierGroup.markAsUntouched();

  }
  closeProductModal() {
    this.productGroup.reset()
    this.modalService.dismissAll();
    this.productGroup.markAsUntouched();

  }
  closeModal(){
     this.isShow = false; 
    // this.formGroup.reset(); 
    // this.productpurchaseService.fetch()
    // this.modalService.dismissAll();
    // this.formGroup.markAsUntouched()

  }
  selectCategory(val){
    console.log(val)
  }

  addCategory(){

  }
  public list: any = {}
  selectProduct(val) {
    console.log(val)
    this.list = {}
    var data = {}

    data = val
    this.list = data
    var ans;
    ans = this.productVal.filter(pro => pro.product === val)[0]
    console.log(ans)
    this.porductPurchaseObj = ans;
    // this.productList.push(data)   
  }
  selectSupplier(val) {
    console.log(val)
    this.list = {};
    var data = {};

    data = val
    this.list = data
    // this.productList.push(data)   
  }
  editProductModal() {

    this.modalService.open(this.openModal);
    this.productGroup.reset();
  }

  editSupplierModal(){
    this.supplierGroup.reset(); 
    this.modalService.open(this.supplieropenModal); 
    this.supplierGroup.markAsUntouched()
  }

  addSupplier(){ 

    this.supplierGroup.markAllAsTouched();
    if (!this.supplierGroup.valid) {
      return;
    }else{
   
    const supplierObj = this.supplierGroup.value;  
    this.isLoading$ = true;   
    this.supplierService.createSupplier(supplierObj)
      .subscribe(
        data => {
          console.log(data.data.status)
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isLoading$  = false;
          } else {
            this.toastr.success(data.data.message)
            this.porductPurchaseObj.supplier = this.supplierGroup.value.supplierName;
             this.supplierGroup.reset();
           this.getAllSuppliers();
            this.supplierGroup.untouched;  
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
  getAllSuppliers(){
    this.productpurchaseService.getAllSuppliers()
    .subscribe(
      data => { 
        if (data.status == 0) { 

          this.supplierVal = []
         } else {   
          var str={}
          var list = []
          data.result.forEach(element => {
            str={supplier:element.supplierName}

            list.push(str)
          });
          this.supplierVal = list;
          this.filteredSupplierMulti.next(this.supplierVal.slice());

          this.supplierMultiFilterCtrl.valueChanges
          .pipe(
            takeUntil(this._onDestroy))
          .subscribe(() => {
            this.searching = false;
            this.filterSupplier()
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
     
    getAllProducts() { 

    this.productpurchaseService.getAllProducts()
      .subscribe(
        data => { 
          if (data.status == 0) { 

            this.productVal = []
           } else {  
            var list= [];
            var str={}
            data.result.forEach(element => {
              str={product:element.productName,id:element.id }

              list.push(str)
              
            }); 
          
            this.productVal = list; 
            this.filteredProductMulti.next(this.productVal.slice()); 
           

            this.productMultiFilterCtrl.valueChanges
            .pipe(
              takeUntil(this._onDestroy))
            .subscribe(() => {
              this.searching = false;
              this.filterProduct()
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
 

  isStocks:Boolean = false;
  openStock(val){ 
    if(val == true){
      this.isStocks == true
    }else{
      this.isStocks == false

    }
  }
  onSubmit(){ 

    this.purchaseGroup.markAllAsTouched();
    if (!this.purchaseGroup.valid) {
      return;
    }else{
    var Obj = this.purchaseGroup.value;
    // if(Obj.isStock == null){
    //   Obj.isStock = "false"
    // } else{
    //   Obj.isStock =  JSON.stringify(this.porductPurchaseObj.isStock);

    // }
    this.isLoading$ = true;
    Obj.productID =  this.porductPurchaseObj.id
    this.productpurchaseService.createProductPurchase(Obj)
    .subscribe(
      data => {
        console.log(data.data.status)
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isLoading$  = false;
        } else {
          this.toastr.success(data.data.message)
          this.productpurchaseService.fetch();
          this.purchaseGroup.reset();
          this.purchaseGroup.untouched;  
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
  purchaseObj:any={}
  editProductPurchase(data){
    this.isShow = true;
    this.isFlag = 2;
    this.porductPurchaseObj = data;    
    this.purchaseGroup.controls['id'].setValue(data.id);
    this.purchaseGroup.controls['product'].setValue(data.product);  
    this.purchaseGroup.controls['quantity'].setValue(data.quantity); 
    this.purchaseGroup.controls['supplier'].setValue(data.supplier);  
    this.purchaseGroup.controls['purchaseDate'].setValue(data.purchaseDate);  
    // console.log(data)
     // if(data.isStock == "true"){
    //   this.porductPurchaseObj.isStock = true;

    // }else{
    //   this.porductPurchaseObj.isStock = false;
    // }
    this.cdr.detectChanges()
    
  }
  updateProductPurchase(){

    // this.purchaseGroup.markAllAsTouched();
    // if (this.purchaseGroup.valid) {
    //   return;
    // }else{
    this.isLoading$ = true;
    this.purchaseGroup.value;
    var Obj = this.purchaseGroup.value
    Obj.productId =  this.porductPurchaseObj.id

    // this.porductPurchaseObj.isStock =  JSON.stringify(this.porductPurchaseObj.isStock);
    this.productpurchaseService.updateProductPurchase(Obj)
    .subscribe(
      data => { 
        if (data.data.status == 0) { 
          this.toastr.error(data.data.message)
          this.isLoading$  = false;
        } else {
          this.toastr.success(data.data.message)
          this.productpurchaseService.fetch();
          this.purchaseGroup.reset();
          this.purchaseGroup.untouched;  
          this.isLoading$  = false;
          this.isShow = false;

        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });
    // }
  }

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
  isProduct:boolean = false;
  addProduct(){

    this.productGroup.markAllAsTouched();
    if (!this.productGroup.valid) {
      return;
    }else{
    
   const productObj = this.productGroup.value;  
   productObj.quantity = 0;
   productObj.isWOOConnected = "false";
   this.isProduct = true;   
   this.productService.createProduct(productObj)
     .subscribe(
       data => {
          if (data.data.status == 0) { 
           this.toastr.error(data.data.message)
           this.isProduct = false;
         } else {
           this.toastr.success(data.data.message) 
       
           this.porductPurchaseObj.product = this.productGroup.value.productName;
           this.porductPurchaseObj.id = data.data.result1.insertId;

           this.productGroup.reset();
           this.getAllProducts();

           this.productGroup.untouched;  
           this.modalService.dismissAll();
           this.isProduct  = false;  
         
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
    this.porductPurchaseObj = data;
  }
  deleteProductPurchase(){
    this.isLoading$ = true;   
    // this.isDeleting = true;
    this.productpurchaseService.deleteProductPurchase( this.porductPurchaseObj)
      .subscribe(
        data => { 
          
          if (data.data.status == 0) { 
            this.toastr.error(data.data.message)
            this.isLoading$  = false; 
            this.cdr.markForCheck(); 
          } else {
            this.toastr.success(data.data.message)  
            this.productpurchaseService.fetch();   
            this.modalService.dismissAll();
            this.isLoading$  = false; 
            this.cdr.markForCheck(); 
          
            // this.isDeleting = false;
          }
        },
        error => {
          // this.showError(error.statusText);
          console.log(error);
        });
  }
  closeDelete(){
    this.modalService.dismissAll()
  }
  isWooIdSelected: Boolean = false;
  selectWOO(val) {
    if (val == true) {
      this.isWooIdSelected = true;

    } else {
      this.isWooIdSelected = false;
      this.productGroup.controls['wooProductID'].reset()
    } 
  }
 
  filterProduct() {
    if (!this.productVal) {
      return;
    }
    // get the search keyword
    let search = this.productMultiFilterCtrl.value;
    if (!search) {
      this.filteredProductMulti.next(this.productVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredProductMulti.next(
      this.productVal.filter(pro => pro.product.toLowerCase().indexOf(search) > -1 || pro.product.toUpperCase().indexOf(search) > -1)
    );
  }

  filterSupplier(){
    if (!this.supplierVal) {
      return;
    }
    // get the search keyword
    let search = this.supplierMultiFilterCtrl.value;
    if (!search) {
      this.filteredSupplierMulti.next(this.supplierVal.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredSupplierMulti.next(
      this.supplierVal.filter(sup => sup.supplier.toLowerCase().indexOf(search) > -1 || sup.supplier.toUpperCase().indexOf(search) > -1)
    );
  }

  filterCategory() {
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
      this.categoryVal.filter(pro => pro.category.toLowerCase().indexOf(search) > -1 || pro.category.toUpperCase().indexOf(search) > -1)
    );
  }
   // helpers for View
   isControlValid(controlName: string): boolean {
    const control = this.purchaseGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.purchaseGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.purchaseGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.purchaseGroup.controls[controlName];
    return control.dirty || control.touched;
  }

 // Product Form 

 isProductControlValid(controlName: string): boolean {
  const control = this.productGroup.controls[controlName];
  return control.valid && (control.dirty || control.touched);
}

isProductControlInvalid(controlName: string): boolean {
  const control = this.productGroup.controls[controlName];
  return control.invalid && (control.dirty || control.touched);
}

ProductcontrolHasError(validation, controlName): boolean {
  const control = this.productGroup.controls[controlName];
  return control.hasError(validation) && (control.dirty || control.touched);
}

isProductControlTouched(controlName): boolean {
  const control = this.productGroup.controls[controlName];
  return control.dirty || control.touched;
}

 // Supplier Form 

 isSupplierControlValid(controlName: string): boolean {
  const control = this.supplierGroup.controls[controlName];
  return control.valid && (control.dirty || control.touched);
}

isSupplierControlInvalid(controlName: string): boolean {
  const control = this.supplierGroup.controls[controlName];
  return control.invalid && (control.dirty || control.touched);
}

SuppliercontrolHasError(validation, controlName): boolean {
  const control = this.supplierGroup.controls[controlName];
  return control.hasError(validation) && (control.dirty || control.touched);
}

isSupplierControlTouched(controlName): boolean {
  const control = this.supplierGroup.controls[controlName];
  return control.dirty || control.touched;
}


//category form

 

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
