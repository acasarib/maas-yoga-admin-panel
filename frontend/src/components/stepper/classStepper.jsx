import React from 'react';
import ReusableIconStepper from './reusableIconStepper';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function ClassStepper({ activeStep = 0, onStepChange }) {
  const steps = [
    { label: 'Clase', icon: <HistoryEduIcon fontSize="small" /> },
    { label: 'Duración', icon: <CalendarTodayIcon fontSize="small" /> },
    { label: 'Horarios', icon: <AccessTimeIcon fontSize="small" /> },
  ];

  return (
    <ReusableIconStepper steps={steps} activeStep={activeStep} onStepChange={onStepChange} />
  );
}
