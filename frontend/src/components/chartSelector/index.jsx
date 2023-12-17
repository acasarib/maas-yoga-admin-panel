const Item = ({ selected, title, onSelect }) => (<>
<div className="grid place-content-stretch cursor-pointer mb-4" onClick={onSelect}>
    <span className={`${selected ? "bg-amber-600 text-white " : "bg-orange-50 text-yellow-900  hover:bg-orange-100"} flex items-center rounded-xl font-bold text-sm px-4 py-3 shadow-lg`}>
        <span className="ml-3">{title}</span>
    </span>
</div>
</>);

export default function ChartSelector({ allowCustom, currentChartSelected, onChange }) {

    return(
        <>
        <div className={`w-full h-full`}>
            <Item selected={currentChartSelected === "year"} title="Anual" onSelect={() => onChange("year")}/>
            <Item selected={currentChartSelected === "month"} title="Mensual" onSelect={() => onChange("month")}/>
            <Item selected={currentChartSelected === "week"} title="Semanal" onSelect={() => onChange("week")}/>
            {allowCustom && <Item selected={currentChartSelected === "custom"} title="Personalizado" onSelect={() => onChange("custom")}/>}
        </div>
        </>
    );
} 