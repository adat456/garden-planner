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
        }),
        getBeds: builder.query({
            query: () => "/pull-beds-data"
        }),
        createBed: builder.mutation({
            query: data => ({
                url: "/create-bed",
                method: "POST",
                body: data
            }),
        }),
    })
});

export const { useGetUserQuery, useGetBedsQuery, useCreateBedMutation } = apiSlice;