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
    status: "pending" | "final",
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
    numhearts: number,
    numcopies: number,
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
    // refers to tolerances, e.g., cold tolerant
    growconditions: string[],
    // refers to appearance, e.g., compact, climbing
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
    added_veg_data: number[],
    favorited_beds: number[],
    copied_beds: number[]
};

export interface notificationInterface {
    id: number,
    senderid: number,
    sendername: string,
    senderusername: string,
    recipientid: number,
    message: string,
    dispatched: string,
    acknowledged: boolean,
    // enum? like "invite"?
    type: "invite" | "acceptance" | "rsvpinvite" | "rsvpacceptance",
    bedid?: number,
    eventid?: number
};

export interface eventParticipantInterface {
    id: number,
    username: string,
    name: string,
};

export interface eventInterface {
    id: number,
    bedid: number,
    creatorid: number,
    creatorname: string,
    creatorusername: string,
    eventname: string,
    eventdesc: string,
    eventlocation: string,
    eventpublic: boolean,
    eventparticipants?: eventParticipantInterface[],
    rsvpneeded: boolean,
    rsvpdate: Date,
    rsvpsreceived: number[],
    eventstarttime: string,
    eventendtime: string,
    eventdate: string[],
    repeating: boolean,
    // if repeating events are generated, they will have unique numeric ids (created by SERIAL in postgresql) but the same string repeatid (generated once with the nanoid import in the EventForm component)
    repeatid?: string,
    repeatevery?: "weekly" | "biweekly" | "monthly",
    repeattill?: string,
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