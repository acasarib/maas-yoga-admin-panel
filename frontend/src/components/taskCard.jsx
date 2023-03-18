import React from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';

export default function TaskCard(props) {

    return (
    <div className="w-full rounded-lg p-4 shadow-md bg-orange-50 grid grid-cols-6 my-3 transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-105">
        <div className="col-span-4">
            <div className="text-xl font-medium leading-6 text-gray-900">
                {props.title}
            </div>
            <div className="text-lg font-medium leading-6 text-gray-700">
                    {props.description}
            </div>
        </div>
        <div className="col-span-2 flex items-center justify-end flex-row">
            <button className="rounded-full p-1 bg-red-200 mx-1 hover:bg-red-300" onClick={props.onDeleteClick}><DeleteIcon /></button>
            <button className="rounded-full p-1 bg-orange-200 mx-1 hover:bg-orange-300" onClick={props.onEditClick}><EditIcon /></button>
            <button className="rounded-full p-1 bg-green-300 mx-1 hover:bg-green-400" onClick={props.onCompleteClick}><DoneIcon /></button>
        </div>
    </div>
    );
} 