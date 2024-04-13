import React, { useEffect, useState} from "react";
import ViewSlider from 'react-view-slider'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PaidIcon from '@mui/icons-material/Paid';
import SchoolIcon from '@mui/icons-material/School';
import ImportStudents from "../components/section/imports/students";
import ImportSubscriptionClasses from "../components/section/imports/subscriptionClasses";
import ImportDischarges from "../components/section/imports/discharges";
import Container from "../components/container";
import CardItem from "../components/card/cardItem";

export default function Imports() {
    const [activeView, setActiveView] = useState(0);
    const [activeImport, setActiveImport] = useState("");

    const ImportItem = ({ icon, children, item, disabled = false }) => (
        <CardItem icon={icon} disabled={disabled} onClick={() => !disabled && setActiveImport(item)}>{children}</CardItem>);

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
        <Container disableTitle>
            <ViewSlider
                renderView={renderView}
                numViews={2}
                activeView={activeView}
                animateHeight
                style={{ overflow: 'auto', padding: '4px'}}
            />
        </Container>
        </>
    );
} 