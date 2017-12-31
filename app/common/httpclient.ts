﻿
import {Injectable} from '@angular/core';
import {Http, Headers, Response, Request, RequestOptions, RequestOptionsArgs, RequestMethod} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {NotificationService} from '../notification/notification.service';
import {ApiConnection} from '../connect/api-connection'
import {ApiError, ApiErrorType} from '../error/api-error';
import {ConnectService} from '../connect/connect.service';



@Injectable()
export class HttpClient {
    private _headers: Headers= new Headers();
    private _conn: ApiConnection;

    constructor(private _http: Http,
                private _notificationService: NotificationService,
                private _connectSvc: ConnectService)
    {
        //
        // Support withCredentials
        //
        // TODO: Use official Angular2 CORS support when merged (https://github.com/angular/angular/issues/4231).
        let _build = (<any>_http)._backend._browserXHR.build;
        (<any>_http)._backend._browserXHR.build = () => {
            let _xhr = _build();

            _xhr.withCredentials = true;

            return _xhr;
        };

        this._connectSvc.active.subscribe(c => this._conn = c);
    }

    private get headers(): Headers {
        let headers = new Headers();

        for (var key of this._headers.keys()) {
            headers.append(key, this._headers.get(key));
        }
        return headers
    }

    public setHeader(key: string, value: string) {
        this._headers.set(key, value);
    }

    public get(url: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Get, url, options);

        return this.request(url, ops, warn)
            .then(res => res.status !== 204 ? res.json() : null);
    }

    public head(url: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Head, url, options);

        return this.request(url, ops, warn);
    }

    public post(url: string, body: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        options = this.setJsonContentType(options);
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Post, url, options, body);

        return this.request(url, ops, warn)
            .then(res => res.status !== 204 ? res.json() : null);
    }

    public patch(url: string, body: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        options = this.setJsonContentType(options);
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Patch, url, options, body);

        return this.request(url, ops, warn)
            .then(res => res.status !== 204 ? res.json() : null);
    }

    public delete(url: string, options?: RequestOptionsArgs, warn: boolean = true): Promise<any> {
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Delete, url, options);
        return this.request(url, ops, warn);
    }

    public options(url: string): Promise<any> {
        let ops: RequestOptionsArgs = this.getOptions(RequestMethod.Options, url, null);
        return this.request(url, ops);
    }

    public endpoint(): ApiConnection {
        return this._conn;
    }

    private setJsonContentType(options?: RequestOptionsArgs) {
        if (!options) {
            options = {};
        }

        if (!options.headers) {
            options.headers = new Headers();
        }

        options.headers.set("Content-Type", "application/json");

        return options;
    }


    public request(url: string, options?: RequestOptionsArgs, warn?: boolean): Promise<any> {
        if (!this._conn) {
            this._connectSvc.gotoConnect(true);
            return Promise.reject("Not connected");
        }

        let req: Request;

        let reqOpt = new RequestOptions(options);

        if (url.toString().indexOf("/") != 0) {
            url = '/' + url;
        }

        reqOpt.url = this._conn.url + '/api' + url;
        req = new Request(reqOpt);
        
        //
        // Set Access-Token
        req.headers.set('Access-Token', 'Bearer ' + this._conn.accessToken);
        
        return this._http.request(req).toPromise()
            .catch(e => {
                // Status code 0 possible causes:
                // Untrusted certificate
                // Windows auth, prevents CORS headers from being accessed
                // Service not responding
                if (e.status == 0) {
                    //
                    // The first request to the API fails because windows auth has not started yet.
                    // We repeat the request because in this case the next request will succeed.
                    return this._http.request(req).toPromise()
                        .catch(err => {
                            //
                            // Check to see if connected
                            return this._http.options(this._conn.url).toPromise()
                                .catch(e => {
                                    this._connectSvc.reconnect();
                                    return Promise.reject("Not connected");
                                })
                                .then(r => {
                                    return this.handleHttpError(err);
                                });
                        });
                }
                return this.handleHttpError(e, warn);
            });
    }

    private handleHttpError(err, warn?: boolean): Promise<any> {
        if (err.status == 403 && err.headers.get("WWW-Authenticate") === "Bearer") {
            this._connectSvc.reconnect();
            return Promise.reject("Not connected");
        }

        let apiError = this.apiErrorFromHttp(err);

        if (apiError && warn) {
            this._notificationService.apiError(apiError);
        }

        throw apiError;
    }

    public getOptions(method: RequestMethod, url: string, options: RequestOptionsArgs, body?: string): RequestOptionsArgs {
        let aBody = body ? body : options && options.body ? options.body : undefined

        let opts: RequestOptionsArgs = {
            method: method,
            url: url,
            headers: options && options.headers ? options.headers : this.headers,
            search: options && options.search ? options.search : undefined,
            body: aBody
        };        
        opts.headers.set("Accept", "application/hal+json");

        return opts;
    }

    private apiErrorFromHttp(httpError): ApiError {
        let msg = "";
        let apiError: ApiError = null;
        if ((httpError)._body) {
            try {
                apiError = JSON.parse(httpError._body);
            }
            catch (parseError) {
            }
        }
        if (apiError == null) {
            apiError = new ApiError();
            apiError.status = httpError.status;
        }
        if (httpError.status === 400) {
            if (apiError && apiError.title == "Invalid parameter") {
                var parameterName = this.parseParameterName(apiError.name);
                msg = "一个无效的值 " + parameterName + ".";
                if (apiError.detail) {
                    msg += "\n" + apiError.detail;
                }
            }
        }
        if (httpError.status == 403) {
            // TODO: Invalid token
            if (apiError && apiError.title == "Object is locked") {
                apiError.type = ApiErrorType.SectionLocked;
                msg = "无法加载功能的设置。当功能锁定在当前配置级别并修改了功能的设置时，就会发生这种情况。要解决此问题，请手动删除对该特性的任何本地更改或在父级打开该功能.";
            }

            if (apiError && apiError.title == "Forbidden" && apiError.name) {
                if (apiError[apiError.name]) {
                    msg = "禁止: '" + apiError[apiError.name] + "'";
                }
                else {
                    msg = "禁止: '" + apiError.name + "'";
                }

                if (apiError.detail) {
                    msg += "\n" + apiError.detail;
                }
            }
        }
        if (httpError.status == 404) {
            if (apiError && apiError.detail === "IIS feature not installed") {
                apiError.type = ApiErrorType.FeatureNotInstalled;
                msg = apiError.detail + "\n" + apiError.name;
            }
            else {
                msg = "没有找到IIS资源";
                apiError.type = ApiErrorType.NotFound;
            }
        }
        if (httpError.status == 500) {
            // TODO: Invalid token
            if (apiError.detail == "Dism Error") {
                msg = "发生了一个错误 " + apiError.feature;
                if (apiError.exit_code == 'B7') {
                    msg += "\n指定的对象正在被使用"
                }
                msg += "\n错误代码: " + apiError.exit_code;
            }

            else {
                msg = apiError.detail || "";
            }
        }
        apiError.message = msg;
        return apiError;
    }

    private parseParameterName(pName: string) {
        if (!pName) {
            return "";
        }
        while (pName.indexOf(".") != -1) {
            pName = pName.substr(pName.indexOf(".") + 1);
        }
        var parts = pName.split('_');
        for (var i = 0; i < parts.length; i++) {
            parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
        }
        return parts.join(" ");
    }
}
