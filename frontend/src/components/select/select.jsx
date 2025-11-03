import React from "react";
import ReactSelect from 'react-select';
const ORANGE_500 = '#ff9800';
export const reactSelectStyles = (userStyles = {}) => ({
    ...userStyles,
    control: (base, state) => ({
        ...((typeof userStyles.control === 'function') ? userStyles.control(base, state) : base),
        borderColor: state.isFocused ? ORANGE_500 : base.borderColor,
        boxShadow: state.isFocused ? `0 0 0 1px ${ORANGE_500}` : base.boxShadow,
        '&:hover': {
            ...(base['&:hover'] || {}),
            borderColor: state.isFocused ? ORANGE_500 : (base['&:hover']?.borderColor || base.borderColor),
        },
    }),
    option: (base, state) => ({
        ...((typeof userStyles.option === 'function') ? userStyles.option(base, state) : base),
        backgroundColor: state.isFocused ? '#fff7ed' : base.backgroundColor, // light orange-50
        color: base.color,
    }),
    dropdownIndicator: (base, state) => ({
        ...((typeof userStyles.dropdownIndicator === 'function') ? userStyles.dropdownIndicator(base, state) : base),
        color: state.isFocused ? ORANGE_500 : base.color,
        '&:hover': { color: ORANGE_500 },
    }),
    clearIndicator: (base, state) => ({
        ...((typeof userStyles.clearIndicator === 'function') ? userStyles.clearIndicator(base, state) : base),
        color: state.isFocused ? ORANGE_500 : base.color,
        '&:hover': { color: ORANGE_500 },
    }),
});

export default function Select(params) {
    const userStyles = params.styles || {};

    const styles = reactSelectStyles(userStyles);

    return <ReactSelect inputId={params.id || params.name} {...params} styles={styles} placeholder={params.placeholder ?? "Seleccionar"} />
}