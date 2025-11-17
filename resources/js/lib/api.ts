import { RouteDefinition } from '@/wayfinder';
import axios, { AxiosRequestConfig } from 'axios';

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

export async function callApi<T = any>(route: RouteDefinition<Method>, payload?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.request<T>({
        url: route.url,
        method: route.method,
        data: payload,
        ...config,
    });

    return response.data;
}
