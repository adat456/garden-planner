import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000",
        prepareHeaders(headers) {
            return headers;
        },
        credentials: "include",
    }),
    tagTypes: ["user", "beds", "roles"],
    endpoints: builder => ({
        getUser: builder.query({
            query: () => "/pull-user-data"
        }),
        getBeds: builder.query({
            query: () => "/pull-beds-data",
            providesTags: (result, error, arg) => [
                "beds",
                ...result.map(bed => ({type: "beds", id: bed.id}))
            ],
        }),
        createBed: builder.mutation({
            query: data => ({
                url: "/create-bed",
                method: "POST",
                body: data
            }),
            invalidatesTags: ["beds"],
        }),
        updateSeedBasket: builder.mutation({
            query: data => ({
                url: `/update-seed-basket/${data.bedid}`,
                method: "PATCH",
                body: data.seedbasket
            }),
            invalidatesTags: (result, error, arg) => [{ type: "beds", id: arg.bedid}]
        }),
        updateRoles: builder.mutation({
            query: data => ({
                url: `/update-roles/${data.bedid}`,
                method: "PATCH",
                body: data.roles
            }),
            invalidatesTags: (result, error, arg) => [{ type: "beds", id: arg.bedid }]
        })
    })
});

export const { 
    useGetUserQuery, 
    useGetBedsQuery, 
    useCreateBedMutation, 
    useUpdateSeedBasketMutation,
    useUpdateRolesMutation,
    util
} = apiSlice;