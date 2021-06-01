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
 const API_USERS_URL = `${environment.apiUrl}/invoice`;

@Injectable({
  providedIn: 'root',
}) 

export class InvoiceService extends TableService<any> implements OnDestroy {
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
    return this.http.get<any[]>(`${API_USERS_URL}/getAllinvoices`,{headers: httpHeaders,}).pipe(
      map((response:any) => { 
        
        var res = []
        if(response.result == undefined){
            res = []
        }else{
            res = response.result
        }
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
    createInvoice(data) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createInvoice`,data, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }
  
  
  updateInvoice(data) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateInvoice`,data, {
        headers: httpHeaders,
      });
 
  }

  deleteInvoice(category) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/deleteInvoice`,category, {
        headers: httpHeaders,
      }); 
 
  } 
  updateProduct_ServiceFinalInvoice(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateProduct_ServiceFinalInvoice`,service, {
        headers: httpHeaders,
      }); 
 
  }
  getProducts_ServiceByinvoiceID(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/getProducts_ServiceByinvoiceID`,service, {
        headers: httpHeaders,
      }); 
 
  } 
  getInvoiceByjobID(id) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/getInvoiceByjobID`,id, {
        headers: httpHeaders,
      });  
  } 
  getInvoiceByID(id) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/getInvoiceByID`,id, {
        headers: httpHeaders,
      });  
  } 
  getAllinvoices() {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.get<any>(`${API_USERS_URL}/getAllinvoices`, {
        headers: httpHeaders,
      });  
  } 
  

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}