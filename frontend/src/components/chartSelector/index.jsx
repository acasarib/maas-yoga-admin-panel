import { useState } from 'react';
import { COLORS } from '../../constants';

const Item = ({ selected, title, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const bg = selected ? COLORS.primary[600] : (hovered ? COLORS.primary[100] : COLORS.primary[50]);
  const color = selected ? 'white' : undefined;
  return (<>
    <div className="grid place-content-stretch cursor-pointer mb-4" onClick={onSelect}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span style={{ backgroundColor: bg, color }} className={`flex items-center rounded-xl font-bold text-sm px-4 py-3 shadow-lg`}>
          <span className="ml-3">{title}</span>
      </span>
    </div>
  </>);
}

export default function ChartSelector({ allowCustom, allowWeek = true, allowMonth = true, allowYear = true, currentChartSelected, onChange }) {

    return(
        <>
        <div className={`w-full h-full`}>
            {allowYear && <Item selected={currentChartSelected === "year"} title="Anual" onSelect={() => onChange("year")}/>}
            {allowMonth && <Item selected={currentChartSelected === "month"} title="Mensual" onSelect={() => onChange("month")}/>}
            {allowWeek && <Item selected={currentChartSelected === "week"} title="Semanal" onSelect={() => onChange("week")}/>}
            {allowCustom && <Item selected={currentChartSelected === "custom"} title="Personalizado" onSelect={() => onChange("custom")}/>}
        </div>
        </>
    );
} 