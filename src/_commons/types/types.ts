// import { Request } from 'express';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { Request, Response } from 'express-serve-static-core';
import { IncomingHttpHeaders } from 'node:http';


export enum HTTP_STATUSES {
    OK_200 = 200,
    CREATED_201 = 201,// Если был создан ресурс, то серверу следует вернуть ответ 201 (Created) с указанием URI нового ресурса в заголовке Location.
    NO_CONTENT_204 = 204,
    BAD_REQUEST_400 = 400,
    UNAUTHORIZED_401 = 401,
    NO_ACCESS_CONTENT_403 = 403,
    NOT_FOUND_404 = 404,
    TOO_MANY_REQUESTS_429 = 429,
    SERVER_ERROR_500 = 500
}
export type RequestWithParams<P> = Request<P>
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>
export type RequestWithBody<T> = Request<{}, {}, T, {}, {}>
export type RequestWithQueryBody<Q, B> = Request<{}, {}, B, Q>
export type RequestWithParamsQuery<P, Q> = Request<P, {}, {}, Q>
export type RequestWithParamsBody<P, B> = Request<P, {}, B>
export type RequestWithParamsQueryBody<P, Q, B> = Request<P, {}, B, Q>
export interface RequestWithCookies<T> extends Request {
    cookies: T;
}
export interface RequestWithHeaders<T extends IncomingHttpHeaders> extends Request {
    headers: T;
}

export type ResponseWithCode<C extends number> = Response<{}, {}, C>
export type ResponseWithBodyCode<B, C extends number> = Response<B, {}, C>
export interface ResponseWithCookies<T> extends Response {
    cookies: T;
}


export interface Paginator<T> {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: T[]
}
export interface PaginatorQueries {
    searchNameTerm: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 1 | -1 // asc, desc
}
export class PaginatorQuery implements PaginatorQueries {
    @IsOptional() searchNameTerm: string
    @IsOptional() @Type(() => Number) pageNumber: number
    @IsOptional() @Type(() => Number) pageSize: number
    @IsOptional() sortBy: string
    @IsOptional() @Type(() => Number) sortDirection: 1 | -1 // asc, desc
}