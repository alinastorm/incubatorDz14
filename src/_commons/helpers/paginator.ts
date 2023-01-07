import { Paginator } from "../types/types"


export function setPaginator<T>(items: T[], pageNumber: number, pageSize: number, docCount: number): Paginator<T> {
    return {
        "pagesCount": Math.ceil(docCount / pageSize),
        "page": pageNumber,
        "pageSize": pageSize,
        "totalCount": docCount,
        items
    }
}