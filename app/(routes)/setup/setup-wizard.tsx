'use client';

import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import AccountCreation from './account-creation';
import AirlineCreation from './airline-creation';
import Welcome from './welcome';

const STEPS = [
  { id: 0, name: 'Welcome' },
  { id: 1, name: 'Admin Account' },
  { id: 2, name: 'Airline Details' },
];

function getStepCircleClass(stepId: number, currentStep: number) {
  if (stepId < currentStep) {
    return 'border-primary bg-primary text-primary-foreground';
  }
  if (stepId === currentStep) {
    return 'border-primary text-primary';
  }
  return 'border-border bg-background text-foreground';
}

export default function SetupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="space-y-8">
      {currentStep > 0 && (
        <div className="flex justify-center">
          <div className="flex items-center">
            {STEPS.slice(1).map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${getStepCircleClass(step.id, currentStep)}`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="font-medium text-sm">{step.id}</span>
                  )}
                </div>
                {index < STEPS.slice(1).length - 1 && (
                  <div
                    className={`h-px w-16 transition-colors mx-2 ${
                      step.id < currentStep ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        {currentStep === 0 && <Welcome onNext={handleNext} />}
        {currentStep === 1 && <AccountCreation onNext={handleNext} />}
        {currentStep === 2 && <AirlineCreation onComplete={handleComplete} />}
      </div>
    </div>
  );
}
