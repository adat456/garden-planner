import { useState } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { useGetBedsQuery, useUpdateRolesMutation } from "../../app/apiSlice";
import { rolesInterface } from "../../app/interfaces";
import * as React from "react";

interface AddRoleInterface {
    bedid: string | undefined,
    role?: rolesInterface,
    setEditVis: React.Dispatch<React.SetStateAction<boolean>>
};

const AddEditRole: React.FC<AddRoleInterface> = function({ bedid, role, setEditVis }) {
    const [ title, setTitle ] = useState(role?.title || "");
    const [ counter, setCounter ] = useState(role?.duties.length || 2);
    const [ duties, setDuties ] = useState<{
        value: string,
        id: number,
    }[]>(role?.duties ? 
        JSON.parse(JSON.stringify(role?.duties)) : 
        [
            { value: "", id: 0 },
            { value: "", id: 1 }
        ]
    );

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const existingRoles = bedObject.bed?.roles as rolesInterface[];

    const [ updateRoles, { isLoading }] = useUpdateRolesMutation();

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

    function resetState() {
        setTitle("");
        setCounter(2);
        setDuties([
            { value: "", id: 0 },
            { value: "", id: 1 }
        ]);
    };

    async function handleAddRole(e: React.FormEvent) {
        e.preventDefault();

        if (title && !isLoading && existingRoles) {
            try {
                await updateRoles(
                    {
                        roles: [...existingRoles, { id: nanoid(), title, duties }],
                        bedid 
                    }
                ).unwrap();

                resetState();
            } catch(err) {
                console.error("Unable to add role: ", err.message);
            };
        };
    };

    async function handleEditRole(e: React.FormEvent) {
        e.preventDefault();

        if (title && !isLoading && existingRoles) {
            try {
                let updatedRoles = existingRoles.filter(existingRole => existingRole.id !== role?.id);
                updatedRoles.push({ id: role?.id, title, duties });

                await updateRoles(
                    {
                        roles: updatedRoles,
                        bedid 
                    }
                ).unwrap();

                setEditVis(false);
                resetState();
            } catch(err) {
                console.error("Unable to edit role: ", err.message);
            };
        };
    };

    return (
        <form method="POST" onSubmit={role ? handleEditRole : handleAddRole}>
            <div>
                <label htmlFor="title">Title</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <fieldset>
                <legend>Duties</legend>
                {generateDutiesInputs()}
                <button type="button" onClick={addDuties}>Add duty</button>
            </fieldset>
            <button type="submit">{role ? "Submit edits" : "Create new role"}</button>
        </form>
    );
};

export default AddEditRole;
