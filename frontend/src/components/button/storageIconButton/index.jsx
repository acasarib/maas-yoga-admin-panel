import React from "react";
import styles from "./storageIconButton.module.css";

export default function StorageIconButton({ onClick, children, className, icon, alt }) {
    
    return (
        <button
            onClick={onClick}
            type="button"
            className={`${styles.button} ${className}`}
        >
            <img className={styles.icon} src={icon} alt={alt}/>
            <span>{children}</span>
        </button>
    );
} 