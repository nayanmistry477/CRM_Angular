import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';
import { ProductPurchaseService } from 'src/app/modules/auth/_services/product-purchase.service';
import { ServicesService } from 'src/app/modules/auth/_services/services.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import { ProductService } from 'src/app/modules/auth/_services/product.service';


interface Product {
  id: string;
  name: string;
}

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit {


  // @ViewChild('openModal') openModal: TemplateRef<any>;
  @ViewChild('confrimBox') confrimBox: TemplateRef<any>;
  @ViewChild('confrimProductDelete') confrimProductDelete: TemplateRef<any>;
  @ViewChild('openJobModal') openJobModal: TemplateRef<any>;


  isLoading$
  model: any = {}
  isShowTab1: Boolean = false;
  isShowTab2: any = false;
  formGroup: FormGroup;
  JobformGroup: FormGroup;
  filterGroup: FormGroup;
  productGroup: FormGroup;
  searchGroup: FormGroup;
  public searching: boolean = false;
  isShow: Boolean = false;
  isLoading: boolean;

  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;

  flag: boolean = false;
  public productList: any = [];
  public jobObj: any = {};
  private subscriptions: Subscription[] = [];
  public productObj: any = {};
  job: any = {
    id: undefined,
    serviceName: '',
    price: '',
    // quantity:'',
    product: '',
    // productPrice:'',
    productQuantity: ''
  };
  product: any = {
    wooProductID: undefined,
    sellPrice: '',
    costPrice: '',
    productName: '',
    isWOOConnected: false
  };
  isFlag: number = 1;
  public filteredProductMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public productMultiCtrl: FormControl = new FormControl();

  public productMultiFilterCtrl: FormControl = new FormControl();

  protected _onDestroy = new Subject<void>();

  private productVal: any[] = [];
  constructor(private fb: FormBuilder,
    private toastr: ToastrService,
    public productService: ProductService,
    public cdr: ChangeDetectorRef,
    public serviceService: ServicesService,
    public productpurchaseService: ProductPurchaseService,
    private modalService: NgbModal,) {

    const sb = this.serviceService.isLoading$.subscribe(res => this.isLoading = res);
    this.grouping = this.serviceService.grouping;
    this.paginator = this.serviceService.paginator;
    this.sorting = this.serviceService.sorting;
    this.serviceService.fetch();
  }
  ngOnInit(): void {

    this.searchForm()
    this.getAllProducts();
    this.formGroup = this.fb.group({
      id: [''],
      serviceID: [''],
      // quantity: [this.job.quantity, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      product: ['', Validators.compose([Validators.required])],
      // productPrice: [this.job.productPrice, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      productQuantity: [this.job.quantity, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],

    });

    this.JobformGroup = this.fb.group({
      id: [''],
      serviceID: [''],
      serviceName: [this.job.serviceName, Validators.compose([Validators.required])],
      price: [this.job.price, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
    })

    this.productGroup = this.fb.group({
      // wooProductID: [this.product.wooProductID, Validators.compose([Validators.required])],
      productName: [this.product.productName, Validators.compose([Validators.required,])],
      sellPrice: [this.product.sellPrice],
      costPrice: [this.product.costPrice],
      // isWOOConnected: [this.product.isWOOConnected],
    })
  }

  getAllProducts() {

    this.productpurchaseService.getAllProducts()
      .subscribe(
        data => {
          if (data.status == 0) {

            this.productVal = []
          } else {
            var list = [];
            var str = {}
            data.result.forEach(element => {
              str = { product: element.productName, id: element.id, price: element.sellPrice }
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

  checkedEvent(val) {
    console.log(val)
  }

  totalQty: number = 0
  productData: any;
  public list: any = {}
  selectProduct(val) {
    // console.log(val) 
    this.list = {};
    var data = {};

    data = val;
    this.list = data;
    var ans = [];
    // this.productList.push(data)   

    ans = this.productVal.filter(pro => pro.product === val)[0]
    // console.log(ans)
    this.productObj = ans = ans;

    this.getAllPurchaseCount(this.productObj);
    //  this.formGroup.controls['product'].setValue(this.productObj.product)
    //  this.cdr.detectChanges()

  }
  getAllPurchaseCount(job){
    var valData = {
      productID: job.id
    }
    this.productService.getAllPurchaseCount(valData)
    .subscribe(
      data => {
        this.cdr.markForCheck()
        if (data.status == 0) {
          this.toastr.error(data.message)

        } else {
          this.productData = data.result[0].product;
          // console.log( this.productData)
          if (data.result) {
            this.totalQty = data.result[0].totalQty;
            // console.log(this.totalQty)

          } else {
            this.totalQty = 0;
          }
        }
      },
      error => {
        // this.showError(error.statusText);
        console.log(error);
      });

  }

  deleteObj: any = {}
  editProductDelete(val) {
    this.modalService.open(this.confrimProductDelete)
    this.deleteObj = val;
  }

  // deleteProduct() {
  //   this.isDeleting = true;
  //   console.log(this.deleteObj)
  //   const index = this.productList.indexOf(this.deleteObj, 0);
  //   if (index > -1) {
  //     this.productList.splice(index, 1); 
  //   } 
  //   this.serviceService.deleteProductList(this.deleteObj)
  //     .subscribe(
  //       data => {
  //         console.log(data.data.status)
  //         if (data.data.status == 0) {
  //           this.toastr.error(data.data.message)
  //           this.isLoading$ = false;
  //           this.isDeleting = false;
  //         } else {
  //           this.toastr.success(data.data.message)

  //           this.modalService.dismissAll()
  //           this.serviceService.fetch();
  //           this.isDeleting = false;

  //         }
  //       },
  //       error => {
  //         // this.showError(error.statusText);
  //         console.log(error);
  //       });
  // }

  // closeDeleteProduct() {
  //   this.modalService.dismissAll();
  // }

  addProductItem() {
    this.cdr.markForCheck()
    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      return;
    } else {
      var data = {
        id: this.productObj.id,
        product: this.formGroup.value.product,
        quantity: this.formGroup.value.productQuantity,
        price: this.productObj.price
      }
      console.log(data)

     

      if (data.quantity >= this.totalQty) {
        this.toastr.error("Product stock gone its lmit")
        return
      } else {
        var result = this.productList.filter(res => res.product == data.product);
        if (result.length > 0) {
          this.toastr.error('Product is already added');
        } else {
          this.productList.push(data)
          this.productObj = {};
          this.formGroup.reset();
        }
      

      }

    
      // this.formGroup.controls['productQuantity'].reset()
      // if( 
      //     this.list != null && this.list != "" &&
      //     this.formGroup.value.productQuantity != null && this.formGroup.value.productQuantity != ""){

      //     }else{
      //       alert('Please Select Item')
      //     }
    }

  }

  // createProductList(id) {
  //   var list = [];

  //   this.productList.forEach(element => {
  //     var str = { serviceID: id, product: element.product, quantity: element.quantity, price: element.price }
  //     list.push(str);
  //   });

  //   this.productList = list;
  //   var obj = {
  //     products: list
  //   }
  //   console.log(obj)

  //   this.isLoading$ = true;
  //   this.serviceService.createProductList(obj)
  //     .subscribe(
  //       data => {
  //         console.log(data.data.status)
  //         if (data.data.status == 0) {
  //           // this.toastr.error(data.data.message)
  //           this.isLoading$ = false;
  //         } else {
  //           // this.toastr.success(data.data.message) 
  //           this.productList = [];

  //         }
  //       },
  //       error => {
  //         // this.showError(error.statusText);
  //         console.log(error);
  //       });
  // }

  onSubmit() {

    this.JobformGroup.markAllAsTouched();
    if (!this.JobformGroup.valid) { 
      return;
    } else {

    var data = {

      serviceName: this.JobformGroup.value.serviceName,
      price: this.JobformGroup.value.price
    }

    var obj = {
      services: data,
    }
    // console.log(obj)

    // console.log(this.JobformGroup.value)
    // console.log(this.formGroup.value)
    // if (this.productList.length != 0 && this.JobformGroup.value.serviceName != null && this.JobformGroup.value.price != null) {

      //  alert('done')
      this.isLoading$ = true;
      this.serviceService.createService(obj)
        .subscribe(
          data => {
            console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message)
              // this.createProductList(data.data.result1.insertId)
              this.productList = [];
              this.serviceService.fetch();
              this.formGroup.reset();
              this.formGroup.untouched;
              this.isLoading$ = false;
              this.modalService.dismissAll()
              // this.isShow = false;

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    }
    //  else {
    //   this.toastr.error('Please Select Item')
    // }
  }


  editService(data) {

    this.modalService.open(this.openJobModal)
    this.isFlag = 2;
    this.jobObj = data;
    // this.selectedIndex = 0;
    // this.isShow = true;

    this.productObj = data;
    this.isShowTab1 = true;
    this.JobformGroup.controls['id'].setValue(data.id);
    this.JobformGroup.controls['serviceID'].setValue(data.serviceID);
    this.JobformGroup.controls['serviceName'].setValue(data.serviceName);
    this.JobformGroup.controls['price'].setValue(data.price);
    console.log(data)

    if (data.products.length != null) {
      this.productList = data.products
    } else {
      this.productList = null;
    }

  }


  updateService() {

    // if (this.productList.length != null && this.productList != "" &&
    //   this.jobObj.serviceName != null && this.jobObj.price != null &&
    //   this.jobObj.id != null && this.jobObj.id != "") { 

      this.JobformGroup.markAllAsTouched();
      if (!this.JobformGroup.valid) { 
        return;
      } else {

      // console.log(this.productObj)

      var data = {
        id: this.JobformGroup.value.id,
        serviceName: this.JobformGroup.value.serviceName,
        price: this.JobformGroup.value.price
      }
      var serviceid = null
      var list = [];
      var str = {}
      this.productList.forEach(element => {
        if (element.serviceID) {
          str = { serviceID: this.JobformGroup.value.id, product: element.product, quantity: element.quantity, price: element.price }

        } else {
          str = { serviceID: serviceid, product: element.product, quantity: element.quantity, price: element.price }
        }
        list.push(str);
      });

      this.productList = list;

      var obj = {
        services: data,
        // products: list
      }
      // console.log(obj)

      this.isLoading$ = true;
      this.serviceService.updateService(obj)
        .subscribe(
          data => {
            console.log(data.data.status)
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message)
              this.productList = [];
              this.serviceService.fetch();
              this.formGroup.reset();
              this.formGroup.untouched;
              this.isLoading$ = false;
              // this.isShow = false;
              this.modalService.dismissAll()
              this.cdr.markForCheck()

            }
          },
          error => {
            // this.showError(error.statusText);
            console.log(error);
          });
    // }
    //  else {
    //   this.toastr.error('Please Add Product Item')
    }
  }

  editDelete(data) {
    this.modalService.open(this.confrimBox)
    this.jobObj = data;
  }
  isDeleting: boolean = false;
  deleteService() {

    this.isLoading$ = true;
    this.serviceService.deleteService(this.jobObj)
      .subscribe(
        data => {
          if (data.data.status == 0) {
            this.toastr.error(data.data.message)
            this.isLoading$ = false;
            this.cdr.markForCheck();
          } else {
            this.toastr.success(data.data.message)
            this.serviceService.fetch();
            this.modalService.dismissAll();
            this.isLoading$ = false;
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


  editModal() {
    this.modalService.open(this.openJobModal);
    this.isFlag = 1;
    // this.isShow = true;
    // this.isShowTab1 = false;
    this.productList = [];
    this.jobObj = {};
    this.formGroup.reset();
    this.productGroup.reset();
    this.JobformGroup.reset();


    this.selectedIndex = 0;
    this.flag = false;
  }



  // editProductModal() {

  //   this.modalService.open(this.openModal);
  //   this.productGroup.reset();
  // }
  closeModal() {
     this.modalService.dismissAll();
    // this.JobformGroup.reset();
    this.formGroup.reset();
    this.productpurchaseService.fetch()
    this.jobObj = {};
    this.productObj = {};
    this.productGroup.markAsUntouched();
    // this.isShow = false;

  }
  closeProductModal() {
    this.productGroup.reset()
    this.modalService.dismissAll();
    this.productGroup.markAsUntouched();

  }
  selectedIndex = 0;
  nextButton() {

    this.JobformGroup.markAllAsTouched();
    if (!this.JobformGroup.valid) {
      this.selectedIndex = 0;
      this.isShowTab1 = false;
      return;
    } else {
      this.selectedIndex = 1;
      this.isShowTab1 = true;
    }
    // if (this.JobformGroup.value.jobName != null && this.JobformGroup.value.jobName != "",
    //   this.JobformGroup.value.price != null && this.JobformGroup.value.price != ""
    // ) { 
    //   this.selectedIndex = 1;
    //   this.isShowTab1 = true;
    //   // this.moveToSelectedTab('Product List');

    // } else {

    //   this.selectedIndex = 0;
    // }
  }


  // addProduct() {
  //   console.log(this.productGroup.value)

  //   if(this.productGroup.value.isWOOConnected == true){
  //     if(this.productGroup.value.productName != null && this.productGroup.value.productName != "" &&
  //      this.productGroup.value.wooProductID != null && this.productGroup.value.wooProductID != ""){
  //       alert('With WOO ID');

  //        } else{
  //         alert('Without WOO ID'); 
  //       }
  //     }else{
  //       if(this.productGroup.value.productName != null && this.productGroup.value.productName != "" ){
  //         alert('done');
  //       }else{

  //         alert('required');
  //       } 
  //     }
  // }

  addProduct() {

    if (!this.productGroup.valid) {
      return
    } else {

      const productObj = this.productGroup.value;
      productObj.quantity = 0;
      this.isLoading$ = true;
      this.productService.createProduct(productObj)
        .subscribe(
          data => {
            if (data.data.status == 0) {
              this.toastr.error(data.data.message)
              this.isLoading$ = false;
            } else {
              this.toastr.success(data.data.message)
              this.productObj.product = this.productGroup.value.productName;
              this.productObj.id = data.data.result1.insertId;
              this.productGroup.reset();
              this.getAllProducts();
              this.productGroup.untouched;
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

  moveToSelectedTab(tabName: any) {
    console.log(tabName)
    if (tabName.index == 1) {
      this.flag = true;
    }

    // for (let i =0; i< document.querySelectorAll('.mat-tab-label-content').length; i++) {
    // if ((<HTMLElement>document.querySelectorAll('.mat-tab-label-content')[i]).innerText == tabName) 
    //    {
    //       (<HTMLElement>document.querySelectorAll('.mat-tab-label')[i]).click();
    //    }
    //  }
  }
  isWooIdSelected: Boolean = false;
  selectWOO(val) {
    if (val == true) {
      this.isWooIdSelected = true;

    } else {
      this.isWooIdSelected = false;
      this.productGroup.controls['wooProductID'].reset()
    }
    // console.log(val)
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
    this.serviceService.patchState({ searchTerm:searchTerm.toLocaleLowerCase() });
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
    this.serviceService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.serviceService.patchState({ paginator });
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

  //Job Form

  isJobControlValid(controlName: string): boolean {
    const control = this.JobformGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isJobControlInvalid(controlName: string): boolean {
    const control = this.JobformGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  JobcontrolHasError(validation, controlName): boolean {
    const control = this.JobformGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isJobControlTouched(controlName): boolean {
    const control = this.JobformGroup.controls[controlName];
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

}
