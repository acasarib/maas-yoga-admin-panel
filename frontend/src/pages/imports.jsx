import React, { useEffect, useState} from "react";
import ViewSlider from 'react-view-slider'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PaidIcon from '@mui/icons-material/Paid';
import SchoolIcon from '@mui/icons-material/School';
import ImportStudents from "../components/section/imports/students";
import ImportSubscriptionClasses from "../components/section/imports/subscriptionClasses";
import ImportDischarges from "../components/section/imports/discharges";

export default function Imports() {
    const [activeView, setActiveView] = useState(0);
    const [activeImport, setActiveImport] = useState("");

    const ImportItem = ({ icon, children, item, disabled = false }) => (
    <div onClick={() => !disabled && setActiveImport(item)}>
        <span className={`justify-center ${disabled ? "bg-gray-200" : "bg-orange-50 hover:bg-orange-100 cursor-pointer"} text-yellow-900 shadow-lg flex items-center rounded-xl font-bold text-sm py-4 px-4`}>
            {icon}<span className="ml-3">{children}</span>
        </span>
    </div>);

    useEffect(() => {
        setActiveView((activeImport === "") ? 0 : 1);
    }, [activeImport]);

    const onCancelImport = () => setActiveImport("");

    const renderView = ({ index, active, transitionState }) => (
        <>
        {index === 0 &&
            <Menu/>
        }
        {index === 1 && 
            (<>
            {activeImport === "students" && <ImportStudents onCancel={onCancelImport}/>}
            {activeImport === "subscriptionClasses" && <ImportSubscriptionClasses onCancel={onCancelImport}/>}
            {activeImport === "discharges" && <ImportDischarges onCancel={onCancelImport}/>}
            </>)
        }</>
    )

    const Menu = () => (<>
        <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Importar datos</h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <ImportItem item="students" icon={<SchoolIcon/>}>Alumnos</ImportItem>
            <ImportItem item="subscriptionClasses" icon={<PaidIcon/>}>Abono de clases</ImportItem>
            <ImportItem item="discharges" icon={<PaidIcon/>}>Gastos</ImportItem>
            <ImportItem item="courses" disabled icon={<LocalLibraryIcon/>}>Cursos</ImportItem>
        </div>
    </>);
    

    return(
        <>
        <div className="px-6 py-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                <ViewSlider
                    renderView={renderView}
                    numViews={2}
                    activeView={activeView}
                    animateHeight
                    style={{ overflow: 'auto', padding: '4px'}}
                />
            </div>
        </div>
        </>
    );
} 