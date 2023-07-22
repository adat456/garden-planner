export interface gridMapInterface {
    num: string,
    selected: boolean,
    horizontalwalkway: boolean,
    verticalwalkway: boolean,
    customwalkway: boolean,
    // walkway: boolean,
    plantId: number,
    plantName: string,
    gridColor: string
};

// the only interface with a string for an id
export interface rolesInterface {
    id: string,
    title: string,
    duties: {
        value: string,
        id: number
    }[],
};

export interface membersInterface {
    id: number,
    username: string,
    name: string,
    // just the role id, not the entire role interface
    role: string,
    invitedate: string,
    status: "pending" | "accepted" | "rejected",
    // status: "pending" | "final",
    finaldate: string | undefined
};

export interface bedDataInterface {
    hardiness: number,
    sunlight: string,
    soil: string[],
    whole: boolean,
    length: number,
    width: number,
    gridmap: gridMapInterface[],
    id: number,
    seedbasket: plantPickDataInterface[],
    name: string,
    public: boolean,
    created: string,
    username: string,
    // an array of user IDs because user should be able to see if they liked it, and can only like once
    numhearts: number[],
    // also an array of user IDs; user can copy multiple times and add their user ID multiple times --> helps to name the number of the copy
    numcopies: number[],
    members: membersInterface[],
    roles: rolesInterface[],
    eventtags: string[]
};

export interface plantDataInterface {
    color: string,
    daystomaturity: number[],
    depth: string,
    description: string[] | string,
    fruitsize: string,
    growconditions: string[],
    growthhabit: string[],
    hardiness: number[],
    heightin: number[],
    id: number,
    lifecycle: string,
    light: string[],
    name: string,
    plantcharac: string[],
    plantingseason: string[],
    sowingmethod: string[],
    spacingin: number[],
    water: string,
    contributor?: string,
    privatedata?: boolean
};

export interface plantPickDataInterface extends plantDataInterface {
    gridcolor: string,
};

export interface userInterface {
    id: number,
    firstname: string,
    lastname: string,
    email: string,
    username: string,
    board_ids: number[],
};

export interface notificationInterface {
    id: number,
    senderid: number,
    sendername: string,
    senderusername: string,
    recipientid: number,
    message: string,
    dispatched: string,
    read: boolean,
    responded: boolean,
    // enum? like "invite"?
    type: "memberinvite" | "memberconfirmation" | "rsvpinvite" | "rsvpconfirmation",
    bedid?: number,
    eventid?: string,
};

export interface eventParticipantInterface {
    id: number,
    username: string,
    name: string,
};

export interface eventInterface {
    id: string,
    bedid: number,
    creatorid: number,
    creatorname: string,
    creatorusername: string,
    eventname: string,
    eventdesc: string,
    eventlocation: string,
    eventpublic: "public" | "allmembers" | "somemembers",
    eventparticipants?: eventParticipantInterface[],
    rsvpneeded: boolean,
    rsvpdate: Date,
    rsvpsreceived: number[],
    eventstarttime: string,
    eventendtime: string,
    eventdate: Date[],
    repeating: boolean,
    // if repeating events are generated, they will have unique ids but the same string repeatid (generated once with the nanoid import in the EventForm component)
    repeatid?: string,
    repeatevery?: "weekly" | "biweekly" | "monthly",
    repeattill?: Date,
    tags: string[],
};

export interface postInterface {
    id: string,
    bedid: number,
    authorid: number,
    authorusername: string,
    authorname: string,
    posted: Date,
    edited: Date,
    title: string,
    content: string,
    likes: number[],
    dislikes: number[],
    pinned: boolean,
};

export interface commentInterface {
    id: string,
    postid: string,
    responseorder: number[],
    authorid: number,
    authorusername: string,
    authorname: string,
    posted: Date,
    edited: Date,
    content: string,
    likes: number[],
    dislikes: number[],
};

export interface commentTreeInterface extends commentInterface {
    level: number;
};

export interface colorObjInterface {
    hex: string,
    hsl: {
        a: number,
        h: number,
        l: number,
        s: number,
    },
    hsv: {
        a: number,
        h: number,
        s: number,
        v: number
    },
    oldHue: number,
    rgb: {
        r: number,
        g: number,
        b: number,
        a: number
    },
    source: string
};