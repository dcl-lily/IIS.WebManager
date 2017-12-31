var SETTINGS = {
    "version": "2.2.1",
    "api_version": "2.2.0",
    "api_setup_version": "2.2.0",
    "api_download_url": "http://go.microsoft.com/fwlink/?LinkId=829373",
    "ga_track": "UA-XXXXXXXX-X",
}

var GLOBAL_MODULES = [
    {
        "name": "站点",
        "ico": "fa fa-globe",
        "component_name": "WebSiteListComponent",
        "module": "app/webserver/websites/websites.module#WebSitesModule",
        "api_name": "websites",
        "api_path": "/api/webserver/websites?application_pool.id={appPoolId}"
    },
    {
        "name": "应用池",
        "ico": "fa fa-cogs",
        "component_name": "AppPoolListComponent",
        "module": "app/webserver/app-pools/app-pools.module#AppPoolsModule",
        "api_name": "app_pools",
        "api_path": "/api/webserver/application-pools"
    },
    {
        "name": "文件",
        "ico": "fa fa-files-o",
        "component_name": "WebFilesComponent",
        "module": "app/webserver/files/webfiles.module#WebFilesModule",
        "api_name": "files",
        "api_path": "/api/webserver/files/{id}"
    },
    {
        "name": "应用程序",
        "ico": "fa fa-code",
        "component_name": "WebAppListComponent",
        "module": "app/webserver/webapps/webapps.module#WebAppsModule",
        "api_name": "webapps",
        "api_path": "/api/webserver/webapps?website.id={websiteid}&application_pool.id={apppoolid}"
    },
    {
        "name": "虚拟目录",
        "ico": "fa fa-folder-o",
        "component_name": "VdirListComponent",
        "module": "app/webserver/vdirs/vdirs.module#VdirsModule",
        "api_name": "vdirs",
        "api_path": "/api/webserver/virtual-directories?website.id={siteId}&webapp.id={appId}"
    },
    {
        "name": "认证",
        "ico": "fa fa-sign-in",
        "component_name": "AuthenticationComponent",
        "module": "app/webserver/authentication/authentication.module#AuthenticationModule",
        "api_name": "authentication",
        "api_path": "/api/webserver/authentication/{id}"
    },
    {
        "name": "授权",
        "ico": "fa fa-user-o",
        "component_name": "AuthorizationComponent",
        "module": "app/webserver/authorization/authorization.module#AuthorizationModule",
        "api_name": "authorization",
        "api_path": "/api/webserver/authorization/{id}"
    },
    {
        "name": "证书",
        "ico": "fa fa-lock",
        "component_name": "CertificatesComponent",
        "module": "app/certificates/certificates.module#CertificatesModule",
        "api_name": "certificates",
        "api_path": "/api/certificates"
    },
    {
        "name": "证书存储",
        "ico": "fa fa-certificate",
        "component_name": "CentralCertificateComponent",
        "module": "app/webserver/central-certificates/central-certificate.module#CentralCertificateModule",
        "api_name": "central_certificates",
        "api_path": "/api/webserver/centralized-certificates/{id}"
    },
    {
        "name": "默认首页",
        "ico": "fa fa-file-text-o",
        "component_name": "DefaultDocumentsComponent",
        "module": "app/webserver/default-documents/default-documents.module#DefaultDocumentsModule",
        "api_name": "default_document",
        "api_path": "/api/webserver/default-documents/{id}"
    },
    {
        "name": "目录浏览",
        "ico": "fa fa-folder-open-o",
        "component_name": "DirectoryBrowsingComponent",
        "module": "app/webserver/directory-browsing/directory-browsing.module#DirectoryBrowsingModule",
        "api_name": "directory_browsing",
        "api_path": "/api/webserver/directory-browsing/{id}"
    },
    {
        "name": "IP限制",
        "ico": "fa fa-ban",
        "component_name": "IpRestrictionsComponent",
        "module": "app/webserver/ip-restrictions/ip-restrictions.module#IpRestrictionsModule",
        "api_name": "ip_restrictions",
        "api_path": "/api/webserver/ip-restrictions/{id}"
    },
    {
        "name": "日志",
        "ico": "fa fa-pencil",
        "component_name": "LoggingComponent",
        "module": "app/webserver/logging/logging.module#LoggingModule",
        "api_name": "logging",
        "api_path": "/api/webserver/logging/{id}"
    },
    {
        "name": "MIME映射",
        "ico": "fa fa-arrows-h",
        "component_name": "MimeMapsComponent",
        "module": "app/webserver/mime-maps/mime-maps.module#MimeMapsModule",
        "api_name": "static_content",
        "api_path": "/api/webserver/static-content/{id}"
    },
    {
        "name": "监控",
        "ico": "fa fa-medkit",
        "component_name": "MonitoringComponent",
        "module": "app/webserver/monitoring/monitoring.module#MonitoringModule",
        "api_name": "monitoring",
        "api_path": "/api/webserver/monitoring/{id}"
    },
    {
        "name": "模块",
        "ico": "fa fa-th",
        "component_name": "ModulesComponent",
        "module": "app/webserver/modules/modules.module#ModulesModule",
        "api_name": "modules",
        "api_path": "/api/webserver/http-modules/{id}"
    },
    {
        "name": "响应压缩",
        "ico": "fa fa-compress",
        "component_name": "CompressionComponent",
        "module": "app/webserver/compression/compression.module#CompressionModule",
        "api_name": "response_compression",
        "api_path": "/api/webserver/http-response-compression/{id}"
    },
    {
        "name": "请求过滤",
        "ico": "fa fa-filter",
        "component_name": "RequestFilteringComponent",
        "module": "app/webserver/request-filtering/request-filtering.module#RequestFilteringModule",
        "api_name": "request_filtering",
        "api_path": "/api/webserver/http-request-filtering/{id}"
    },
    {
        "name": "请求头",
        "ico": "fa fa-arrow-down",
        "component_name": "HttpResponseHeadersComponent",
        "module": "app/webserver/http-response-headers/http-response-headers.module#HttpResponseHeadersModule",
        "api_name": "response_headers",
        "api_path": "/api/webserver/http-response-headers/{id}"
    },
    {
        "name": "求情跟踪",
        "ico": "fa fa-flag-o",
        "component_name": "RequestTracingComponent",
        "module": "app/webserver/request-tracing/request-tracing.module#RequestTracingModule",
        "api_name": "request_tracing",
        "api_path": "/api/webserver/http-request-tracing/{id}"
    },
    {
        "name": "静态类容",
        "ico": "fa fa-file-o",
        "component_name": "StaticContentComponent",
        "module": "app/webserver/static-content/static-content.module#StaticContentModule",
        "api_name": "static_content",
        "api_path": "/api/webserver/static-content/{id}"
    },
    {
        "name": "URL重写",
        "ico": "fa fa-exchange",
        "component_name": "UrlRewriteComponent",
        "module": "app/webserver/url-rewrite/url-rewrite.module#UrlRewriteModule",
        "api_name": "url_rewrite",
        "api_path": "/api/webserver/url-rewrite/{id}"
    }
]