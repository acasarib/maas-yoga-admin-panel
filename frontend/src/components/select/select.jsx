import React from "react";
import ReactSelect from 'react-select';
import { COLORS } from "../../constants";
const primary = COLORS.primary[500];
export const reactSelectStyles = (userStyles = {}) => ({
    ...userStyles,
    control: (base, state) => ({
        ...((typeof userStyles.control === 'function') ? userStyles.control(base, state) : base),
        backgroundColor: "white",
        borderColor: state.isFocused ? primary : base.borderColor,
        boxShadow: state.isFocused ? `0 0 0 1px ${primary}` : base.boxShadow,
        '&:hover': {
            ...(base['&:hover'] || {}),
            borderColor: state.isFocused ? primary : (base['&:hover']?.borderColor || base.borderColor),
        },
    }),
    option: (base, state) => ({
        ...((typeof userStyles.option === 'function') ? userStyles.option(base, state) : base),
        backgroundColor: state.isFocused ? COLORS.primary[50] : 'white', 
        color: "black",
        
    }),
    dropdownIndicator: (base, state) => ({
        ...((typeof userStyles.dropdownIndicator === 'function') ? userStyles.dropdownIndicator(base, state) : base),
        color: state.isFocused ? primary : base.color,
        '&:hover': { color: primary },
    }),
    clearIndicator: (base, state) => ({
        ...((typeof userStyles.clearIndicator === 'function') ? userStyles.clearIndicator(base, state) : base),
        color: state.isFocused ? primary : base.color,
        '&:hover': { color: primary },
    }),
});

export default function Select(params) {
    const userStyles = params.styles || {};

    const styles = reactSelectStyles(userStyles);

    return <ReactSelect theme={{colors: {primary: COLORS.primary[400]}}} inputId={params.id || params.name} {...params} styles={styles} placeholder={params.placeholder ?? "Seleccionar"} />
}