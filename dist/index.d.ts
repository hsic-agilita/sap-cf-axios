import { IHTTPDestinationConfiguration, IDestinationData } from 'sap-cf-destconn';
import { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
interface SapCfAxiosInstance extends AxiosInstance {
    destinationConfiguration: Promise<IDestinationData<IHTTPDestinationConfiguration>>;
    destinationReadTime: Date;
}
export default function SapCfAxios(destinationName: string, instanceConfig?: AxiosRequestConfig, xsrfConfig?: Method | {
    method: Method;
    url: string;
}): SapCfAxiosInstance;
export {};
