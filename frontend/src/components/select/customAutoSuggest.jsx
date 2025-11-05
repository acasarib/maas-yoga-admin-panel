import React, { useState } from "react";
import Autosuggest from "react-autosuggest";
import { COLORS } from "../../constants";

export default function CustomAutoSuggest({ className, name, value, onChange, placeholder, getSuggestionValue, onSuggestionSelected, ...rest }) {

  const [focused, setFocused] = useState(false);
  const renderSuggestion = (suggestion, { isHighlighted }) => (
    <span
      style={{ backgroundColor: isHighlighted ? COLORS.primary[50] : undefined }}
      className="block p-2 cursor-pointer hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
    >
      {getSuggestionValue(suggestion)}
    </span>
  )

  const handleOnChange = (_, { newValue }) => onChange(newValue)

  const inputProps = {
    placeholder,
    className: `shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none ${className}`,
    style: {
      borderColor: focused ? COLORS.primary[500] : undefined,
      boxShadow: focused ? `0 0 0 1px ${COLORS.primary[500]}` : undefined,
    },
    value,
    onChange: handleOnChange,
    name,
    id: name,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  const handleOnSuggestionSelected = (_, suggestion) => onSuggestionSelected(suggestion.suggestion)

  return(
    <Autosuggest
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      onSuggestionSelected={handleOnSuggestionSelected}
      theme={{
        container: "relative",
        suggestionsContainer: "absolute z-10 w-full bg-white shadow-md rounded-lg",
        suggestionsList: "list-none p-0 m-0",
        suggestion: "p-2 cursor-pointer hover:bg-gray-100 text-gray-700 rounded-md",
        suggestionHighlighted: "",
      }}
      {...rest}
    />
  );
} 