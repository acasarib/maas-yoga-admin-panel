import React from "react";
import Autosuggest from "react-autosuggest";

export default function CustomAutoSuggest({ className, value, onChange, placeholder, getSuggestionValue, onSuggestionSelected, ...rest }) {

  const renderSuggestion = (suggestion) => <span className="block p-2 cursor-pointer hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">{getSuggestionValue(suggestion)}</span>

  const handleOnChange = (_, { newValue }) => onChange(newValue)

  const inputProps = {
    placeholder,
    className: 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ' + className,
    value,
    onChange: handleOnChange,
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
        suggestionHighlighted: "bg-blue-100",
      }}
      {...rest}
    />
  );
} 