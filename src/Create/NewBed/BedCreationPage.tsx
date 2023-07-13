import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bedDataInterface, gridMapInterface } from "../../app/interfaces";
import { useGetBedsQuery, useCreateBedMutation, useUpdateBedMutation, useDeleteBedMutation } from "../../app/apiSlice";
import BedGridForm from './BedGridForm';
import BedSpecsForm from './BedSpecsForm';
import * as React from "react";

const BedCreationPage: React.FC = function() {
    const { bedid } = useParams();
    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;

    const [name, setName] = useState(bed?.name || "");
    const [length, setLength] = useState(bed?.length || 10);
    const [width, setWidth] = useState(bed?.width || 10);
    const [whole, setWhole] = useState(true);
    // first value will always be 0
    const [hardiness, setHardiness] = useState([0, bed?.hardiness] || [0, 5]);
    const [sunlight, setSunlight] = useState(bed?.sunlight || "");
    const [soil, setSoil] = useState<string[]>(bed?.soil || []);
    const [publicBoard, setPublicBoard] = useState(bed?.public || false);

    const  [createBed,  { isLoading: createBedIsLoading }] = useCreateBedMutation();
    const [ updateBed, { isLoading: updateBedIsLoading } ] = useUpdateBedMutation();
    const [ deleteBed, { isLoading: deleteBedIsLoading } ] = useDeleteBedMutation();
    const navigate = useNavigate();

    function generateGridmap() {
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
        return gridmap;
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const gridmap = generateGridmap();

        if (!createBedIsLoading) {
            try {
                await createBed({
                    name, length, width, soil, sunlight, gridmap,
                    public: publicBoard,
                    created: new Date(), 
                    hardiness: hardiness[1]
                }).unwrap();
            } catch(err) {
                console.error("Unable to add bed: ", err.message);
            } finally {
                navigate("/create");
            };
        };
    };

    async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const gridmap = generateGridmap();
        
        if (!updateBedIsLoading) {
            try {
                await updateBed({
                    bedid,
                    bed: {
                        name, length, width, soil, sunlight, gridmap,
                        public: publicBoard,
                        hardiness: hardiness[1]
                    }
                }).unwrap();
            } catch(err) {
                console.error("Unable to update bed: ", err.message);
            } finally {
                navigate(`/create/${bedid}`);
            };
        };
    };

    async function handleDelete() {
        if (!deleteBedIsLoading) {
            try {
                await deleteBed(bedid).unwrap();
            } catch(err) {
                console.error("Unable to delete bed: ", err.message);
            } finally {
                navigate("/create");
            };
        };
    };
    
    return (
        <form method="post" className="bed-creation-form" onSubmit={bed ? handleEdit : handleSubmit}>
            <BedGridForm name={name} setName={setName} length={length} setLength={setLength} width={width} setWidth={setWidth} whole={whole} setWhole={setWhole} publicBoard={publicBoard} setPublicBoard={setPublicBoard} />
            <BedSpecsForm hardiness={hardiness} setHardiness={setHardiness} sunlight={sunlight} setSunlight={setSunlight} soil={soil} setSoil={setSoil}  />
            {bed ?
                <div>
                    <button type="submit">Submit edits</button>
                    <button type="button" onClick={handleDelete}>Delete bed</button>
                </div> :
                <button type="submit">Create bed</button>
            }  
        </form>
    )
};

export default BedCreationPage;