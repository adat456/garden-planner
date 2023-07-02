import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000",
        prepareHeaders(headers) {
            return headers;
        },
        credentials: "include",
     }),
    endpoints: builder => ({
        getUser: builder.query({
            query: () => "/pull-user-data"
        })
    })
});

export const { useGetUserQuery } = apiSlice;