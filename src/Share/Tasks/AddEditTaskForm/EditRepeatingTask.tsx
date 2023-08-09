interface editRepeatingTaskInterface {
    repeatDays: string[],
    setRepeatDays: React.Dispatch<React.SetStateAction<string[]>>,
    setRepeatInterval: React.Dispatch<React.SetStateAction<string>>
};

const EditRepeatingTask: React.FC<editRepeatingTaskInterface> = function({ repeatDays, setRepeatDays, setRepeatInterval }) {
    function handleRepeatDayChange(day: string) {
        if (repeatDays.includes(day)) {
            setRepeatDays(repeatDays.filter(addedDay => addedDay !== day));
        } else {
            setRepeatDays([...repeatDays, day]);  
        };
    };

    return (
        <fieldset>
            <h2>Repeating</h2>
            <div>
                <label htmlFor="repeatinterval">Repeat</label>
                <select name="repeatinterval" id="repeatinterval" defaultValue="" onChange={(e) => setRepeatInterval(e.target.value)}>
                    <option value=""></option>
                    <option value="every">every</option>
                    <option value="every other">every other</option>
                    <option value="every first">every first</option>
                    <option value="every second">every second</option>
                    <option value="every third">every third</option>
                    <option value="every fourth">every fourth</option>
                </select>
            </div>
            <div>
                <div>
                    <input type="checkbox" id="monday" value="monday" onChange={() => handleRepeatDayChange("monday")}/>
                    <label htmlFor="monday">Monday</label>
                </div>
                <div>
                    <input type="checkbox" id="tuesday" value="tuesday" onChange={() => handleRepeatDayChange("tuesday")}/>
                    <label htmlFor="tuesday">Tuesday</label>
                </div>
                <div>
                    <input type="checkbox" id="wednesday" value="wednesday" onChange={() => handleRepeatDayChange("wednesday")}/>
                    <label htmlFor="wednesday">Wednesday</label>
                </div>
                <div>
                    <input type="checkbox" id="thursday" value="thursday" onChange={() => handleRepeatDayChange("thursday")}/>
                    <label htmlFor="thursday">Thursday</label>
                </div>
                <div>
                    <input type="checkbox" id="friday" value="friday" onChange={() => handleRepeatDayChange("friday")}/>
                    <label htmlFor="friday">Friday</label>
                </div>
                <div>
                    <input type="checkbox" id="saturday" value="saturday" onChange={() => handleRepeatDayChange("saturday")}/>
                    <label htmlFor="saturday">Saturday</label>
                </div>
                <div>
                    <input type="checkbox" id="sunday" value="sunday" onChange={() => handleRepeatDayChange("sunday")}/>
                    <label htmlFor="sunday">Sunday</label>
                </div>
            </div>
        </fieldset>
    )
};  

export default EditRepeatingTask;