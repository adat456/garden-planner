export interface gridMapInterface {
    num: string,
    selected: boolean,
    walkway: boolean,
    plantId: number,
    plantName: string,
    gridColor: string
};

export interface bedDataInterface {
    hardiness: number,
    sunlight: string,
    soil: string[],
    length: number,
    width: number,
    gridmap: gridMapInterface[],
    id: number,
};

export interface plantDataInterface {
    color: string,
    daystomaturity: string[],
    depth: string,
    description: string[],
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
};

// requirements: water, light, hardiness, growconditions
// planting: plantingseason, sowingmethod, growthhabit, depth, spacingin,  
// yield: daystomaturity, heightin, fruitsize
// additional: lifecycle, plantcharac

export interface plantPickDataInterface extends plantDataInterface {
    gridcolor: string,
};

// filter by: hardiness, lifecycle, water, light, planting season
// sort by: name, daystomaturity, heightin, spacingin,