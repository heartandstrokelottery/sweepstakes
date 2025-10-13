/**
 * Payment Processing Script
 * Handles credit card payment collection, validation, and processing
 */

// Payment data object to store form information
let paymentData = {
    personal: {},
    card: {}
};

// Current step in the multi-step form
let currentStep = 1;

// Card type patterns
const cardTypes = {
    visa: {
        pattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
        name: "Visa",
        icon: "💳"
    },
    mastercard: {
        pattern: /^5[1-5][0-9]{14}$/,
        name: "Mastercard",
        icon: "💳"
    },
    amex: {
        pattern: /^3[47][0-9]{13}$/,
        name: "American Express",
        icon: "💳"
    },
    discover: {
        pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        name: "Discover",
        icon: "💳"
    },
    diners: {
        pattern: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        name: "Diners Club",
        icon: "💳"
    },
    jcb: {
        pattern: /^(?:2131|1800|35\d{3})\d{11}$/,
        name: "JCB",
        icon: "💳"
    }
};

// Initialize payment form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePaymentForm();
    showStep(1); // Ensure we start on step 1
});

/**
 * Initialize payment form with event listeners
 */
function initializePaymentForm() {
    // Card number input formatting and validation
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
        cardNumberInput.addEventListener('blur', validateCardNumber);
        cardNumberInput.addEventListener('focus', highlightCardNumber);
    }

    // Expiry date formatting and validation
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
        expiryInput.addEventListener('blur', validateExpiryDate);
    }

    // CVV validation
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', formatCVV);
        cvvInput.addEventListener('blur', validateCVV);
        cvvInput.addEventListener('focus', showCVVHint);
        cvvInput.addEventListener('blur', hideCVVHint);
    }

    // Form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
}

/**
 * Format card number with spaces and detect card type
 * @param {Event} event - Input event
 */
function formatCardNumber(event) {
    const input = event.target;
    let value = input.value.replace(/\s/g, ''); // Remove all spaces
    let formattedValue = '';
    
    // Add space after every 4 digits
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    input.value = formattedValue;
    
    // Detect and display card type
    detectCardType(value);
}

/**
 * Validate card number using Luhn algorithm
 * @param {Event} event - Blur event
 */
function validateCardNumber(event) {
    const input = event.target;
    const cardNumber = input.value.replace(/\s/g, '');
    const cardType = getCardType(cardNumber);
    
    clearValidationState(input);
    
    if (cardNumber.length < 13) {
        showValidationError(input, 'Card number is too short');
        return false;
    }
    
    if (!cardType) {
        showValidationError(input, 'Invalid card type');
        return false;
    }
    
    if (!isValidLuhn(cardNumber)) {
        showValidationError(input, 'Invalid card number');
        return false;
    }
    
    showValidationSuccess(input);
    paymentData.card.number = cardNumber;
    paymentData.card.type = cardType.name;
    return true;
}

/**
 * Detect card type based on number pattern
 * @param {string} cardNumber - Card number without spaces
 */
function detectCardType(cardNumber) {
    const cardTypeElement = document.getElementById('card-type-display');
    if (!cardTypeElement) return;
    
    const cardType = getCardType(cardNumber);
    
    if (cardType) {
        cardTypeElement.textContent = cardType.icon + ' ' + cardType.name;
        cardTypeElement.style.display = 'block';
    } else {
        cardTypeElement.style.display = 'none';
    }
}

/**
 * Get card type from number
 * @param {string} cardNumber - Card number
 * @returns {Object|null} Card type object or null
 */
function getCardType(cardNumber) {
    for (const type in cardTypes) {
        if (cardTypes[type].pattern.test(cardNumber)) {
            return cardTypes[type];
        }
    }
    return null;
}

/**
 * Validate card number using Luhn algorithm
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if valid
 */
function isValidLuhn(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the right
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit = 1 + (digit % 10);
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return (sum % 10) === 0;
}

/**
 * Format expiry date as MM/YY
 * @param {Event} event - Input event
 */
