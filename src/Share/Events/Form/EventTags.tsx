import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetBedsQuery, useDeleteTagMutation } from "../../../app/apiSlice";
import { bedDataInterface, eventInterface } from "../../../app/interfaces";

interface eventTagsInterface {
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
    currentEvent: eventInterface
};

const EventTags: React.FC<eventTagsInterface> = function({ tags, setTags, currentEvent }) {
    const [ newTag, setNewTag ] = useState("");
    const [ errMessage, setErrMessage ] = useState("");

    const { bedid } = useParams();
    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;

    const [ deleteTag, { isLoading } ] = useDeleteTagMutation();

    function generateAddedTags() {
        const tagsArr = tags?.map(tag => (
            <button type="button" key={`event-${currentEvent?.id}-${tag}`} onClick={() => setTags(tags.filter(existingTag => existingTag !== tag))}>{`- ${tag}`}</button>
        ));
        return tagsArr;
    };

    function generateTagOptions() {
        const tagsArr = bed?.eventtags?.map(tag => {
            if (tags.includes(tag)) {
                return null;
            } else {
                return (
                    <div key={`event-${currentEvent?.id}-${tag}`}>
                        <button type="button" onClick={() => setTags([...tags, tag])}>+</button>
                        <p>{tag}</p>
                        <button type="button" onClick={() => handleDeleteTag(tag)}>Delete</button>
                    </div>
                );
            };  
        });
        return tagsArr;
    };

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setNewTag(e.target.value);
        if (errMessage) setErrMessage("");
    };

    function handleAddNewTag() {
        const cleanedNewTag = newTag.trim().toLowerCase();
        if (bed?.eventtags?.includes(cleanedNewTag) || tags.includes(cleanedNewTag)) {
            setErrMessage("Cannot create a tag with the same name.");
        } else {
            setTags([...tags, newTag.trim().toLowerCase()]);
            setNewTag("");
        };
    };

    async function handleDeleteTag(tag: string) {
        if (!isLoading) {
            try {
                await deleteTag({
                    bedid,
                    body: { tag }
                }).unwrap;
            } catch(err) {
                console.error("Unable to delete tag: ", err.message);
            };
        };
    };

    return (
        <div>
            {generateAddedTags()}
            <p>{errMessage}</p>
            <div>
                <label htmlFor="new-tag">Create new tag</label>
                <input type="text" id="new-tag" maxLength={15} value={newTag} onChange={handleChange} />
                <button type="button" onClick={handleAddNewTag}>Add</button>
            </div>
            {generateTagOptions()}
        </div>
    )
};

export default EventTags;