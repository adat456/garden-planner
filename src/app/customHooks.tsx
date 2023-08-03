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

export function useGetCoordinates(initialCoordinates?: {latitude: number, longitude: number}) {
    const [ coordinates, setCoordinates ] = useState<{latitude: number, longitude: number} | null>(initialCoordinates || null);

    async function pullCoordinates() {
        function handleSuccess(position) {
            setCoordinates({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        };
        const handleError = () => console.log("Unable to pull coordinates.");

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    };

    function resetCoordinates() {
        setCoordinates(null);
    };

    return { coordinates, resetCoordinates, pullCoordinates };
};

export function useGetAutocompletedAddress(initialAddress?: string) {
    const [ address, setAddress ] = useState(initialAddress || "");
    const [ autocompletedAddressResults, setAutocompletedAddressResults ] = useState<{address: string, id: string}[] | null>(null);

    async function pullAutocompletedAddresses(value: string) {
        if (!value) {
            setAutocompletedAddressResults(null);
            return;
        };

        const uriEncodedInput = encodeURIComponent(value);
        try {
            const req = await fetch(`http://localhost:3000/pull-nearby-addresses/${uriEncodedInput}`, { credentials: "include" });
            const res = await req.json();
            if (req.ok) {
                const formattedAddressResultsArr = res.map(address => ({address: address.formatted, id: address.place_id}));
                setAutocompletedAddressResults(formattedAddressResultsArr);
            } else {
                throw new Error(res);
            };
        } catch(err) {
            console.error("Unable to pull autocompleted addresses: ", err.message);
        };
    };

    function generateAutocompletedAddresses() {
        const addressArr = autocompletedAddressResults?.map(result => (
            <li key={result.id}>
                <button onClick={() => {setAddress(result.address); setAutocompletedAddressResults(null);}}>
                    {result.address}
                </button>
            </li>
        ));
        return addressArr;
    };

    return { address, setAddress, pullAutocompletedAddresses, generateAutocompletedAddresses };
};