function formatExpiryDate(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove all non-digits
    
    // Add slash after 2 digits
    if (value.length >= 3) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    input.value = value;
}

/**
 * Validate expiry date
 * @param {Event} event - Blur event
 */
function validateExpiryDate(event) {
    const input = event.target;
    const value = input.value;
    
    clearValidationState(input);
    
    if (!/^\d{2}\/\d{2}$/.test(value)) {
        showValidationError(input, 'Use MM/YY format');
        return false;
    }
    
    const parts = value.split('/');
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10) + 2000; // Convert YY to YYYY
    
    if (month < 1 || month > 12) {
        showValidationError(input, 'Invalid month');
        return false;
    }
    
    const now = new Date();
    const expiry = new Date(year, month - 1, 1); // month is 0-indexed
    
    // Set to end of month for comparison
    expiry.setMonth(expiry.getMonth() + 1);
    expiry.setDate(0);
    
    if (expiry < now) {
        showValidationError(input, 'Card has expired');
        return false;
    }
    
    showValidationSuccess(input);
    paymentData.card.expiryMonth = month;
    paymentData.card.expiryYear = year;
    return true;
}

/**
 * Format CVV input
 * @param {Event} event - Input event
 */
function formatCVV(event) {
    const input = event.target;
    // Only allow digits
    input.value = input.value.replace(/\D/g, '');
}

/**
 * Validate CVV
 * @param {Event} event - Blur event
 */
function validateCVV(event) {
    const input = event.target;
    const value = input.value;
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardType = getCardType(cardNumber);
    
    clearValidationState(input);
    
    let requiredLength = 3;
    if (cardType && cardType.name === 'American Express') {
        requiredLength = 4;
    }
    
    if (value.length !== requiredLength) {
        showValidationError(input, `Must be ${requiredLength} digits`);
        return false;
    }
    
    showValidationSuccess(input);
    paymentData.card.cvv = value;
    return true;
}

/**
 * Show CVV hint when focused
 * @param {Event} event - Focus event
 */
function showCVVHint(event) {
    const input = event.target;
    const hint = document.getElementById('cvv-hint');
    
    if (hint) {
        hint.style.display = 'block';
        hint.style.position = 'absolute';
        hint.style.top = (input.offsetTop + input.offsetHeight + 5) + 'px';
        hint.style.left = input.offsetLeft + 'px';
    }
}

/**
 * Hide CVV hint when blurred
 * @param {Event} event - Blur event
 */
function hideCVVHint(event) {
    const hint = document.getElementById('cvv-hint');
    if (hint) {
        hint.style.display = 'none';
    }
}

/**
 * Highlight card number field when focused
 * @param {Event} event - Focus event
 */
function highlightCardNumber(event) {
    const input = event.target;
    input.parentElement.classList.add('focused');
}

/**
 * Handle payment form submission
 * @param {Event} event - Submit event
 */
function handlePaymentSubmit(event) {
    event.preventDefault();
    
    // Validate all card fields
    const cardNumberValid = validateCardNumber({ target: document.getElementById('cardNumber') });
    const expiryValid = validateExpiryDate({ target: document.getElementById('expiry') });
    const cvvValid = validateCVV({ target: document.getElementById('cvv') });
    
    if (!cardNumberValid || !expiryValid || !cvvValid) {
        showPaymentError('Please correct the errors in the payment form');
        return;
    }
    
    // Get cardholder name
    paymentData.card.holder = document.getElementById('cardHolder').value;
    
    // Process payment
    processPayment();
}

/**
 * Process payment with loading state
 */
