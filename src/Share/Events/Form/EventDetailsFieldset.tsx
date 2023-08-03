import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format, formatISO } from "date-fns";
import { useGetBedsQuery } from "../../../app/apiSlice";
import { useWrapRTKQuery } from "../../../app/customHooks";
import { bedDataInterface, eventParticipantInterface } from "../../../app/interfaces";
import { validateRequiredInputLength } from "../../../app/helpers";

interface eventDetailsFieldsetInterface {
    eventName: string,
    setEventName: React.Dispatch<React.SetStateAction<string>>,
    eventDesc: string,
    setEventDesc: React.Dispatch<React.SetStateAction<string>>,
    eventLocation: string,
    setEventLocation: React.Dispatch<React.SetStateAction<string>>,
    pullAutocompletedAddresses: (value: string) => Promise<void>,
    generateAutocompletedAddresses: () => JSX.Element[] | undefined,
    eventPublic: string,
    setEventPublic: React.Dispatch<React.SetStateAction<string>>,
    rsvpNeeded: boolean,
    setRsvpNeeded: React.Dispatch<React.SetStateAction<boolean>>,
    rsvpDate: string | null,
    setRsvpDate: React.Dispatch<React.SetStateAction<string | null>>,
    participantSearch: string,
    setParticipantSearch: React.Dispatch<React.SetStateAction<string>>,
    participantSearchResults: eventParticipantInterface[],
    setParticipantSearchResults: React.Dispatch<React.SetStateAction<eventParticipantInterface[]>>,
    eventParticipants: eventParticipantInterface[],
    setEventParticipants: React.Dispatch<React.SetStateAction<eventParticipantInterface[]>>,
    eventDate: Date[],
    submitTrigger: number,
    errMsgs: {field: string, msg: string}[],
};

