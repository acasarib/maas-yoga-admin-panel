import React from "react";

export default function CommonAlert(props) {

    return(
        <>
            <div className={`bg-${props.color}-100 border-l-4 border-${props.color}-500 text-${props.color}-700 p-4`} role="alert">
                <p className="font-bold">{props.title}</p>
                <p>{props.message}</p>
            </div>
        </>
    );
} 