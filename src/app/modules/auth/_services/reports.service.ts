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
 const API_USERS_URL = `${environment.apiUrl}/reports`;

@Injectable({
  providedIn: 'root',
}) 

export class ReportService extends TableService<any> implements OnDestroy {
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
 
 
getJobsByTechnicians(service) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/getJobsByTechnicians`,service, {
      headers: httpHeaders,
    });

}
getCustomerByDate(service) {
  const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/getCustomerByDate`,service, {
      headers: httpHeaders,
    });

}
getPartsByDate(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/getPartsByDate`,service, {
        headers: httpHeaders,
      });
  
  }
  getInvoiceByDate(service) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/getInvoiceByDate`,service, {
        headers: httpHeaders,
      });
  
  }
getAllStocksByDate(data) {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/getAllStocksByDate`,data, {
      headers: httpHeaders,
    }); 
 
  } 

  getJobStatusByDate(data) {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/getJobStatusByDate`,data, {
      headers: httpHeaders,
    }); 
 
  } 
  uploadDocument(data) {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/uploadDocument`,data, {
      headers: httpHeaders,
    }); 
 
  } 

  getDashboardCount(data){
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    }); 
    return this.http.post<any>(`${API_USERS_URL}/getAllDashboardCounts`, data,{
      headers: httpHeaders,
    }); 
  }
  getDashboardCountPre(data){
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    }); 
    return this.http.post<any>(`${API_USERS_URL}/getAllDashboardPreviousCounts`, data,{
      headers: httpHeaders,
    }); 
  }
 
 
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}