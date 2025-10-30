import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import styles from "./searchBar.module.css";
import Loader from "../spinner/loader";
import ButtonPrimary from "../button/primary";

    export default function SearchBar({ className = "", searchableColumns, searchValue, onChangeSearch, typeValue, onChangeType, isLoading = false }) {
    const [valueToSearch, setValueToSearch] = useState('');

    const confirmSearch = () => {
        onChangeSearch(valueToSearch);
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            confirmSearch();
        }
    }

    return(
        <div className={`${styles.searchBarContainer} ${className}`}>
            <div className={styles.integratedSearchBar}>
                <div className={styles.searchInputSection}>
                    <div className={styles.searchIconContainer}>
                        {isLoading ? (
                            <Loader className={styles.searchLoader} />
                        ) : (
                            <SearchIcon className={styles.searchIcon} />
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={valueToSearch}
                        onChange={(e) => setValueToSearch(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className={styles.searchInput}
                    />
                </div>
                
                <div className={styles.searchTypeSection}>
                    <select
                        value={typeValue}
                        onChange={(e) => onChangeType(e.target.value)}
                        className={styles.searchTypeSelect}
                    >
                        {searchableColumns.map(column => (
                            <option key={column.name} value={column.name}>
                                {column.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <ButtonPrimary
                    onClick={confirmSearch}
                    className={styles.searchButtonIntegrated}
                    disabled={isLoading}
                >
                    Buscar
                </ButtonPrimary>
            </div>
        </div>
    );
} 