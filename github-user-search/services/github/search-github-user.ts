import { getValidApiResponse, type ValidApiResponse } from "../api";
import { type GithubUser } from "./github-user";


export type GithubSearchResponse = {
    total_count: number
    incomplete_results: boolean
    items: GithubUser[]
}

export async function searchGithubUser(
    query: string,
    options?: {
        signal?: AbortSignal
    }
): Promise<ValidApiResponse<GithubSearchResponse>> {
    const url = new URL('https://api.github.com/search/users')
    url.searchParams.set('q', query)

    const response = await fetch(url.toString(), {
        method: 'GET',
        ...options
    })


    return getValidApiResponse<GithubSearchResponse>(response)

}