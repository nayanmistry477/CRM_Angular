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
 const API_USERS_URL = `${environment.apiUrl}/userRoles`;

@Injectable({
  providedIn: 'root',
}) 

export class UserRolesService extends TableService<any> implements OnDestroy {
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
    return this.http.get<any[]>(`${API_USERS_URL}/getAllUserRoles`,{headers: httpHeaders,}).pipe(
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
    createUserRole(roles) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/createUserRole`,roles, {
        headers: httpHeaders,
      });

    // return this.http.post(`${API_USERS_URL}/createCustomer`, user);
  }
  updateUserRole(roles) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/updateUserRole`,roles, {
        headers: httpHeaders,
      });
 
  }

  deleteUserRole(roles) {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.post<any>(`${API_USERS_URL}/deleteUserRole`,roles, {
        headers: httpHeaders,
      }); 
 
  } 
  getAllUserRoles() {
    const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      return this.http.get<any>(`${API_USERS_URL}/getAllUserRoles`, {
        headers: httpHeaders,
      }); 
 
  } 
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}