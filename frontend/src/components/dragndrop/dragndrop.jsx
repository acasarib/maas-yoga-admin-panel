import React, { useMemo } from "react";
import { useDropzone } from 'react-dropzone'

export default function DragNDrop(props) {
    const onDropAccepted = (files) => {
        if (props.multiple)
            props.onDropAccepted(files);
        else
            props.onDropAccepted(files[0]);
    }

    const {
        acceptedFiles,
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        accept: props.acceptedFiles,
        onDropAccepted: onDropAccepted,
    });
    
    const style = useMemo(() => {
        const baseStyle = {
            flex: 1,
            cursor: "pointer",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            borderWidth: 2,
            borderRadius: 2,
            borderColor: '#eeeeee',
            borderStyle: 'dashed',
            backgroundColor: '#fafafa',
            color: '#bdbdbd',
            outline: 'none',
            transition: 'border .24s ease-in-out'
        }

        const focusedStyle = {
            borderColor: '#2196f3'
        };
        
        const acceptStyle = {
            borderColor: '#00e676'
        };
        
        const rejectStyle = {
            borderColor: '#ff1744'
        };
        
        return {
            ...baseStyle,
            ...(isFocused ? focusedStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {})
        }
    }, [
        isFocused,
        isDragAccept,
        isDragReject,
    ]);

    
    return (
        <section className="container">
        <div {...getRootProps({style, className: 'dropzone'})}>
          <input {...getInputProps()} />
          <p>Arrastra y solta el archivo aca, o hace click para elegirlo.</p>
        </div>
      </section>
    )
} 