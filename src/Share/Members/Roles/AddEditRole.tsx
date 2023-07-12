import { useState } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { useGetBedsQuery, useUpdateRolesMutation } from "../../../app/apiSlice";
import { bedDataInterface } from "../../../app/interfaces";
import * as React from "react";

interface AddRoleInterface {
    bedid: string | undefined,
    focusRole?: rolesInterface | null,
    setFocusRole: React.Dispatch<React.SetStateAction<rolesInterface | null>>,
    setAddEditRoleVis: React.Dispatch<React.SetStateAction<boolean>>
};

const AddEditRole: React.FC<AddRoleInterface> = function({ bedid, focusRole, setFocusRole, setAddEditRoleVis }) {
    const [ title, setTitle ] = useState(focusRole?.title || "");
    const [ counter, setCounter ] = useState(focusRole?.duties.length || 2);
    const [ duties, setDuties ] = useState<{
        value: string,
        id: number,
    }[]>(focusRole?.duties ? 
        JSON.parse(JSON.stringify(focusRole?.duties)) : 
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
    const bed = bedObject.bed as bedDataInterface;
    const existingRoles = bed?.roles;

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

    async function handleAddRole(e: React.FormEvent) {
        e.preventDefault();

        if (title && !isLoading && existingRoles) {
            try {
                await updateRoles({
                    // necessary to generate a string id here (rather than allowing postgresql to generate a serial number id) because it will be added as JSON object to a single column
                    roles: [...existingRoles, { id: nanoid(), title, duties }],
                    bedid 
                }).unwrap();

                handleCloseForm();
            } catch(err) {
                console.error("Unable to add role: ", err.message);
            };
        };
    };

    async function handleEditRole(e: React.FormEvent) {
        e.preventDefault();

        if (title && !isLoading && existingRoles) {
            try {
                let updatedRoles = existingRoles.filter(existingRole => existingRole.id !== focusRole?.id);
                updatedRoles.push({ id: focusRole?.id, title, duties });

                await updateRoles({
                    roles: updatedRoles,
                    bedid 
                }).unwrap();

                handleCloseForm();
            } catch(err) {
                console.error("Unable to edit role: ", err.message);
            };
        };
    };

    function handleCloseForm() {
        const addEditRoleForm: HTMLDialogElement | null = document.querySelector(".add-edit-role-form");
        addEditRoleForm?.close();

        setAddEditRoleVis(false);
        setFocusRole(null);
    };

    return (
        <dialog className="add-edit-role-form">
            <form method="POST" onSubmit={focusRole ? handleEditRole : handleAddRole}>
                <div>
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <fieldset>
                    <legend>Duties</legend>
                    {generateDutiesInputs()}
                    <button type="button" onClick={addDuties}>Add duty</button>
                </fieldset>
                <button type="submit">{focusRole ? "Submit edits" : "Create new role"}</button>
                <button type="button" onClick={handleCloseForm}>Close</button>
            </form>
        </dialog>
    );
};

export default AddEditRole;
