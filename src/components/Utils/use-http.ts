import {useEffect, useState} from "react";

export interface Props<Response = any> {
    url?: string;
    method?: string;
    body?: Document | BodyInit | null;
    headers?: { [key: string]: string };
    withCredentials?: boolean;
    onLoad?: (response: Response) => any;
    responseParser?: (response: string) => Response;
    autoStart?: boolean;
}

export const useHttp = <Response>(props: Props<Response>) => {
    props = {
        method: 'GET',
        headers: {},
        onLoad: () => {},
        responseParser: JSON.parse,
        autoStart: true,
        ...props,
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [response, setResponse] = useState<Response>();
    const [request, setRequest] = useState<Request>();

    let onChange = () => {
        props.autoStart && fetch();
        onChange = () => {
            cancelRequest();
            fetch();

            return cancelRequest;
        };

        return cancelRequest;
    };

    const onLoad = (responseText: string) => {
        let response: Response;

        try {
            response = props.responseParser(responseText);
        }
        catch(e) {
            onError(request);
            return;
        }

        setResponse(response);
        setLoading(false);
        props.onLoad(response);
    };

    const onError = (request: Request) => {
        if (request && request.getStatueCode() === 401) {
            return console.log('error')
        }
        setLoading(false);
        setError(true);
    };

    const fetch = (options: Partial<Props> = props) => {
        return new Promise<string>((resolve, reject) => {

            options = {...props, ...options};
            setLoading(true);
            setError(false);
            setRequest(() => new Request({
                url: options.url,
                method: options.method,
                withCredentials: options.withCredentials,
                headers: options.headers,
                body: options.body,
                onLoad: response => {
                    onLoad(response);
                    resolve(response);
                },
                onError: request => {
                    onError(request);
                    reject();
                },
            }));
        });
    };

    const cancelRequest = () => request && request.abort();

    const getHash = (options: Partial<Props> = props) => {
        const { url, method, body, headers } = options;

        return `${method}_${url}_${JSON.stringify(headers)}_${body || ''}`;
    };

    useEffect(onChange, [getHash()]);

    return { loading, error, setError, response, fetch };
};

interface RequestParams {
    url: string,
    method?: string,
    withCredentials?: boolean,
    headers?: { [headerName: string]: string },
    body?: Document | BodyInit | null,
    onError?: (request: Request) => any;
    onLoad?: (responseText: string) => any;
}

class Request {
    private readonly req: XMLHttpRequest;

    constructor(params: RequestParams) {
        const req = this.req = new XMLHttpRequest();

        params = {
            method: 'GET',
            withCredentials: false,
            headers: {},
            onLoad: () => {},
            onError: () => {},
            ...params,
        };

        req.onload = () => {
            if (req.status > 399) {
                params.onError(this);
            }
            else {
                params.onLoad(req.responseText);
            }
        };
        req.onerror = () => params.onError(this);
        req.open(params.method, params.url, true);
        req.withCredentials = params.withCredentials;
        Object.entries(params.headers).forEach(([key, value]) => req.setRequestHeader(key, value));
        req.send(params.body);
    }

    getStatueCode() {
        return this.req.status;
    }

    abort() {
        this.req.abort();
    }
}