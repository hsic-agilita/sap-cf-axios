"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sap_cf_destconn_1 = require("sap-cf-destconn");
const axios_1 = __importDefault(require("axios"));
// import axiosCookieJarSupport from 'axios-cookiejar-support';
// import * as tough from 'tough-cookie';
const configEnhancer_1 = __importDefault(require("./configEnhancer"));
function SapCfAxios(destination, instanceConfig, xsrfConfig = 'options', configEnhancer) {
    const instanceProm = createInstance(destination, instanceConfig, configEnhancer);
    return (req) => __awaiter(this, void 0, void 0, function* () {
        if (req.xsrfHeaderName && req.xsrfHeaderName !== 'X-XSRF-TOKEN') {
            // handle x-csrf-Token
            const csrfMethod = typeof xsrfConfig === 'string' ? xsrfConfig : (xsrfConfig.method || 'options');
            const csrfUrl = typeof xsrfConfig === 'string' ? req.url : xsrfConfig.url;
            var tokenReq = {
                url: csrfUrl,
                method: csrfMethod,
                headers: {
                    [req.xsrfHeaderName]: "Fetch"
                }
            };
            try {
                const {headers} = yield (yield instanceProm)(tokenReq);
                const cookies = headers["set-cookie"]; // get cookie from request
                // req.headers = {...req.headers, [req.xsrfHeaderName]: headers[req.xsrfHeaderName]}
                if (headers) {
                    if (!req.headers)
                        req.headers = {};
                    if (cookies)
                        req.headers.cookie = cookies.join('; ');
                    ;
                    req.headers[req.xsrfHeaderName] = headers[req.xsrfHeaderName];
                }
            } catch (err) {
                console.log(err);
            }
        }
        return (yield instanceProm)(req);
    });
}
exports.default = SapCfAxios;
// exports = SapCfAxios;
function createInstance(destinationName, instanceConfig, configEnhancer) {
    return __awaiter(this, void 0, void 0, function* () {
        // we will add an interceptor to axios that will take care of the destination configuration
        const instance = axios_1.default.create(instanceConfig);
        // set cookiesupport to enable X-CSRF-Token requests
        // axiosCookieJarSupport(instance);
        // instance.defaults.jar = new tough.CookieJar();
        // instance.defaults.withCredentials = true;
        // we return the destination configuration in the response.
        instance.interceptors.request.use((config) => __awaiter(this, void 0, void 0, function* () {
            // enhance config object with destination information
            const auth = config.headers.Authorization || config.headers.authorization;
            try {
                let destination = null;
                if (instance.__sap_cf_axios) {
                    var five_minutes = 5 * 60 * 1000; /* ms */
                    if (((new Date()) - instance.__sap_cf_axios.destinationReadTime) < five_minutes) {
                        destination = instance.__sap_cf_axios.destination;
                    }
                }
                if (!destination) {
                    destination = yield sap_cf_destconn_1.readDestination(destinationName, auth);
                    instance.__sap_cf_axios = {
                        destination: destination,
                        destinationReadTime: new Date()
                    }
                }
                if (configEnhancer) configEnhancer(config, destination);
                return yield configEnhancer_1.default(config, destination);
            }
            catch (e) {
                console.error('unable to connect to the destination', e);
                throw e;
            }
        }));
        return instance;
    });
}
