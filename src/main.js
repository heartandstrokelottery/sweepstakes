// Multi-step form logic for Payment (plain JS)
let currentStep = 1;

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    // Show current step
    const current = document.getElementById(`step-${step}`);
    if (current) current.classList.add('active');

    // Update progress bar
    document.querySelectorAll('.step').forEach((el, idx) => {
        el.classList.remove('active', 'completed');
        if (idx + 1 < step) {
            el.classList.add('completed');
        } else if (idx + 1 === step) {
            el.classList.add('active');
        }
    });
}

window.nextStep = function () {
    if (currentStep === 1) {
        var form = document.getElementById('personal-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
    }
    currentStep = Math.min(currentStep + 1, 3);
    showStep(currentStep);
};

window.prevStep = function () {
    currentStep = Math.max(currentStep - 1, 1);
    showStep(currentStep);
};

window.processPayment = function () {
    if (currentStep === 2) {
        var form = document.getElementById('payment-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
    }
    currentStep = 3;
    showStep(currentStep);
};

window.startOver = function () {
    currentStep = 1;
    showStep(currentStep);
    document.getElementById('personal-form').reset();
    document.getElementById('payment-form').reset();
};

document.addEventListener('DOMContentLoaded', function () {
    showStep(currentStep);
});
