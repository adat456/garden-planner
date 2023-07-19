import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000",
        prepareHeaders(headers) {
            return headers;
        },
        credentials: "include",
    }),
    tagTypes: ["user", "beds", "notifications", "events", "posts", "comments"],
    endpoints: builder => ({
        getUser: builder.query({
            query: () => "/pull-user-data",
            providesTags: ["user"]
        }),
        getBeds: builder.query({
            query: () => "/pull-beds-data",
            providesTags: [ "beds" ]
        }),
        createBed: builder.mutation({
            query: data => ({
                url: "/create-bed",
                method: "POST",
                body: data
            }),
            invalidatesTags: ["beds"],
        }),
        updateBed: builder.mutation({
            query: data => ({
                url: `/update-bed/${data.bedid}`,
                method: "PATCH",
                body: data.bed
            }),
            invalidatesTags: ["beds"],
        }),
        deleteBed: builder.mutation({
            query: data => ({
                url: `/delete-bed/${data}`,
                method: "DELETE"
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
            invalidatesTags: [ "beds" ]
        }),
        updateGridMap: builder.mutation({
            query: data => ({
                url: `/update-gridmap/${data.bedid}`,
                method: "PATCH",
                body: data.gridmap
            }),
            invalidatesTags: [ "beds" ]
        }),
        updateRoles: builder.mutation({
            query: data => ({
                url: `/update-roles/${data.bedid}`,
                method: "PATCH",
                body: data.roles
            }),
            invalidatesTags: [ "beds" ]
        }),
        updateMembers: builder.mutation({
            query: data => ({
                url: `/update-members/${data.bedid}`,
                method: "PATCH",
                body: data.members
            }),
            invalidatesTags: [ "beds" ]
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
                body: {read: data.read, responded: data.responded},
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
            invalidatesTags: [ "events", "beds" ]
        }),
        deleteEvent: builder.mutation({
            query: data => ({
                url: `/delete-event/${data.eventid}/${data.repeatid}`,
                method: "DELETE",
            }),
            invalidatesTags: [ "events", "beds" ]
        }),
        deleteTag: builder.mutation({
            query: data => ({
                url: `/delete-tag/${data.bedid}`,
                method: "PATCH",
                body: data.body
            }),
            invalidatesTags: [ "events", "beds" ]
        }),
        //////// BULLETIN /////////////
        getPosts: builder.query({
            query: data => `/pull-posts/${data}`,
            providesTags: [ "posts" ]
        }),
        addPost: builder.mutation({
            query: data => ({
                url: `/add-post/${data.bedid}`,
                method: "POST",
                body: data.post
            }),
            invalidatesTags: [ "posts" ]
        }),
        updatePost: builder.mutation({
            query: data => ({
                url: `/update-post/${data.postid}`,
                method: "PATCH",
                body: data.content
            }),
            invalidatesTags: [ "posts" ]
        }),
        deletePost: builder.mutation({
            query: data => ({
                url: `/delete-post/${data}`,
                method: "DELETE"
            }),
            invalidatesTags: [ "posts" ]
        }),
        updateReactions: builder.mutation({
            query: data => ({
                url: `/update-reactions/${data.table}/${data.id}`,
                method: "PATCH",
                body: data.reaction
            }),
            invalidatesTags: [ "posts", "comments" ]
        }),
        getComments: builder.query({
            query: data => `/pull-comments/${data}`,
            providesTags: [ "comments" ]
        }),
        addComment: builder.mutation({
            query: data => ({
                url:`/add-comment/${data.postid}`,
                method: "POST",
                body: data.comment
            }),
            invalidatesTags: [ "comments" ]
        }),
        updateComment: builder.mutation({
            query: data => ({
                url: `/update-comment/${data.commentid}`,
                method: "PATCH",
                body: data.content
            }),
            invalidatesTags: [ "comments" ]
        }),
        deleteComment: builder.mutation({
            query: data => ({
                url: `/delete-comment/${data}`,
                method: "DELETE"
            }),
            invalidatesTags: [ "comments" ]
        })
    })
});

export const { 
    useGetUserQuery, 

    useGetBedsQuery, 
    useCreateBedMutation, 
    useUpdateBedMutation,
    useDeleteBedMutation,
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
    useDeleteTagMutation,

    useGetPostsQuery,
    useAddPostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useUpdateReactionsMutation,

    useGetCommentsQuery,
    useAddCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,

    util
} = apiSlice;