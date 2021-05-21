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
 const API_USERS_URL = `${environment.apiUrl}/payment`;

@Injectable({
  providedIn: 'root',
}) 

export class PaymentService extends TableService<any> implements OnDestroy {
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
   
    // CREATE =>  POST: add a new user to the server
  
  createPayment(data) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createPayment`,data, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }
  updatePayment(data) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updatePayment`,data, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }
   
  
  deletePayment(category) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/deletePayment`,category, {
        headers: httpHeaders,
      }); 
 
  } 
   
  
   
  getPaymentById(id) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/getPaymentById`,id, {
        headers: httpHeaders,
      }); 
 
  } 

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}