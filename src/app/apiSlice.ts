import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000",
        prepareHeaders(headers) {
            return headers;
        },
        credentials: "include",
    }),
    tagTypes: ["user", "beds", "notifications", "events"],
    endpoints: builder => ({
        getUser: builder.query({
            query: () => "/pull-user-data",
            providesTags: ["user"]
        }),
        getBeds: builder.query({
            query: () => "/pull-beds-data",
            providesTags: (result, error, arg) => [
                "beds",
                ...result.map(bed => ({ type: "beds", id: bed.id }))
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
        // all PATCH requests below receive a data object, e.g., data = {bedid: number, someData}
        updateSeedBasket: builder.mutation({
            query: data => ({
                url: `/update-seed-basket/${data.bedid}`,
                method: "PATCH",
                body: data.seedbasket
            }),
            invalidatesTags: (result, error, arg) => [{ type: "beds", id: arg.bedid}]
        }),
        updateGridMap: builder.mutation({
            query: data => ({
                url: `/update-gridmap/${data.bedid}`,
                method: "PATCH",
                body: data.gridmap
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
        }),
        updateMembers: builder.mutation({
            query: data => ({
                url: `/update-members/${data.bedid}`,
                method: "PATCH",
                body: data.members
            }),
            invalidatesTags: (result, error, arg) => [{ type: "beds", id: arg.bedid }]
        }),
        // notifications
        getNotifications: builder.query({
            query: () => "/pull-notifications",
            providesTags: [ "notifications" ]
        }),
        // data = notification
        addNotification: builder.mutation({
            query: data => ({
                url: "/add-notification",
                method: "POST",
                body: data
            }),
            invalidatesTags: [ "notifications" ]
        }),
        // data = { notifid, acknowledged }
        updateNotification: builder.mutation({
            query: data => ({
                url: `/update-notification/${data.notifid}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [ "notifications" ]
        }),
        // data = notifid
        deleteNotification: builder.mutation({
            query: data => ({
                url: `/delete-notification/${data}`,
                method: "DELETE"
            }),
            invalidatesTags: [ "notifications" ]
        }),
        /////// EVENTS ////////////////
        getEvents: builder.query({
            query: data => `/pull-events/${data}`,
            providesTags: [ "events" ]
        }),
        addEvent: builder.mutation({
            query: data => ({
                url: `/add-event/${data.bedid}`,
                method: "POST",
                body: data.event
            }),
            invalidatesTags: [ "events" ]
        }),
        deleteEvent: builder.mutation({
            query: data => ({
                url: `/delete-event/${data.eventid}/${data.repeatid}`,
                method: "DELETE",
            }),
            invalidatesTags: [ "events" ]
        }),
    })
});

export const { 
    useGetUserQuery, 

    useGetBedsQuery, 
    useCreateBedMutation, 
    useUpdateSeedBasketMutation,
    useUpdateGridMapMutation,
    useUpdateRolesMutation,
    useUpdateMembersMutation,

    useGetNotificationsQuery,
    useAddNotificationMutation,
    useUpdateNotificationMutation,
    useDeleteNotificationMutation,

    useGetEventsQuery,
    useAddEventMutation,
    useDeleteEventMutation,

    util
} = apiSlice;