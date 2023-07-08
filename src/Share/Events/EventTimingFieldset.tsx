import Calendar from "react-calendar";

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
};

const EventTimingFieldset: React.FC<eventTimingFieldsetInterface> = function({ eventDate, setEventDate, eventStartTime, setEventStartTime, eventEndTime, setEventEndTime, repeating, setRepeating, repeatEvery, setRepeatEvery, repeatTill, setRepeatTill}) {
    function handleRepeating() {
        if (repeating) {
            setRepeatEvery([]);
            setRepeatTill("");
        };
        setRepeating(!repeating);
    };

    return (
        <fieldset>
            <legend>Time</legend>
            <Calendar value={eventDate} onChange={setEventDate} selectRange={true} allowPartialRange={true} minDate={new Date()} maxDate={new Date(2025, 1, 1)} minDetail="year" showNeighboringMonth={false} nextLabel="month>>" next2Label="year>>" prevLabel="<<month" prev2Label="<<year" />
            <p>{`Start date: ${eventDate[0]}`}</p>
            <p>{`End date: ${eventDate[1]}`}</p>
            <fieldset>
                <legend>Hours</legend>
                <div>
                    <label htmlFor="start-time" className="hidden">Start time</label>
                    <input type="time" id="start-time" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} /> 
                </div> :
                <div>
                    <label htmlFor="end-time" className="hidden">End time</label>
                    <input type="time" id="end-time" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} /> 
                </div>
            </fieldset>
            <div>
                <input type="checkbox" id="eventPublic" checked={repeating} onChange={handleRepeating} />
                <label htmlFor="eventPublic">Repeating event</label>
            </div>
            {repeating ?
                <>
                    <label htmlFor="repeat-every">Repeat every:</label>
                    <select name="repeat-every" id="repeat-every" onChange={(e) => setRepeatEvery(e.target.value)}>
                        <option value="weekly">7 days</option>
                        <option value="biweekly">14 days</option>
                        <option value="monthly">28 days</option>
                    </select>
                    <div>
                        <label htmlFor="repeat-till">Repeat till:</label>
                        <input type="date" id="repeat-till" value={repeatTill} onChange={(e) => setRepeatTill(e.target.value)} />
                    </div>
                </> : null
            }
        </fieldset>
    );
};

export default EventTimingFieldset;