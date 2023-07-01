import { useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { updateRoles } from "../../app/features/bedsSlice";

interface AddRoleInterface {
    bedid: string,
};

const AddRole: React.FC<AddRoleInterface> = function({ bedid }) {
    const [ title, setTitle ] = useState("");
    const [ counter, setCounter ] = useState(2);
    const [ duties, setDuties ] = useState<{
        value: string,
        id: number,
    }[]>([
        { value: "", id: 0 },
        { value: "", id: 1 }
    ]);
    const [ addRoleStatus, setAddRoleStatus ] = useState("idle");

    const dispatch = useAppDispatch();

    function generateDutiesInputs() {
        const dutiesInputs = duties.map(duty => (
            <div key={`duty-${duty.id}`}>
                <button type="button" onClick={() => removeDuties(duty.id)}>X</button>
                <div>
                    <label htmlFor={`duty-${duty.id}`}></label>
                    <input type="text" id={`duty-${duty.id}`} data-id={duty.id} value={duty.value} onChange={handleDutiesChange} />
                </div>
            </div>
        ));
        return dutiesInputs;
    };

    function addDuties() {
        setDuties([
            ...duties,
            { value: "", id: counter }
        ]);
        setCounter(counter + 1);
    };

    function handleDutiesChange(e: React.FormEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;
        const value = input.value;
        const dutyId = Number(input.getAttribute("data-id"));

        const dutiesCopy = [...duties];
        dutiesCopy.forEach(duty => {
            if (duty.id === dutyId) duty.value = value;
        });
        setDuties(dutiesCopy);
    };

    function removeDuties(dutyId: number) {
        setDuties(duties.filter(duty => duty.id !== dutyId));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (title && addRoleStatus === "idle") {
            try {
                const numericBedId = Number(bedid);
                setAddRoleStatus("pending");
                await dispatch(updateRoles({
                    role: {
                        title, 
                        duties
                    },
                    bedid: numericBedId 
                })).unwrap();
            } catch(err) {
                console.error("Unable to add role: ", err.message);
            } finally {
                setAddRoleStatus("idle");
            }
        };
    }

    return (
        <form method="POST" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Title</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <fieldset>
                <legend>Duties</legend>
                {generateDutiesInputs()}
                <button type="button" onClick={addDuties}>Add duty</button>
            </fieldset>
        </form>
    );
};

export default AddRole;
