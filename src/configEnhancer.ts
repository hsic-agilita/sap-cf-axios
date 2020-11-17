
import axios, { AxiosRequestConfig, Method} from 'axios';
import { readConnectivity, IDestinationConfiguration, IDestinationData, IHTTPDestinationConfiguration } from '@agilita/sap-cf-destconn';

export default async function enhanceConfig(config: AxiosRequestConfig, destination: IDestinationData<IHTTPDestinationConfiguration>, xsrfConfig: Method | {method: Method, url: string} = 'options') {

    // add auth header
    const destinationConfiguration = destination.destinationConfiguration;

    if (config.xsrfHeaderName && config.xsrfHeaderName !== 'X-XSRF-TOKEN') {
        // handle x-csrf-Token
        const csrfMethod = typeof xsrfConfig === 'string' ? xsrfConfig : (xsrfConfig.method || 'options');
        const csrfUrl    = typeof xsrfConfig === 'string' ? config.url : xsrfConfig.url;

        var tokenconfig: AxiosRequestConfig = {
            url: csrfUrl,
            method: csrfMethod,
            headers: {
                [config.xsrfHeaderName]: "Fetch"
            }
        };
        try{
            const { headers } = await (await axios)(tokenconfig);
            const cookies = headers["set-cookie"]; // get cookie from configuest

            // config.headers = {...config.headers, [config.xsrfHeaderName]: headers[config.xsrfHeaderName]}
            if (headers) {
                if (!config.headers) config.headers = {};
                if (cookies) config.headers.cookie = cookies.join('; ');;
                config.headers[config.xsrfHeaderName] = headers[config.xsrfHeaderName];
            }
        } catch (err) {
            console.log(err);
        }

    }

    if (destinationConfiguration.Authentication === "OAuth2ClientCredentials") {
        const clientCredentialsToken = await createToken(destinationConfiguration);
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${clientCredentialsToken}`
        }
        delete config.headers.authorization;
    }

    if (destination.authTokens && destination.authTokens[0] && !destination.authTokens[0].error) {
        if (destination.authTokens[0].error) {
            throw (new Error(destination.authTokens[0].error));
        }
        config.headers = {
            ...config.headers,
            Authorization: `${destination.authTokens[0].type} ${destination.authTokens[0].value}`
        }
        delete config.headers.authorization;
    }

    if (destinationConfiguration.ProxyType.toLowerCase() === "onpremise") {
        // connect over the cloud connector
        const authHeader = config.headers['Authorization'] || config.headers['authorization'];
        const connectivityValues =
            destinationConfiguration.Authentication === "PrincipalPropagation" ?
                await readConnectivity(destinationConfiguration.CloudConnectorLocationId, authHeader) :
                await readConnectivity(destinationConfiguration.CloudConnectorLocationId);

        config = {
            ...config,
            proxy: connectivityValues.proxy,
            headers: {
                ...config.headers,
                ...connectivityValues.headers
            }
        }


        // if it is principal propagation ... remove the original authentication header ...
        // for principal propagation, Proxy-Authorization header will be used to generate the logon ticket 
        if (destinationConfiguration.Authentication === "PrincipalPropagation") {
            delete config.headers.Authorization;
            delete config.headers.authorization;
        }
    }

    return {
        ...config,
        baseURL: destinationConfiguration.URL
    }
}


async function createToken(dc: IHTTPDestinationConfiguration): Promise<string> {
    return (await axios({
        url: `${dc.tokenServiceURL}`,
        method: 'POST',
        responseType: 'json',
        data: `client_id=${encodeURIComponent(dc.clientId)}&client_secret=${encodeURIComponent(dc.clientSecret)}&grant_type=client_credentials`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: {
            username: dc.clientId,
            password: dc.clientSecret
        }
    })).data.access_token;
};
