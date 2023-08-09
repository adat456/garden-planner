export interface gridMapInterface {
    num: string,
    selected: boolean,
    horizontalwalkway: boolean,
    verticalwalkway: boolean,
    customwalkway: boolean,
    plantId: number,
};

export interface permissionsInterface {
    bedid: number,
    creatorid: number,
    fullpermissionsmemberids: number[],
    fullpermissionsroleids: string[],
    memberspermissionmemberids: number[],
    memberspermissionroleids: string[],
    rolespermissionmemberids: number[],
    rolespermissionroleids: string[],
    eventspermissionmemberids: number[],
    eventspermissionroleids: string[],
    tagspermissionmemberids: number[],
    tagspermissionroleids: string[],
    postspermissionmemberids: number[],
    postspermissionroleids: string[],
    postinteractionspermissionmemberids: number[],
    postinteractionspermissionroleids: string[],
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
    status: "pending" | "accepted" ,
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
    address: string,
    coordinates: { latitude: string, longitude: string} | null,
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
};

export interface notificationInterface {
    id: number,
    senderid: number,
    sendername: string,
    senderusername: string,
    recipientid: number,
    dispatched: string,
    read: boolean,
    // "" empty string for has not responded/pending (false), "confirmation" or "rejection" for responded (true)
    responded: "" | "confirmation" | "rejection",
    type: "memberinvite" | "memberconfirmation" | "memberrejection" | "rsvpinvite" | "rsvpconfirmation" | "permissionsupdate" | "postupdate",
    bedid?: number,
    bedname?: string,
    eventid?: string,
    eventname?: string,
    eventdate?: Date[],
    rsvpdate?: Date,
    posttitle?: string,
    postid?: string,
    commentid?: string,
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
    subscribers: number[]
};

export interface commentInterface {
    id: string,
    toppostid: string,
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

export interface taskInterface {
    id: string,
    bedid: number,
    name: string,
    description: string,
    duedate: string,
    completeddates: string[],
    startdate: string,
    enddate: string,
    repeatsevery: string[],
    assignedtomembers: number[],
    assignedtoroles: string[],
    assignedby: number,
    datecreated: string,
    private: boolean,
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