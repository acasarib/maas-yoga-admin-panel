import React, { useState } from "react";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import styles from "./searchBar.module.css";
import ButtonPrimary from "../button/primary";

    export default function SearchBar({ className = "", searchableColumns, searchValue, onChangeSearch, typeValue, onChangeType }) {
    const [valueToSearch, setValueToSearch] = useState('');

    const confirmSearch = () => {
        onChangeSearch(valueToSearch);
    }

    return(
        <>
        <div>
            <FormControl className={styles.searchBarInput}>
                <InputLabel htmlFor="outlined-adornment-amount">Buscar</InputLabel>
                <OutlinedInput
                    id="search-bar-table"
                    size="small"
                    startAdornment={<InputAdornment position="start"><SearchIcon/></InputAdornment>}
                    label="Buscar"
                    onChange={(e) => setValueToSearch(e.target.value)}
                />
            </FormControl>
            <TextField
                className={styles.searchBarType}
                id="search-bar-type"
                select
                label="Buscar por"
                value={typeValue}
                onChange={(e) => onChangeType(e.target.value)}
                size="small"
            >
            {searchableColumns.map(column => (
                <MenuItem key={column.name} value={column.name}>
                    {column.name}
                </MenuItem>
            ))}
            </TextField>
        </div>
        <ButtonPrimary onClick={() => confirmSearch()} className="mt-2">Buscar <SearchIcon className="ml-1"/></ButtonPrimary>
    </>);
} 