import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000",
        prepareHeaders(headers) {
            return headers;
        },
        credentials: "include",
    }),
    tagTypes: ["user", "beds", "permissions", "notifications", "tasks", "events", "posts", "comments"],
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
                body: {seedbasket: data.seedbasket}
            }),
            invalidatesTags: [ "beds" ]
        }),
        updateGridMap: builder.mutation({
            query: data => ({
                url: `/update-gridmap/${data.bedid}`,
                method: "PATCH",
                body: {gridmap: data.gridmap}
            }),
            invalidatesTags: [ "beds" ]
        }),
        updateRoles: builder.mutation({
            query: data => ({
                url: `/update-roles/${data.bedid}`,
                method: "PATCH",
                body: {roles: data.roles}
            }),
            invalidatesTags: [ "beds" ]
        }),
        updateMembers: builder.mutation({
            query: data => ({
                url: `/update-members/${data.bedid}`,
                method: "PATCH",
                body: {members: data.members}
            }),
            invalidatesTags: [ "beds" ]
        }),
        /// PERMISSIONS /////////////////////////
        getPersonalPermissions: builder.query({
            query: data => `/pull-personal-permissions/${data}`,
        }),
        getPermissionsLog: builder.query({
            query: data => `/pull-permissions-log/${data}`,
            providesTags: [ "permissions" ],
        }),
        updatePermissions: builder.mutation({
            query: data => ({
                url: `/update-permissions-log/${data.bedid}`,
                method: "PATCH",
                body: {permissions: data.permissions}
            }),
            invalidatesTags: [ "permissions" ],
        }),
        /// NOTIFICATIONS //////////////////////////
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
        //////// TASKS //////////////////
        getTasks: builder.query({
            query: data => `/pull-tasks/${data}`,
            providesTags: [ "tasks" ],
        }),
        addTask: builder.mutation({
            query: data => ({
                url: `/add-task/${data.bedid}`,
                method: "POST",
                body: data.task,
            }),
            invalidatesTags: [ "tasks" ]
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
                url: `/delete-event/${data.bedid}/${data.eventid}/${data.repeatid}`,
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
        updatePostPin: builder.mutation({
            query: data => ({
                url: `/toggle-post-pin/${data.bedid}/${data.postid}`,
                method: "PATCH"
            }),
            invalidatesTags: [ "posts" ]
        }),
        updatePost: builder.mutation({
            query: data => ({
                url: `/update-post/${data.bedid}/${data.postid}`,
                method: "PATCH",
                body: data.content
            }),
            invalidatesTags: [ "posts" ]
        }),
        updateSubscribers: builder.mutation({
            query: data => ({
                url: `/update-subscribers/${data.postid}/${data.userid}`,
                method: "PATCH"
            }),
            invalidatesTags: [ "posts" ],
        }),
        deletePost: builder.mutation({
            query: data => ({
                url: `/delete-post/${data.bedid}/${data.postid}`,
                method: "DELETE"
            }),
            invalidatesTags: [ "posts" ]
        }),
        updateReactions: builder.mutation({
            query: data => ({
                url: `/update-reactions/${data.bedid}/${data.table}/${data.id}`,
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
                url:`/add-comment/${data.bedid}/${data.postid}`,
                method: "POST",
                body: data.comment
            }),
            invalidatesTags: [ "comments" ]
        }),
        updateComment: builder.mutation({
            query: data => ({
                url: `/update-comment/${data.bedid}/${data.commentid}`,
                method: "PATCH",
                body: data.content
            }),
            invalidatesTags: [ "comments" ]
        }),
        deleteComment: builder.mutation({
            query: data => ({
                url: `/delete-comment/${data.bedid}/${data.commentid}`,
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

    useGetPersonalPermissionsQuery,
    useGetPermissionsLogQuery,
    useUpdatePermissionsMutation,

    useGetNotificationsQuery,
    useAddNotificationMutation,
    useUpdateNotificationMutation,
    useDeleteNotificationMutation,

    useGetTasksQuery,
    useAddTaskMutation,

    useGetEventsQuery,
    useAddEventMutation,
    useDeleteEventMutation,
    useDeleteTagMutation,

    useGetPostsQuery,
    useAddPostMutation,
    useUpdatePostPinMutation,
    useUpdatePostMutation,
    useUpdateSubscribersMutation,
    useDeletePostMutation,
    useUpdateReactionsMutation,

    useGetCommentsQuery,
    useAddCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,

    util
} = apiSlice;