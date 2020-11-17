import { AxiosRequestConfig, Method } from 'axios';
import { IDestinationData, IHTTPDestinationConfiguration } from '@agilita/sap-cf-destconn';
export default function enhanceConfig(config: AxiosRequestConfig, destination: IDestinationData<IHTTPDestinationConfiguration>, xsrfConfig?: Method | {
    method: Method;
    url: string;
}): Promise<{
    baseURL: string;
    url?: string | undefined;
    method?: "link" | "head" | "get" | "GET" | "delete" | "DELETE" | "HEAD" | "options" | "OPTIONS" | "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "LINK" | "unlink" | "UNLINK" | undefined;
    transformRequest?: import("axios").AxiosTransformer | import("axios").AxiosTransformer[] | undefined;
    transformResponse?: import("axios").AxiosTransformer | import("axios").AxiosTransformer[] | undefined;
    headers?: any;
    params?: any;
    paramsSerializer?: ((params: any) => string) | undefined;
    data?: any;
    timeout?: number | undefined;
    timeoutErrorMessage?: string | undefined;
    withCredentials?: boolean | undefined;
    adapter?: import("axios").AxiosAdapter | undefined;
    auth?: import("axios").AxiosBasicCredentials | undefined;
    responseType?: "text" | "document" | "blob" | "arraybuffer" | "json" | "stream" | undefined;
    xsrfCookieName?: string | undefined;
    xsrfHeaderName?: string | undefined;
    onUploadProgress?: ((progressEvent: any) => void) | undefined;
    onDownloadProgress?: ((progressEvent: any) => void) | undefined;
    maxContentLength?: number | undefined;
    validateStatus?: ((status: number) => boolean) | undefined;
    maxRedirects?: number | undefined;
    socketPath?: string | null | undefined;
    httpAgent?: any;
    httpsAgent?: any;
    proxy?: false | import("axios").AxiosProxyConfig | undefined;
    cancelToken?: import("axios").CancelToken | undefined;
}>;
