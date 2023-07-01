import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { addBed } from "../../app/features/bedsSlice";
import { gridMapInterface } from "../../app/interfaces";
import BedGridForm from './BedGridForm';
import BedSpecsForm from './BedSpecsForm';

const BedCreationPage: React.FC = function() {
    const [name, setName] = useState("");
    const [length, setLength] = useState(10);
    const [width, setWidth] = useState(10);
    const [whole, setWhole] = useState(true);
    // first value will always be 0
    const [hardiness, setHardiness] = useState([0, 5]);
    const [sunlight, setSunlight] = useState("");
    const [soil, setSoil] = useState<string[]>([]);
    const [publicBoard, setPublicBoard] = useState(false);

    const [ addBedStatus, setAddBedStatus ] = useState("idle");

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const allCells = [...document.querySelectorAll(".grid-cell")];
        let gridmap: gridMapInterface[] = [];
        if (whole) {
            gridmap = allCells.map(cell => {
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
            gridmap = allCells.map(cell => {
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

        if (addBedStatus === "idle") {
            try {
                setAddBedStatus("pending");
                await dispatch(addBed(
                    {
                        name, publicBoard, length, width, soil, sunlight, gridmap, 
                        hardiness: hardiness[1]
                    }
                )).unwrap();
            } catch(err) {
                console.error("Unable to add bed: ", err.message);
            } finally {
                setAddBedStatus("idle");
                navigate("/create");
            };
        };
    };
    
    return (
        <form method="post" className="bed-creation-form" onSubmit={handleSubmit}>
            <BedGridForm name={name} setName={setName} length={length} setLength={setLength} width={width} setWidth={setWidth} whole={whole} setWhole={setWhole} publicBoard={publicBoard} setPublicBoard={setPublicBoard} />
            <BedSpecsForm hardiness={hardiness} setHardiness={setHardiness} sunlight={sunlight} setSunlight={setSunlight} soil={soil} setSoil={setSoil}  />
            <button type="submit">Create bed</button>
        </form>
    )
};

export default BedCreationPage;