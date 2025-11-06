import React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import Stepper from '@mui/joy/Stepper';
import Step, { stepClasses } from '@mui/joy/Step';
import StepIndicator, { stepIndicatorClasses } from '@mui/joy/StepIndicator';
import Typography from '@mui/joy/Typography';
import { COLORS } from '../../constants';

export default function ReusableIconStepper({ steps = [], activeStep = 0, onStepChange }) {
  return (
    <CssVarsProvider>
      <Stepper
        size="sm"
        sx={{
          width: '100%',
          '--StepIndicator-size': '2rem',
          '--Step-connectorInset': '0px',
          [`& .${stepIndicatorClasses.root}`]: {
            borderWidth: 2,
            transition: 'background-color 200ms ease, border-color 200ms ease, color 200ms ease',
          },
          [`& .${stepClasses.root}::after`]: {
            height: 2,
            backgroundColor: '#e5e7eb',
            backgroundImage: `linear-gradient(${COLORS.primary[500]}, ${COLORS.primary[500]})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '0% 100%',
            backgroundPosition: 'left center',
            transition: 'background-size 250ms ease',
          },
          [`& .${stepClasses.completed}::after`]: {
            backgroundSize: '100% 100%',
          },
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          const handleClick = () => {
            if (typeof onStepChange === 'function') onStepChange(index);
          };
          return (
            <Step
              key={index}
              completed={isCompleted}
              active={isActive}
              orientation="horizontal"
              sx={{ cursor: 'pointer' }}
              onClick={handleClick}
              indicator={
                <StepIndicator
                  variant={isCompleted ? 'solid' : 'outlined'}
                  color={isCompleted ? 'primary' : isActive ? 'neutral' : 'neutral'}
                  sx={{
                    backgroundColor: isCompleted ? COLORS.primary[500] : 'white',
                    borderColor: isCompleted ? COLORS.primary[500] : isActive ? COLORS.primary[500] : '#d1d5db',
                    color: isCompleted ? 'white' : isActive ? COLORS.primary[500] : '#9ca3af',
                    transition: 'background-color 200ms ease, border-color 200ms ease, color 200ms ease',
                  }}
                >
                  {step.icon}
                </StepIndicator>
              }
            >
              <Typography
                sx={{
                  fontWeight: 'md',
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px',
                  color: isActive ? COLORS.primary[600] : '#9ca3af',
                  transition: 'color 200ms ease',
                }}
              >
                {step.label}
              </Typography>
            </Step>
          );
        })}
      </Stepper>
    </CssVarsProvider>
  );
}
