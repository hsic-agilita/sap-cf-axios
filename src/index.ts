import { readDestination, IHTTPDestinationConfiguration, IDestinationData } from 'sap-cf-destconn'
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, Method} from 'axios';
// import axiosCookieJarSupport from 'axios-cookiejar-support';
// import * as tough from 'tough-cookie';
import enhanceConfig from './configEnhancer';

declare var exports: any;

interface SapCfAxiosInstance extends AxiosInstance {
    destinationConfiguration: Promise<IDestinationData<IHTTPDestinationConfiguration>>,
    destinationReadTime: Date
}

export default function SapCfAxios(destinationName: string, instanceConfig?: AxiosRequestConfig, xsrfConfig: Method | {method: Method, url: string} = 'options') {
    // we will add an interceptor to axios that will take care of the destination configuration
    const instance = axios.create(instanceConfig) as SapCfAxiosInstance;

    const auth = instanceConfig && instanceConfig.headers && (instanceConfig.headers.Authorization || instanceConfig.headers.authorization);
    instance.destinationConfiguration = readDestination<IHTTPDestinationConfiguration>(destinationName, auth);
    instance.destinationReadTime = new Date();

    // set cookiesupport to enable X-CSRF-Token requests
    // axiosCookieJarSupport(instance);
    // instance.defaults.jar = new tough.CookieJar();
    // instance.defaults.withCredentials = true;

    // we return the destination configuration in the response.
    instance.interceptors.request.use(
        async (config) => {
            // enhance config object with destination information
            const auth = config.headers.Authorization || config.headers.authorization;
            try{
                // Read the configuration, 5 Minutues caching
                var five_minutes = 5 * 60 * 1000; /* ms */
                if (((new Date()).valueOf() - instance.destinationReadTime.valueOf()) > five_minutes) {
                    instance.destinationConfiguration = readDestination<IHTTPDestinationConfiguration>(destinationName, auth);;
                    instance.destinationReadTime = new Date()
                }
                return await enhanceConfig(config, await instance.destinationConfiguration, xsrfConfig);
            } catch( e) {
                console.error('unable to connect to the destination', e)
                throw e;
            }
        }
    );

    return instance;
}
// exports = SapCfAxios;

