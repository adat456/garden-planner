import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bedDataInterface, gridMapInterface } from "../../app/interfaces";
import { useCreateBedMutation, useUpdateBedMutation, useDeleteBedMutation } from "../../app/apiSlice";
import { useGetBedData, useWrapRTKMutation, useGetCoordinates, useGetAutocompletedAddress } from "../../app/customHooks";
import BedGridForm from './BedGridForm';
import BedSpecsForm from './BedSpecsForm';
import * as React from "react";

const BedCreationPage: React.FC = function() {
    const { bedid } = useParams();
    const bed = useGetBedData(Number(bedid)) as bedDataInterface;

    const [name, setName] = useState(bed?.name || "");
    const [length, setLength] = useState(bed?.length || 10);
    const [width, setWidth] = useState(bed?.width || 10);
    const [whole, setWhole] = useState(bed?.whole || true);
    // first value will always be 0
    const [hardiness, setHardiness] = useState([0, bed?.hardiness] || [0, 5]);
    const [sunlight, setSunlight] = useState(bed?.sunlight || "");
    const [soil, setSoil] = useState<string[]>(bed?.soil || []);
    const [publicBoard, setPublicBoard] = useState(bed?.public || false);

    const { coordinates, pullCoordinates, resetCoordinates } = useGetCoordinates(bed?.coordinates || null);
    const { address, setAddress, pullAutocompletedAddresses, generateAutocompletedAddresses } = useGetAutocompletedAddress(bed?.address || "");

    const [ nameErrMsg, setNameErrMsg ] = useState("");

    const  { mutation: createBed, isLoading: createBedIsLoading } = useWrapRTKMutation(useCreateBedMutation);
    const { mutation: updateBed, isLoading: updateBedIsLoading } = useWrapRTKMutation(useUpdateBedMutation);
    const { mutation: deleteBed, isLoading: deleteBedIsLoading } = useWrapRTKMutation(useDeleteBedMutation);
    const navigate = useNavigate();

    function generateGridmap() {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        let gridmap: gridMapInterface[] = [];
        gridmap = allCells.map(cell => {
            const cellDesc: gridMapInterface = {
                num: cell.getAttribute("id")?.slice(5),
                selected: cell.classList.contains("selected"),
                horizontalwalkway: cell.classList.contains("horizontal-walkway"),
                verticalwalkway: cell.classList.contains("vertical-walkway"),
                customwalkway: cell.classList.contains("custom-walkway"),
                plantId: 0,
                plantName: "",
            };
            return cellDesc;
        });
        return gridmap;
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const gridmap = generateGridmap();

        if (!createBedIsLoading) {
            try {
                await createBed({
                    name, whole, length, width, soil, sunlight, gridmap,
                    public: publicBoard, address, coordinates,
                    created: new Date().toISOString().slice(0, 10), 
                    hardiness: hardiness[1]
                }).unwrap();

                navigate("/create");
            } catch(err) {
                console.error("Unable to add bed: ", err.data);
                if (err.data) setNameErrMsg(err.data[0].msg);
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
                        name, whole, length, width, soil, sunlight, gridmap,
                        public: publicBoard, address, coordinates,
                        hardiness: hardiness[1]
                    }
                }).unwrap();

                navigate(`/create/${bedid}`);
            } catch(err) {
                console.error("Unable to update bed: ", err.message);
            };
        };
    };

    async function handleDelete() {
        if (!deleteBedIsLoading) {
            try {
                await deleteBed(bedid).unwrap();

                navigate("/create");
            } catch(err) {
                console.error("Unable to delete bed: ", err.message);
            };
        };
    };
    
    return (
        <form method="post" className="bed-creation-form" onSubmit={bed ? handleEdit : handleSubmit}>
            <BedGridForm name={name} setName={setName} length={length} setLength={setLength} width={width} setWidth={setWidth} whole={whole} setWhole={setWhole} publicBoard={publicBoard} setPublicBoard={setPublicBoard} address={address} setAddress={setAddress} pullAutocompletedAddresses={pullAutocompletedAddresses} generateAutocompletedAddresses={generateAutocompletedAddresses} coordinates={coordinates} pullCoordinates={pullCoordinates} resetCoordinates={resetCoordinates} />
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