function processPayment() {
    const submitButton = document.querySelector('.btn-next');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading"></span> Processing...';
    
    // Get personal data from first form
    const personalForm = document.getElementById('personal-form');
    paymentData.personal = {
        firstName: personalForm.firstName.value,
        lastName: personalForm.lastName.value,
        email: personalForm.email.value,
        phone: personalForm.phone.value,
        address: personalForm.address.value,
        city: personalForm.city.value,
        province: personalForm.province.value,
        postal: personalForm.postal.value,
        country: personalForm.country.value
    };
    
    // Simulate payment processing
    setTimeout(() => {
        // Send data to server
        sendPaymentData()
            .then(response => {
                showStep(3); // Move to confirmation
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            })
            .catch(error => {
                showPaymentError('Payment failed: ' + error.message);
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
    }, 2000); // Simulate processing time
}

/**
 * Send payment data to server
 * @returns {Promise} Promise that resolves when data is sent
 */
function sendPaymentData() {
    return new Promise((resolve, reject) => {
        // Prepare data for submission (remove sensitive data for demo)
        const submissionData = {
            firstName: paymentData.personal.firstName,
            lastName: paymentData.personal.lastName,
            email: paymentData.personal.email,
            phone: paymentData.personal.phone,
            address: paymentData.personal.address,
            city: paymentData.personal.city,
            province: paymentData.personal.province,
            postal: paymentData.personal.postal,
            country: paymentData.personal.country,
            cardType: paymentData.card.type,
            lastFour: paymentData.card.number.slice(-4),
            expiryMonth: paymentData.card.expiryMonth,
            expiryYear: paymentData.card.expiryYear
        };
        
        // In a real implementation, you would send to a secure payment gateway
        // For demo purposes, we'll simulate with the existing Google Apps Script
        fetch('https://script.google.com/macros/s/AKfycbzxEwSxe6DMOO6ReN9Cj1WZWsNSXrrnY32ogJVb9yXtq4SpDYwqsY8zRF69LYxJH-yL/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(submissionData)
        })
        .then(res => {
            if (!res.ok) throw new Error('Server response was not ok');
            return res.text();
        })
        .then(response => {
            console.log("Response from server:", response);
            resolve(response);
        })
        .catch(err => {
            console.error("Error submitting payment:", err);
            reject(err);
        });
    });
}

/**
 * Show validation error for an input field
 * @param {HTMLElement} input - Input element
 * @param {string} message - Error message
 */
function showValidationError(input, message) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    
    // Create or update error message element
    let errorElement = input.parentElement.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        input.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

/**
 * Show validation success for an input field
 * @param {HTMLElement} input - Input element
 */
function showValidationSuccess(input) {
    input.classList.add('valid');
    input.classList.remove('invalid');
    
    // Hide error message if exists
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

/**
 * Clear validation state for an input field
 * @param {HTMLElement} input - Input element
 */
function clearValidationState(input) {
    input.classList.remove('valid', 'invalid');
    
    // Hide error message if exists
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

/**
 * Show payment error message
 * @param {string} message - Error message
 */
function showPaymentError(message) {
    const errorContainer = document.getElementById('payment-error');
    if (!errorContainer) {
        const container = document.createElement('div');
        container.id = 'payment-error';
        container.className = 'payment-error';
        document.getElementById('payment-form').prepend(container);
    }
    
    document.getElementById('payment-error').textContent = message;
    document.getElementById('payment-error').style.display = 'block';
}

/**
 * Clear payment error message
 */
function clearPaymentError() {
    const errorContainer = document.getElementById('payment-error');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

/**
 * Show step in multi-step form
 * @param {number} step - Step number to show
 */
function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');
    
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

/**
 * Go to next step
 */
function nextStep() {
    const personalForm = document.getElementById('personal-form');
    if (currentStep === 1 && !personalForm.checkValidity()) {
        personalForm.reportValidity();
        return;
    }
    showStep(currentStep + 1);
}

/**
 * Go to previous step
 */
function prevStep() {
    showStep(currentStep - 1);
}

/**
 * Start over (reset forms)
 */
function startOver() {
    document.getElementById('personal-form').reset();
    document.getElementById('payment-form').reset();
    
    // Clear validation states
    document.querySelectorAll('.valid, .invalid').forEach(el => {
        el.classList.remove('valid', 'invalid');
    });
    
    // Clear error messages
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
    
    clearPaymentError();
    showStep(1);
}

// Make functions globally available for onclick handlers
window.nextStep = nextStep;
window.prevStep = prevStep;
window.processPayment = processPayment;
window.startOver = startOver;