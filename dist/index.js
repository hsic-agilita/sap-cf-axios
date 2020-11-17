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
const sap_cf_destconn_1 = require("@agilita/sap-cf-destconn");
const axios_1 = __importDefault(require("axios"));
// import axiosCookieJarSupport from 'axios-cookiejar-support';
// import * as tough from 'tough-cookie';
const configEnhancer_1 = __importDefault(require("./configEnhancer"));
function SapCfAxios(destinationName, instanceConfig, xsrfConfig = 'options') {
    // we will add an interceptor to axios that will take care of the destination configuration
    const instance = axios_1.default.create(instanceConfig);
    const auth = instanceConfig && instanceConfig.headers && (instanceConfig.headers.Authorization || instanceConfig.headers.authorization);
    instance.destinationConfiguration = sap_cf_destconn_1.readDestination(destinationName, auth);
    instance.destinationReadTime = new Date();
    // set cookiesupport to enable X-CSRF-Token requests
    // axiosCookieJarSupport(instance);
    // instance.defaults.jar = new tough.CookieJar();
    // instance.defaults.withCredentials = true;
    // we return the destination configuration in the response.
    instance.interceptors.request.use((config) => __awaiter(this, void 0, void 0, function* () {
        // enhance config object with destination information
        const auth = config.headers.Authorization || config.headers.authorization;
        try {
            // Read the configuration, 5 Minutues caching
            var five_minutes = 5 * 60 * 1000; /* ms */
            if (((new Date()).valueOf() - instance.destinationReadTime.valueOf()) > five_minutes) {
                instance.destinationConfiguration = sap_cf_destconn_1.readDestination(destinationName, auth);
                ;
                instance.destinationReadTime = new Date();
            }
            return yield configEnhancer_1.default(config, yield instance.destinationConfiguration, xsrfConfig);
        }
        catch (e) {
            console.error('unable to connect to the destination', e);
            throw e;
        }
    }));
    return instance;
}
exports.default = SapCfAxios;
// exports = SapCfAxios;