const EventDetailsFieldset: React.FC<eventDetailsFieldsetInterface> = function({ eventName, setEventName, eventDesc, setEventDesc, eventLocation, setEventLocation, pullAutocompletedAddresses, generateAutocompletedAddresses, eventPublic, setEventPublic, rsvpNeeded, setRsvpNeeded, rsvpDate, setRsvpDate, participantSearch, setParticipantSearch, participantSearchResults, setParticipantSearchResults, eventParticipants, setEventParticipants, eventDate, submitTrigger, errMsgs}) {
    const [ eventNameErrMsg, setEventNameErrMsg ] = useState("");
    const [ eventDescErrMsg, setEventDescErrMsg ] = useState("");
    const [ eventLocationErrMsg, setEventLocationErrMsg ] = useState("");
    const [ eventPublicErrMsg, setEventPublicErrMsg ] = useState("");
    const [ eventParticipantsErrMsg, setEventParticipantsErrMsg ] = useState("");
    const [ rsvpNeededErrMsg, setRsvpNeededErrMsg ] = useState("");
    const [ rsvpDateErrMsg, setRsvpDateErrMsg ] = useState("");

    const eventNameRef = useRef<HTMLInputElement>(null);
    const eventDescRef = useRef<HTMLInputElement>(null);
    const eventLocationRef = useRef<HTMLInputElement>(null);
    const rsvpNeededRef = useRef<HTMLInputElement>(null);
    const rsvpDateRef = useRef<HTMLInputElement>(null);

    const previousTriggerValue = useRef(submitTrigger);

    const { bedid } = useParams();
    const { data: bedObject } = useWrapRTKQuery(useGetBedsQuery);
    const bed = bedObject?.find(bed => bed.id === Number(bedid)) as bedDataInterface;

    function handleEventPublic(value: string) {
        if (value === "public" || value === "allmembers") {
            setParticipantSearch("");
            setParticipantSearchResults([]);
            setEventParticipants([]);
        };

        setEventPublic(value);
    };

    function handleRSVP() {
        if (!rsvpNeeded) setRsvpDate("");
        setRsvpNeeded(!rsvpNeeded);
    };
    
    /// PARTICIPANTS ///
    function handleParticipantSearchChange(e: React.FormEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;
        setParticipantSearch(input.value);

        const trimmedInputValue = input.value.trim().toLowerCase();
        console.log(bed);

        setParticipantSearchResults(bed?.members?.filter(member => member.name.toLowerCase().includes(trimmedInputValue) || member.username.toLowerCase().includes(trimmedInputValue)))
    };
    function generateParticipantSearchResults() {
        let results;
        if (participantSearchResults.length > 0) {
            results = participantSearchResults.map(participant => (
                <li key={`participant-search-result-${participant.id}`}>
                    <button type="button" onClick={() => addParticipant(participant.id, participant.name, participant.username)}>Add</button>
                    <p>{participant.name}</p>
                    <p>{participant.username}</p>
                </li>
            ));
        } else {
            results = <p>No matching members found.</p>
        };
        return results;
    };
    function addParticipant(id: number, name: string, username: string) {
        setEventParticipants([...eventParticipants, {id, name, username} ]);
    };
    function generateParticipants() {
        let participantsArr = eventParticipants?.map(participant => (
            <li key={`participant-${participant.id}`}>
                <button type="button" onClick={() => removeParticipant(participant.id)}>Remove</button>
                <p>{participant.name}</p>
                <p>{participant.username}</p>
            </li>
        ));
        return participantsArr;
    };
    function removeParticipant(id: number) {
        setEventParticipants(eventParticipants.filter(participant => participant.id !== id));
    }; 

    // validation that event participants have been specified for exclusive events
    function validateEventParticipants() {
        if (eventPublic === "somemembers" && eventParticipants.length == 0) {
            setEventParticipantsErrMsg("No participants have been invited to this event. Please add participants or change the public level of the event.");
        } else {
            setEventParticipantsErrMsg("");
        };
    };
    useEffect(() => validateEventParticipants(), [eventParticipants]);

    // validation that RSVP date falls within accepted range
    function validateRSVPDate(date: string) {
        const today = formatISO(new Date(), { representation: "date" });
        const eventStartDate = formatISO(new Date(eventDate[0]), { representation: "date" });
        const rsvpDate = date;

        let errMsgString = "";
        if (rsvpDate < today) errMsgString += "The RSVP date may not be earlier than today. ";
        if (rsvpDate > eventStartDate) errMsgString += "If requiring RSVPs, the RSVP by date must land before or on the event start date.";
        if (rsvpDate >= today && rsvpDate <= eventStartDate) errMsgString = "";
        if (rsvpNeeded && !rsvpDate) errMsgString = "Specify RSVP by date if requiring RSVPs."
  
        setRsvpDateErrMsg(errMsgString);
    };

    // repeat/final validation triggered upon attempt to submit (passed in from parent EventForm)
    useEffect(() => {
        if (submitTrigger > previousTriggerValue.current) {
            validateRequiredInputLength(eventNameRef?.current, 25, setEventNameErrMsg);
            validateRequiredInputLength(eventLocationRef?.current, 250, setEventLocationErrMsg);
            validateEventParticipants();
            if (rsvpNeeded && typeof rsvpDate === "string") validateRSVPDate(rsvpDate);
        };
    }, [submitTrigger]);

    // setting error messages with error data passed in by parent EventForm
    useEffect(() => {
        if (errMsgs?.length > 0) {
            errMsgs.forEach(error => {
                switch (error.field) {
                    case "eventName":
                        setEventNameErrMsg(error.msg);
                        eventNameRef.current?.setCustomValidity(error.msg);
                        return;
                    case "eventDesc": 
                        setEventDescErrMsg(error.msg);
                        eventDescRef.current?.setCustomValidity(error.msg);
                        return;
                    case "eventLocation":
                        setEventLocationErrMsg(error.msg);
                        eventLocationRef.current?.setCustomValidity(error.msg);
                        return;
                    case "eventPublic": 
                        setEventPublicErrMsg(error.msg);
                        return;
                    case "eventParticipants":
                        setEventParticipantsErrMsg(error.msg);
                        return;
                    case "rsvpNeeded":
                        setRsvpNeededErrMsg(error.msg);
                        rsvpNeededRef.current?.setCustomValidity(error.msg);
                        return;
                    case "rsvpDate":
                        setRsvpDateErrMsg(error.msg);
                        rsvpDateRef.current?.setCustomValidity(error.msg);
                        return;
                };
            });
        };
    }, [errMsgs]);

    return (
        <>
            <div>
                <label htmlFor="eventName">Name*</label>
                {eventNameErrMsg ? 
                    <div className="error-msg">
                        <p>{eventNameErrMsg}</p> 
                    </div>
                    : null
                }
                <input type="text" id="eventName" maxLength={25} ref={eventNameRef} value={eventName} onChange={(e) => {setEventName(e.target.value); validateRequiredInputLength(eventNameRef?.current, 25, setEventNameErrMsg);}} required />
            </div>
            <div>
                <label htmlFor="eventDesc">Description</label>
                {eventDescErrMsg ? 
                    <div className="error-msg">
                        <p>{eventDescErrMsg}</p> 
                    </div>
                    : null
                }
                <textarea id="eventDesc" maxLength={250} ref={eventDescRef} value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} />
            </div>
            <div>
                <label htmlFor="eventLocation">Location*</label>
                {eventLocationErrMsg ? 
                    <div className="error-msg">
                        <p>{eventLocationErrMsg}</p> 
                    </div>
                    : null
                }
                <input type="text" id="eventLocation" maxLength={250} ref={eventLocationRef} value={eventLocation} onChange={(e) => {setEventLocation(e.target.value); pullAutocompletedAddresses(e.target.value); validateRequiredInputLength(eventLocationRef?.current, 250, setEventLocationErrMsg);}} required />
                <ul>
                    {generateAutocompletedAddresses()}
                </ul>
                <button type="button" onClick={() => setEventLocation("")}>Clear</button>
            </div>
            <div>
                <p>Event is open to*:</p>
                {eventPublicErrMsg ? 
                    <div className="error-msg">
                        <p>{eventPublicErrMsg}</p> 
                    </div>
                    : null
                }
                <div>
                    <input type="radio" name="eventPublic" id="public" checked={eventPublic === "public" ? true : false} onChange={() => handleEventPublic("public")} />
                    <label htmlFor="public">The public</label>
                </div>
                <div>
                    <input type="radio" name="eventPublic" id="allmembers" checked={eventPublic === "allmembers" ? true : false} onChange={() => handleEventPublic("allmembers")} />
                    <label htmlFor="allmembers">All members</label>
                </div>
                <div>
                    <input type="radio" name="eventPublic" id="somemembers" checked={eventPublic === "somemembers" ? true : false} onChange={() => handleEventPublic("somemembers")} />
                    <label htmlFor="somemembers">Some members</label>
                </div>
            </div>
            
            {eventPublic === "somemembers" ?
                <>
                    {eventParticipantsErrMsg ? 
                        <div className="error-msg">
                            <p>{eventParticipantsErrMsg}</p> 
                        </div>
                        : null
                    }
                    <h4>Added participants*</h4>
                    {generateParticipants()}
                    <div>
                        <label htmlFor="participantSearch">Add participants</label>
                        <input type="text" id="participantSearch" value={participantSearch} onChange={handleParticipantSearchChange} /> 
                    </div>
                    {generateParticipantSearchResults()}
                </>: 
                null
            }
            <div>
                {rsvpNeededErrMsg ? 
                    <div className="error-msg">
                        <p>{rsvpNeededErrMsg}</p> 
                    </div>
                    : null
                }
                <input type="checkbox" id="rsvpNeeded" ref={rsvpNeededRef} checked={rsvpNeeded} onChange={handleRSVP} />
                <label htmlFor="rsvpNeeded">RSVP needed</label>
            </div>
            {rsvpNeeded ?
                <div>
                    <label htmlFor="rsvpDate">Require RSVPs by*:</label>
                    {rsvpDateErrMsg ? 
                        <div className="error-msg">
                            <p>{rsvpDateErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="date" id="rsvpDate" ref={rsvpDateRef} value={rsvpDate} min={format(new Date(), "yyyy-MM-dd")} max={format(new Date(eventDate[0]), "yyyy-MM-dd")} onChange={(e) => {setRsvpDate(e.target.value); validateRSVPDate(e.target.value);}} required />
                </div> : null
            }
        </>
    );
};

export default EventDetailsFieldset;
