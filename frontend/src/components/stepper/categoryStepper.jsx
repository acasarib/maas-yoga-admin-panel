import React from 'react';
import ReusableIconStepper from './reusableIconStepper';
import CategoryIcon from '@mui/icons-material/Category';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

export default function CategoryStepper({ activeStep = 0, onStepChange }) {
  const steps = [
    { label: 'Rubro', icon: <CategoryIcon fontSize="small" /> },
    { label: 'Artículos', icon: <FormatListBulletedIcon fontSize="small" /> },
  ];

  return (
    <ReusableIconStepper steps={steps} activeStep={activeStep} onStepChange={onStepChange} />
  );
}
