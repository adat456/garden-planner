const roles = [
    {
        id: "Rw2JAoVu2uZLqToYMdHBT",
        title: "Co-leader",
        duties: [
            { id: 0, value: "Serve as a primary contact and oversee all meetings" },
            { id: 1, value: "Identify the direction and goals of the garden" },
            { id: 2, value: "Compose the guidelines and rules for participation" },
        ]
    },
    {
        id: "_tJvrgZisiUyTPyvt3dwX",
        title: "Plot coordinator",
        duties: [
            { id: 0, value: "Receive and process member applications" },
            { id: 1, value: "Assign gardening plots and monitor plot maintenance" },
            { id: 2, value: "Maintain database of member contact information" },
        ]
    },
    {
        id: "z7z5OxFCaRW9ojaTtqlVa",
        title: "Grounds crew member",
        duties: [
            { id: 0, value: "Maintain shared tools and equipment" },
            { id: 1, value: "Mow grass and clear pathways" },
            { id: 2, value: "Remove litter and other offage" },
        ]
    },
    {
        id: "PoxHzwnNJTPJl1n6QYMhQ",
        title: "Supply crew member",
        duties: [
            { id: 0, value: "Keep tabs on shared materials (i.e., compost, mulch)" },
            { id: 1, value: "Source and coordinate purchasing of material" },
        ]
    },
    {
        id: "t2qarCoVHjRVFAsZ-Zgkv",
        title: "Events/outreach coordinator",
        duties: [
            { id: 0, value: "Organize ongoing garden events, such as workdays" },
            { id: 1, value: "Facilitate educational workshops" },
            { id: 2, value: "Recruit members and sponsors" },
        ]
    },
    {
        id: "MYU6ISqeL2I6aVxVzNdM9",
        title: "Communications crew member",
        duties: [
            { id: 0, value: "Assemble welcome packets" },
            { id: 1, value: "Maintain community garden blog and forum" },
            { id: 2, value: "Send electronic updates to memebers" },
        ]
    },
    {
        id: "NThOCTf3E_Lh4PmQtgetL",
        title: "Horticulture advisor",
        duties: [
            { id: 0, value: "Share gardening expertise with other members" },
            { id: 1, value: "Oversee the progressive growth of the garden" },
            { id: 2, value: "Inspect plots for disease and/or pests" },
        ]
    },
    {
        id: "H3TAT-suQlGyjidZ6CTsp",
        title: "Community member",
        duties: [
            { id: 0, value: "Maintain assigned plot throughout the season" },
            { id: 1, value: "Assist with start- and end-of-season preparations" },
            { id: 2, value: "Promote garden and attend events when possible" },
        ]
    }
];

import { useUpdateRolesMutation, useGetBedsQuery } from "../../../app/apiSlice";
import { useParams } from "react-router-dom";
import { rolesInterface } from "../../../app/interfaces";
import { nanoid } from "@reduxjs/toolkit";

const ExampleRoles: React.FC = function() {
    let { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const existingRoles = bedObject.bed?.roles as rolesInterface[];

    const [ updateRoles, { isLoading }] = useUpdateRolesMutation();

    function generateExampleRoles() {
        const rolesArr = roles.map(role => (
            <li key={`example-role-${role.id}`}>
                <button type="button" onClick={() => addExampleRole(role)}>Add to bed roles</button>
                <p>{role.title}</p>
                <ul>
                    {role.duties.map(duty => (
                        <li key={`example-duty-${duty.id}`}>{duty.value}</li>
                    ))}
                </ul>
            </li>
        ));
        return rolesArr;
    };

    async function addExampleRole(role: rolesInterface) {
        if (!isLoading) {
            try {
                await updateRoles({
                    bedid,
                    roles: [
                        ...existingRoles,
                        {
                            ...role,
                            // give the added role a different nanoid, so that multiple copies of an example role can be added and messing with one copy won't affect the others
                            id: nanoid(),
                        }
                    ]
                }).unwrap;
            } catch(err) {
                console.error("Unable to add example role: ", err.message);
            };
        };
    };

    return (
        <ul>
            {generateExampleRoles()}
        </ul>
    );
};

export default ExampleRoles;