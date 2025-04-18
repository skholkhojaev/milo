import { html } from '../../deps/htm-preact.js';

function StepIndicator({
  currentStep,
  totalSteps,
  prevStepIndicator = [],
}) {
  const step = currentStep < totalSteps ? currentStep + 1 : currentStep;
  const quizSteps = html`
    <div class="quiz-step-container${totalSteps > 3 ? ' wide' : ''}" role="list">
      ${Array.from({ length: totalSteps }).map((_, index) => {
    let className;
    switch (true) {
      case index === currentStep:
        className = 'current';
        break;
      case prevStepIndicator.includes(index):
        className = 'prev';
        break;
      default:
        className = 'future';
    }
    return html`<div class="quiz-step ${className}"
      aria-current="${index === currentStep ? 'step' : null}"
      aria-label="${index === currentStep ? `Step ${step} of ${totalSteps}` : null}"
      role="listitem"></div>`;
  })}
    </div>
  `;
  return quizSteps;
}

export default StepIndicator;
