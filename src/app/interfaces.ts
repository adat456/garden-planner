export interface gridMapInterface {
    num: string,
    selected: boolean,
    walkway: boolean,
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
    role: rolesInterface | undefined,
    invitedate: string,
    status: "pending" | "final",
    finaldate: string | undefined
};

export interface bedDataInterface {
    hardiness: number,
    sunlight: string,
    soil: string[],
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
    roles: rolesInterface[]
};

export interface plantDataInterface {
    color: string,
    daystomaturity: string[],
    depth: string,
    description: string[] | string,
    fruitsize: string,
    // refers to tolerances, e.g., cold tolerant
    growconditions: string[],
    // refers to appearance, e.g., compact, climbing
    growthhabit: string[],
    hardiness: string[],
    heightin: string[],
    id: number,
    lifecycle: string,
    light: string[],
    name: string,
    plantcharac: string[],
    plantingseason: string[],
    sowingmethod: string[],
    spacingin: string[],
    water: string,
    contributor?: string;
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
    recipientid: number,
    message: string,
    dispatched: string,
    acknowledged: string | undefined,
    // enum? like "invite"?
    type: string
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