import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../design-system/components';
import { setTourCompleted, selectTourCompleted } from '../store/slices/preferencesSlice';

/**
 * GuidedTour Component
 * 
 * Provides step-by-step guided tours for first-time users.
 * Tracks tour completion status in user preferences.
 * 
 * @example
 * const dashboardTourSteps = [
 *   {
 *     target: '#dashboard-widgets',
 *     title: 'Dashboard Widgets',
 *     content: 'Customize your dashboard by adding or removing widgets.',
 *     placement: 'bottom'
 *   },
 *   // ... more steps
 * ];
 * 
 * <GuidedTour
 *   tourId="dashboard-tour"
 *   steps={dashboardTourSteps}
 *   onComplete={() => console.log('Tour completed')}
 * />
 */

const GuidedTour = ({
  tourId,
  steps = [],
  autoStart = false,
  onComplete,
  onSkip,
}) => {
  const dispatch = useDispatch();
  const tourCompleted = useSelector(selectTourCompleted(tourId));
  
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Check if tour should auto-start
  useEffect(() => {
    if (autoStart && !tourCompleted && steps.length > 0) {
      setIsActive(true);
    }
  }, [autoStart, tourCompleted, steps.length]);

  // Calculate position for the tooltip
  const calculatePosition = useCallback((element, placement = 'bottom') => {
    if (!element) return { top: 0, left: 0 };

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top + scrollTop - 10;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollTop + 10;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.left + scrollLeft - 10;
        break;
      case 'right':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.right + scrollLeft + 10;
        break;
      default:
        top = rect.bottom + scrollTop + 10;
        left = rect.left + scrollLeft + rect.width / 2;
    }

    return { top, left };
  }, []);

  // Update target element and position when step changes
  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      setTargetElement(element);
      const pos = calculatePosition(element, step.placement);
      setPosition(pos);

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight the element
      element.classList.add('tour-highlight');
    }

    return () => {
      if (element) {
        element.classList.remove('tour-highlight');
      }
    };
  }, [isActive, currentStep, steps, calculatePosition]);

  // Handle window resize
  useEffect(() => {
    if (!isActive || !targetElement) return;

    const handleResize = () => {
      const step = steps[currentStep];
      const pos = calculatePosition(targetElement, step.placement);
      setPosition(pos);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, targetElement, currentStep, steps, calculatePosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    setCurrentStep(0);
    if (onSkip) onSkip();
  };

  const handleComplete = () => {
    dispatch(setTourCompleted({ tourId, completed: true }));
    setIsActive(false);
    setCurrentStep(0);
    if (onComplete) onComplete();
  };

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  if (!isActive || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleSkip}
        aria-hidden="true"
      />

      {/* Tour Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl max-w-md"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: step.placement === 'left' || step.placement === 'right'
            ? 'translate(-50%, -50%)'
            : 'translateX(-50%)',
        }}
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-content"
      >
        {/* Progress Bar */}
        <div className="h-1 bg-neutral-200 rounded-t-lg overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 id="tour-title" className="text-lg font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              aria-label="Close tour"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div id="tour-content" className="text-neutral-700 mb-6">
            {step.content}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-neutral-600 hover:text-neutral-800 focus:outline-none focus:underline"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                icon={<ChevronLeft size={16} />}
                iconPosition="left"
              >
                Previous
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                icon={currentStep === steps.length - 1 ? null : <ChevronRight size={16} />}
                iconPosition="right"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * useTour Hook
 * 
 * Hook to control guided tours programmatically.
 * 
 * @example
 * const { startTour, isTourCompleted } = useTour('dashboard-tour');
 * 
 * if (!isTourCompleted) {
 *   startTour();
 * }
 */
export const useTour = (tourId) => {
  const dispatch = useDispatch();
  const isTourCompleted = useSelector(selectTourCompleted(tourId));

  const startTour = useCallback(() => {
    // This would trigger the tour component to start
    // Implementation depends on how you want to manage tour state
  }, []);

  const completeTour = useCallback(() => {
    dispatch(setTourCompleted({ tourId, completed: true }));
  }, [dispatch, tourId]);

  const resetTour = useCallback(() => {
    dispatch(setTourCompleted({ tourId, completed: false }));
  }, [dispatch, tourId]);

  return {
    isTourCompleted,
    startTour,
    completeTour,
    resetTour,
  };
};

export default GuidedTour;
