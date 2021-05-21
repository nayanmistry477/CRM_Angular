import { Inject, Injectable, OnDestroy } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { UserModel } from '../../_models/user.model';
import { environment } from '../../../../environments/environment';
// import { environment } from '../../../../environments/environment.prod';

import { AuthModel } from '../_models/auth.model';
import { UserModel } from '../_models/user.model';
import { ITableState, TableResponseModel, TableService } from 'src/app/_metronic/shared/crud-table';
import { baseFilter } from 'src/app/_fake/fake-helpers/http-extenstions';
import { map } from 'rxjs/operators';
 const API_USERS_URL = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
}) 

export class EmployeeService extends TableService<any> implements OnDestroy {
  token:any={}
  user:any={}
   constructor(@Inject(HttpClient) http) {
    super(http);

    var token = JSON.parse(localStorage.getItem('token'))
    if(token != null){
  
      this.user = JSON.parse(localStorage.getItem('user'))
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
    return this.http.get<any[]>(`${API_USERS_URL}/getAllUsers`,{headers: httpHeaders,}).pipe(
      map((response:any) => { 
       var data = response.result;
        for(var i=0;i<data.length;i++){
          var res = data
          var list = []
          if(this.user.user.id != res[i].id){

            var datas = {
              contactNo: res[i].contactNo,
              createdDate: res[i].createdDate,
              email: res[i].email,
              firstname: res[i].firstname,
              id: res[i].id,
              isActive: res[i].isActive,
              jobTitle: res[i].jobTitle,
              lastname: res[i].lastname,
              modifiedDate: res[i].modifiedDate,
              password: res[i].password,
              userRole: res[i].userRole
            }
            list.push(datas)
 
             const filteredResult = baseFilter(data, tableState); 
            const result: TableResponseModel<any> = {
              items: filteredResult.items,
              total: filteredResult.total
            };
            return result;
          }
        }
      
      })
    );
    
  }

    // CREATE =>  POST: add a new user to the server
    createUser(user) {
    // const httpHeaders = new HttpHeaders({
    //     Authorization: `Bearer ${this.token}`
    //   });
      return this.http.post<any>(`${API_USERS_URL}/createUser`,user);

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }
  updateUser(user) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateUser`,user, {
        headers: httpHeaders,
      });
 
  }
  updateCompanySettings(data){
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/updateCompanySettings`,data, {
      headers: httpHeaders,
    });
  }
  deleteUser(user) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/deleteUser`,user, {
        headers: httpHeaders,
      }); 
 
  } 

  getAllUsers() {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.get<any>(`${API_USERS_URL}/getAllUsers`, {
        headers: httpHeaders,
      }); 
 
  } 

  getCompanyDetails(){
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.get<any>(`${API_USERS_URL}/getCompanyDetails`, {
      headers: httpHeaders,
    }); 
  }

  
  forgotPassword(email: string) {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post<any>(`${API_USERS_URL}/forgotpassword`,email, {
      headers: httpHeaders,
    });
  }

  changePassword(user) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/changePassword`,user, {
        headers: httpHeaders,
      });
 
  }

  recoveryPassword(user) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/recoveryPassword`,user, {
        headers: httpHeaders,
      });
 
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}