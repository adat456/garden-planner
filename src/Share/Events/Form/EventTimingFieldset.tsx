import { useState, useRef, useEffect } from "react";
import { isEqual, isAfter } from "date-fns";
import Calendar from "react-calendar";
import { format, add } from "date-fns";

interface eventTimingFieldsetInterface {
    eventDate: Date[],
    setEventDate: React.Dispatch<React.SetStateAction<Date[]>>,
    eventStartTime: string,
    setEventStartTime: React.Dispatch<React.SetStateAction<string>>,
    eventEndTime: string,
    setEventEndTime: React.Dispatch<React.SetStateAction<string>>,
    repeating: boolean,
    setRepeating: React.Dispatch<React.SetStateAction<boolean>>,
    repeatEvery: string,
    setRepeatEvery: React.Dispatch<React.SetStateAction<string>>,
    repeatTill: string,
    setRepeatTill: React.Dispatch<React.SetStateAction<string>>,
    submitTrigger: number,
    errMsgs: {field: string, msg: string}[],
};

const EventTimingFieldset: React.FC<eventTimingFieldsetInterface> = function({ eventDate, setEventDate, eventStartTime, setEventStartTime, eventEndTime, setEventEndTime, repeating, setRepeating, repeatEvery, setRepeatEvery, repeatTill, setRepeatTill, submitTrigger, errMsgs}) {
    const [ eventDateErrMsg, setEventDateErrMsg ] = useState("");
    const [ eventStartTimeErrMsg, setEventStartTimeErrMsg ] = useState("");
    const [ eventEndTimeErrMsg, setEventEndTimeErrMsg ] = useState("");
    const [ repeatingErrMsg, setRepeatingErrMsg ] = useState("");
    const [ repeatEveryErrMsg, setRepeatEveryErrMsg ] = useState("");
    const [ repeatTillErrMsg, setRepeatTillErrMsg ] = useState("");

    const eventStartTimeRef = useRef<HTMLInputElement>(null);
    const eventEndTimeRef = useRef<HTMLInputElement>(null);
    const repeatingRef = useRef<HTMLInputElement>(null);
    const repeatEveryRef = useRef<HTMLInputElement>(null);
    const repeatTillRef = useRef<HTMLInputElement>(null);

    const previousTriggerValue = useRef(submitTrigger);

    function handleRepeating() {
        if (repeating) {
            setRepeatEvery([]);
            setRepeatTill("");
        };
        setRepeating(!repeating);
    };

    /// VALIDATION ///
    function validateEventDates() {
        let errMsgs = "";
        // validate that start date is on/after today
        if (eventDate[0]) {
            const today = format(new Date(), "yyyy-MM-dd");
            const startDate = format(new Date(eventDate[0]), "yyyy-MM-dd");
            if (today > startDate) {
                errMsgs += "The event start date must be the same date as or take place after today. "
            };
        } else {
            errMsgs = "Specify an event start date.";
        };
        // validate that end date is on/after start date
        if (eventDate[1]) {
            const startDate = new Date(eventDate[0]);
            const endDate = new Date(eventDate[1]);
            if (isAfter(startDate, endDate)) {
                errMsgs += "The event end date must be the same date as or take place after the event start date.";
            };
        };
        setEventDateErrMsg(errMsgs);
    };
    useEffect(() => {
        validateEventDates();
    }, [eventDate])
    

    function validateEventStartTime(eventStartTime: string) {
        if (!eventStartTime) {
            setEventStartTimeErrMsg("Specify a start time.");
        } else {
            setEventStartTimeErrMsg("");
        };
    };
    function validateEventEndTime(eventEndTime: string) {
        if (!eventEndTime) {
            setEventEndTimeErrMsg("Specify an end time.");
        } else {
            if (eventStartTime && eventStartTime > eventEndTime) {
                setEventEndTimeErrMsg("Select an event end time that takes place after the event start time.");
            } else if (eventStartTime < eventEndTime) {
                setEventEndTimeErrMsg("");
            };
        };
    };

    function validateRepeatEvery() {
        if (!repeating) setRepeatEveryErrMsg("");
        if (repeating && (repeatEvery === "weekly" || repeatEvery === "biweekly" || repeatEvery === "monthly")) {
            setRepeatEveryErrMsg("");
        } else {
            setRepeatEveryErrMsg("Select a repeat interval.");
        };
    };
    function validateRepeatTill() {
        if (repeating && !repeatTill) {
            setRepeatTillErrMsg("Select a repeat till date.");
        } else if (repeating && repeatTill) {
            const minDate = format(add(new Date(eventDate[0]), {days: repeatEvery === "weekly" ? 7 : repeatEvery === "biweekly" ? 14 : repeatEvery === "monthly" ? 28 : 1}), 'yyyy-MM-dd')
            const maxDate = format(add(new Date(eventDate[0]), {days: 365}), 'yyyy-MM-dd');
            if (repeatTill >= minDate && repeatTill <= maxDate) {
                setRepeatTillErrMsg("");
            } else {
                console.log(minDate, maxDate, repeatTill)
                setRepeatTillErrMsg("Select a repeat till date that falls between one time interval out from the start date and one year out from the start date.");
            };
        };
    };
    useEffect(() => {
        validateRepeatEvery();
        validateRepeatTill();
    }, [repeatEvery, repeatTill]);

    // repeat/final validation triggered upon attempt to submit (passed in from parent EventForm)
    useEffect(() => {
        if (submitTrigger > previousTriggerValue.current) {
            validateEventDates();
            validateEventStartTime(eventStartTime);
            validateEventEndTime(eventEndTime);
            validateRepeatEvery();
            validateRepeatTill();
        };
    }, [submitTrigger]);

    // setting error messages with error data passed in by parent EventForm
    useEffect(() => {
        if (errMsgs?.length > 0) {
            console.log(errMsgs);
            errMsgs.forEach(error => {
                switch (error.field) {
                    case "eventDate":
                        setEventDateErrMsg(error.msg);
                        return;
                    case "eventStartTime": 
                        setEventStartTimeErrMsg(error.msg);
                        eventStartTimeRef.current?.setCustomValidity(error.msg);
                        return;
                    case "eventEndTime":
                        setEventEndTimeErrMsg(error.msg);
                        eventEndTimeRef.current?.setCustomValidity(error.msg);
                        return;
                    case "repeating": 
                        setRepeatingErrMsg(error.msg);
                        repeatingRef.current?.setCustomValidity(error.msg);
                        return;
                    case "repeatEvery":
                        setRepeatEveryErrMsg(error.msg);
                        repeatEveryRef.current?.setCustomValidity(error.msg);
                        return;
                    case "repeatTill":
                        setRepeatTillErrMsg(error.msg);
                        repeatTillRef.current?.setCustomValidity(error.msg);
                        return;
                };
            });
        };
    }, [errMsgs]);

    return (
        <fieldset>
            <legend>Time*</legend>
            {eventDateErrMsg ? 
                <div className="error-msg">
                    <p>{eventDateErrMsg}</p> 
                </div>
                : null
            }
            <Calendar value={eventDate} onChange={setEventDate} selectRange={true} allowPartialRange={true} minDate={new Date()} maxDate={new Date(2025, 1, 1)} minDetail="year" showNeighboringMonth={false} nextLabel="month>>" next2Label="year>>" prevLabel="<<month" prev2Label="<<year" />
            <fieldset>
                <legend>Hours*</legend>
                <div>
                    <label htmlFor="start-time" className="hidden">Start time</label>
                    {eventStartTimeErrMsg ? 
                        <div className="error-msg">
                            <p>{eventStartTimeErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="time" id="start-time" value={eventStartTime} onChange={(e) => {setEventStartTime(e.target.value); validateEventStartTime(e.target.value);}} required /> 
                </div> :
                <div>
                    <label htmlFor="end-time" className="hidden">End time</label>
                    {eventEndTimeErrMsg ? 
                        <div className="error-msg">
                            <p>{eventEndTimeErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="time" id="end-time" value={eventEndTime} onChange={(e) => {setEventEndTime(e.target.value); validateEventEndTime(e.target.value);}} required /> 
                </div>
            </fieldset>
            <div>
                {repeatingErrMsg ? 
                    <div className="error-msg">
                        <p>{repeatingErrMsg}</p> 
                    </div>
                    : null
                }
                <input type="checkbox" id="eventPublic" checked={repeating} onChange={handleRepeating} />
                <label htmlFor="eventPublic">Repeating event</label>
            </div>
            {repeating ?
                <>
                    <label htmlFor="repeat-every">Repeat every*:</label>
                    {repeatEveryErrMsg ? 
                        <div className="error-msg">
                            <p>{repeatEveryErrMsg}</p> 
                        </div>
                        : null
                    }
                    <select name="repeat-every" id="repeat-every" defaultValue={repeatEvery} onChange={(e) => setRepeatEvery(e.target.value)} required>
                        <option value=""></option>
                        <option value="weekly">7 days</option>
                        <option value="biweekly">14 days</option>
                        <option value="monthly">28 days</option>
                    </select>
                    <div>
                        <label htmlFor="repeat-till">Repeat till*:</label>
                        {repeatTillErrMsg ? 
                            <div className="error-msg">
                                <p>{repeatTillErrMsg}</p> 
                            </div>
                            : null
                        }
                        <input type="date" id="repeat-till" min={format(add(new Date(eventDate[0]), {days: repeatEvery === "weekly" ? 7 : repeatEvery === "biweekly" ? 14 : repeatEvery === "monthly" ? 28 : 1}), 'yyyy-MM-dd')} max={format(add(new Date(eventDate[0]), {days: 365}), 'yyyy-MM-dd')} value={repeatTill} onChange={(e) => setRepeatTill(e.target.value)} required />
                    </div>
                </> : null
            }
        </fieldset>
    );
};

export default EventTimingFieldset;