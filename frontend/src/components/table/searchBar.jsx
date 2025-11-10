import React, { useState } from 'react';
import ButtonPrimary from '../button/primary';
import SearchIcon from '@mui/icons-material/Search';
import styles from './searchBar.module.css';
import Loader from "../spinner/loader";

export default function SearchBar({ className = "", searchableColumns, searchValue, onChangeSearch, typeValue, onChangeType, isLoading = false }) {
    const [valueToSearch, setValueToSearch] = useState('');

    const confirmSearch = () => {
        onChangeSearch(valueToSearch);
    }

    const handleOnKeyDown = (e) => {
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
                        type="search"
                        name="search"
                        inputMode="search"
                        enterKeyHint="search"
                        placeholder="Buscar..."
                        value={valueToSearch}
                        onChange={(e) => setValueToSearch(e.target.value)}
                        onKeyDown={handleOnKeyDown}
                        className={`${styles.searchInput} search-input text-base`}
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
                    className={`${styles.searchButtonIntegrated} ${styles.searchButton}`}
                    disabled={isLoading}
                >
                    <span className={styles.searchText}>Buscar</span>
                    <span className="sm:hidden">
                        <SearchIcon className={`${styles.searchIcon}`} />
                    </span>
                </ButtonPrimary>
            </div>
        </div>
    );
} 