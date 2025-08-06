import { HTTPFetchNetworkInterface, NetworkInterface } from 'apollo-client';
import { OutputMap } from '../common';
export declare class PersistedQueryNetworkInterface extends HTTPFetchNetworkInterface {
    queryMap: OutputMap;
    _opts: RequestInit;
    _uri: string;
    enablePersistedQueries: boolean;
    constructor({ enablePersistedQueries, uri, queryMap, opts, }: {
        enablePersistedQueries?: boolean;
        uri: string;
        queryMap: OutputMap;
        opts?: RequestInit;
    });
}
export declare function addPersistedQueries(networkInterface: NetworkInterface, queryMap: OutputMap): any;
