import axios from 'axios';
import type { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';

import api from './axiosClient';

const MIN_DELAY_MS = 1000;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiError = { ok: false; message: string; status?: number };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

type SuccessEnvelope = { status: 'success'; data?: unknown } & Record<string, unknown>;
type ErrorEnvelope = { status: 'error'; message?: string; statusCode?: number } & Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isSuccessEnvelope(value: unknown): value is SuccessEnvelope {
    return isRecord(value) && value.status === 'success';
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
    return isRecord(value) && value.status === 'error';
}

function extractMessage(payload: unknown): string | undefined {
    if (!payload) return undefined;
    if (typeof payload === 'string') return payload;
    if (isRecord(payload)) {
        if (typeof payload.message === 'string') return payload.message;
        if (typeof payload.error === 'string') return payload.error;
        if (typeof payload.detail === 'string') return payload.detail;
    }
    return undefined;
}

function normalizeSuccess<T>(response: AxiosResponse<unknown>): ApiResponse<T> {
    const body = response?.data;

    if (isSuccessEnvelope(body)) {
        if (Object.prototype.hasOwnProperty.call(body, 'data')) {
            return { ok: true, data: body.data as T };
        }
        const { status: _status, ...rest } = body;
        void _status;
        return { ok: true, data: rest as T };
    }

    if (isErrorEnvelope(body)) {
        return {
            ok: false,
            message: extractMessage(body) ?? 'Request failed',
            status: typeof body.statusCode === 'number' ? body.statusCode : undefined,
        };
    }

    return { ok: true, data: body as T };
}

function normalizeFailure(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<unknown>;
        const message =
            extractMessage(axiosError.response?.data) ?? axiosError.message ?? 'Unable to complete request';
        const status = axiosError.response?.status;
        return { ok: false, message, status };
    }

    if (error instanceof Error) {
        return { ok: false, message: error.message };
    }

    return { ok: false, message: 'Unknown error' };
}

async function withMinimumDelay<T>(promise: Promise<T>): Promise<T> {
    const delayPromise = wait(MIN_DELAY_MS);
    try {
        const result = await promise;
        await delayPromise;
        return result;
    } catch (error) {
        await delayPromise;
        throw error;
    }
}

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
        const response = await withMinimumDelay(api.request<unknown>(config));
        return normalizeSuccess<T>(response);
    } catch (error) {
        return normalizeFailure(error);
    }
}

export async function apiRequestFromPromise<T>(promise: Promise<AxiosResponse<unknown>>): Promise<ApiResponse<T>> {
    try {
        const response = await withMinimumDelay(promise);
        return normalizeSuccess<T>(response);
    } catch (error) {
        return normalizeFailure(error);
    }
}

export { MIN_DELAY_MS };
