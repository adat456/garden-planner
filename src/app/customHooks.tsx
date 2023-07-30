import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetEventsQuery } from "./apiSlice";
import { isJWTInvalid } from "./helpers";

// returns a function that takes in an error object and redirects to /sign-in if error message indicates JWT is invalid
export function useRedirectOnAuthError() {
    const navigate = useNavigate();

    function redirectOnAuthError(error) {
        console.log(error);
        if (error?.data) {
            if (typeof error.data === "string" && isJWTInvalid(error.data)) navigate("/sign-in");
        };
    };
    
    return redirectOnAuthError;
};

// both return any necessary functionality from the actual query/mutation, but incorporate above hook for managing invalid JWTs
// receives an optional argument if the query needs one to fetch the data
export function useWrapRTKQuery(useQuery, arg = undefined) {
    const { data, refetch, isLoading, isSuccess, isError, error } = useQuery(arg);
    const redirectOnAuthError = useRedirectOnAuthError();

    useEffect(() => {
        redirectOnAuthError(error);
    }, [error]);

    return { data, refetch, isLoading, isSuccess, isError, error };
};

export function useWrapRTKMutation(useMutation, arg = undefined) {
    const [ mutation, { isLoading, refetch, error } ] = useMutation();   
    const redirectOnAuthError = useRedirectOnAuthError();

    useEffect(() => {
        redirectOnAuthError(error);
    }, [error]);

    return { mutation, isLoading, refetch, error };
};

export function useDynamicEventsQuery() {
    const [ bedIdForEvents, setBedIdForEvents ] = useState<number | undefined>(undefined);
    
    const skip = bedIdForEvents ? false : true;
    const { data } = useGetEventsQuery(bedIdForEvents, { 
        skip
    });
    console.log(data, bedIdForEvents, "events data refetched");

    return setBedIdForEvents;
}; 