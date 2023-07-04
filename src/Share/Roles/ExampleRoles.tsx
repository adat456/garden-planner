const roles = [
    {
        title: "Co-leader",
        duties: [
            "Serve as a primary contact and oversee all meetings",
            "Identify the direction and goals of the garden",
            "Compose the guidelines and rules for participation"
        ]
    },
    {
        title: "Plot coordinator",
        duties: [
            "Receive and process member applications",
            "Assign gardening plots and monitor plot maintenance",
            "Maintain database of member contact information"
        ]
    },
    {
        title: "Grounds crew member",
        duties: [
            "Maintain shared tools and equipment",
            "Mow grass and clear pathways",
            "Remove litter and other offage"
        ]
    },
    {
        title: "Supply crew member",
        duties: [
            "Keep tabs on shared materials (i.e., compost, mulch)",
            "Source and coordinate purchasing of material"
        ]
    },
    {
        title: "Events/outreach coordinator",
        duties: [
            "Organize ongoing garden events, such as workdays",
            "Facilitate educational workshops",
            "Recruit members and sponsors"
        ]
    },
    {
        title: "Communications crew member",
        duties: [
            "Assemble welcome packets",
            "Maintain community garden blog and forum",
            "Send electronic updates to memebers"
        ]
    },
    {
        title: "Horticulture advisor",
        duties: [
            "Share gardening expertise with other members",
            "Oversee the progressive growth of the garden",
            "Inspect plots for disease and/or pests"
        ]
    },
    {
        title: "Community member",
        duties: [
            "Maintain assigned plot throughout the season",
            "Assist with start- and end-of-season preparations",
            "Promote garden and attend events when possible"
        ]
    }
];

const ExampleRoles: React.FC = function() {
    function generateRoles() {
        const rolesArr = roles.map((role, index) => (
            <button key={`example-role-${index}`}>
                <p>{role.title}</p>
                <ul>
                    {role.duties.map((duty, index) => (
                        <li key={`example-duty-${index}`}>{duty}</li>
                    ))}
                </ul>
            </button>
        ));
        return rolesArr;
    };

    return (
        <>
            {generateRoles()}
        </>
    );
};

export default ExampleRoles;