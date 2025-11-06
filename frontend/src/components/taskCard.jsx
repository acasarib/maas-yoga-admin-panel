import React from "react";
import DeleteButton from "./button/deleteButton";
import EditButton from "./button/editButton";
import VerifyButton from "./button/verifyButton";
import { COLORS } from "../constants";

export default function TaskCard(props) {

    return (
    <div style={{backgroundColor: COLORS.primary[50]}} className="w-full rounded-lg p-4 shadow-md grid grid-cols-6 my-3 transition duration-200 ease-in-out bg-none hover:bg-none transform">
        <div className="col-span-4">
            <div className="text-xl font-medium leading-6 text-gray-900">
                {props.title}
            </div>
            <div className="text-lg font-medium leading-6 text-gray-700" style={{ whiteSpace: 'pre-line' }}>
                {props.description}
            </div>
        </div>
        <div className="col-span-2 flex items-center justify-end flex-row">
            <div className={props.greenCheckEnabled ? "" : "invisible"}>
                <VerifyButton tooltip="Completar" onClick={props.onCompleteClick}/>
            </div>
            <DeleteButton onClick={props.onDeleteClick}/>
            <EditButton onClick={props.onEditClick}/>
        </div>
    </div>
    );
} 