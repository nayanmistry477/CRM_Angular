import { Inject, Injectable, OnDestroy } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { UserModel } from '../../_models/user.model';
import { environment } from '../../../../environments/environment';
import { AuthModel } from '../_models/auth.model';
import { UserModel } from '../_models/user.model';
import { ITableState, TableResponseModel, TableService } from 'src/app/_metronic/shared/crud-table';
import { baseFilter } from 'src/app/_fake/fake-helpers/http-extenstions';
import { map } from 'rxjs/operators';
 const API_USERS_URL = `${environment.apiUrl}/productPurchase`;

@Injectable({
  providedIn: 'root',
}) 

export class ProductPurchaseService extends TableService<any> implements OnDestroy {
  token:any={}
   constructor(@Inject(HttpClient) http) {
    super(http);

    var token = JSON.parse(localStorage.getItem('token'))
    if(token != null){
  
      this.token = token.accessToken
    }else{
      this.token = null
    }
  }

  // READ
  find(tableState: ITableState): Observable<TableResponseModel<any>> {

    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.get<any[]>(`${API_USERS_URL}/getAllProductPurchase`,{headers: httpHeaders,}).pipe(
      map((response:any) => { 
        var res = response.result
        const filteredResult = baseFilter(res, tableState);
        const result: TableResponseModel<any> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
    
  }

    // CREATE =>  POST: add a new user to the server
  createProductPurchase(product) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createProductPurchase`,product, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }
  updateProductPurchase(product) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateProductPurchase`,product, {
        headers: httpHeaders,
      });
 
  }

  deleteProductPurchase(product) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/deleteProductPurchase`,product, {
        headers: httpHeaders,
      }); 
 
  } 

  getAllProducts() {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.get<any>(`${environment.apiUrl}/product/getAllProducts`, {
        headers: httpHeaders,
      }); 
 
  } 

  getAllSuppliers() {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.get<any>(`${environment.apiUrl}/supplier/getAllSuppliers`, {
        headers: httpHeaders,
      }); 
 
  } 
 

  
  getProductNotification(){
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.get<any>(`${API_USERS_URL}/getAllMinimumStocks`, {
      headers: httpHeaders,
    }); 
  }
  getChart(){
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.get<any>(`${API_USERS_URL}/getAllChartCounts`, {
      headers: httpHeaders,
    }); 
  }
  

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}