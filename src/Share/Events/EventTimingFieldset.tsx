interface eventTimingFieldsetInterface {
    eventDateStart: string,
    setEventDateStart: React.Dispatch<React.SetStateAction<string>>,
    eventDateEnd: string,
    setEventDateEnd: React.Dispatch<React.SetStateAction<string>>,
    eventTimeStart: string,
    setEventTimeStart: React.Dispatch<React.SetStateAction<string>>,
    eventTimeEnd: string,
    setEventTimeEnd: React.Dispatch<React.SetStateAction<string>>,
    repeating: boolean,
    setRepeating: React.Dispatch<React.SetStateAction<boolean>>,
    repeatEvery: string[],
    setRepeatEvery: React.Dispatch<React.SetStateAction<stringp>>,
    repeatingTill: string,
    setRepeatingTill: React.Dispatch<React.SetStateAction<string>>,
};

const EventTimingFieldset: React.FC<eventTimingFieldsetInterface> = function({ eventDateStart, setEventDateStart, eventDateEnd, setEventDateEnd, eventTimeStart, setEventTimeStart, eventTimeEnd, setEventTimeEnd, repeating, setRepeating, repeatEvery, setRepeatEvery, repeatingTill, setRepeatingTill}) {
    return (
        <fieldset>
            <legend>Time</legend>
        </fieldset>
    );
};

export default EventTimingFieldset;