import api from './axiosClient'

export interface APICallDefinition {
    url: string
    method: 'get' | 'post' | 'put' | 'delete'
}

export async function callApi<P, R>(
    route: APICallDefinition,
    payload?: P,
): Promise<R | APIErrorResponse> {
    try {
        const { method, url } = route
        let response

        if (method === 'get') {
            response = await api.get<R>(url)
        } else {
            response = await api[method]<R>(url, payload)
        }

        return response.data as R
    } catch (error: any) {
        console.error(`${route.method.toUpperCase()} ${route.url} failed:`, error.response?.data || error.message)
        return {
            status: 'error',
            message: error.response?.data?.message || error.message || 'API call failed',
        } as any
    }
}
