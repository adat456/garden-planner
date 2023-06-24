import { useState } from "react";
import { gridMapInterface } from "../Shared/interfaces";
import BedGridForm from './BedGridForm';
import BedSpecsForm from './BedSpecsForm';

const BedCreationPage: React.FC = function() {
    const [length, setLength] = useState(10);
    const [width, setWidth] = useState(10);
    const [whole, setWhole] = useState(true);
    // first value will always be 0
    const [hardiness, setHardiness] = useState([0, 5]);
    const [sunlight, setSunlight] = useState("");
    const [soil, setSoil] = useState<string[]>([]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const allCells = [...document.querySelectorAll(".grid-cell")];
        let gridMap: gridMapInterface[] = [];
        if (whole) {
            gridMap = allCells.map(cell => {
                const cellDesc: gridMapInterface = {
                    num: cell.getAttribute("id")?.slice(5),
                    selected: (!cell.classList.contains("vertical-walkway") && !cell.classList.contains("horizontal-walkway")),
                    walkway: (cell.classList.contains("vertical-walkway") || cell.classList.contains("horizontal-walkway") || cell.classList.contains("custom-walkway")),
                    plantId: 0,
                    plantName: "",
                };
                return cellDesc;
            });
        } else if (!whole) {
            gridMap = allCells.map(cell => {
                const cellDesc: gridMapInterface = {
                    num: cell.getAttribute("id")?.slice(5),
                    selected: cell.classList.contains("selected"),
                    walkway: (cell.classList.contains("vertical-walkway") || cell.classList.contains("horizontal-walkway") || cell.classList.contains("custom-walkway")),
                    plantId: 0,
                    plantName: "",
                };
                return cellDesc;
            });
        };

        const reqOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                hardiness: hardiness[1], 
                sunlight, soil,
                length, width, gridMap
            }),
            credentials: "include"
        };

        try {
            const req = await fetch("http://localhost:3000/create-bed", reqOptions);
            const message = await req.json();
            if (req.ok) {
                console.log(message);
            };
        } catch(err) {
            console.log(err.message);
        };
    };
    
    return (
        <form method="post" className="bed-creation-form" onSubmit={handleSubmit}>
            <BedGridForm length={length} setLength={setLength} width={width} setWidth={setWidth} whole={whole} setWhole={setWhole} />
            <BedSpecsForm hardiness={hardiness} setHardiness={setHardiness} sunlight={sunlight} setSunlight={setSunlight} soil={soil} setSoil={setSoil} />
            <button type="submit">Create bed</button>
        </form>
    )
};

export default BedCreationPage;