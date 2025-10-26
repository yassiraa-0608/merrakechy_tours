// Updated checkout.js - Handles Adult/Children Pricing Structure

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== CHECKOUT DEBUG ===');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const id = urlParams.get('id');
    
    console.log('URL:', window.location.href);
    console.log('Params:', { category, id });
    
    // Load program data
    loadProgramData(category, id);
    
    // Initialize form handlers
    initializeForm();
});

function loadProgramData(category, id) {
    let programData = null;
    
    // Find program data based on category
    try {
        if (category === 'activity' && typeof activitiesData !== 'undefined') {
            programData = activitiesData[id];
        } else if (category === 'tour' && typeof toursData !== 'undefined') {
            programData = toursData[id];
        } else if (category === 'transportation' && typeof transportationData !== 'undefined') {
            programData = transportationData[id];
        }
        
        if (programData) {
            console.log('Program found:', programData.title);
            displayProgramInfo(programData, category, id);
        } else {
            console.log('Program not found!');
            showError();
        }
        
    } catch (error) {
        console.error('Error loading program:', error);
        showError();
    }
}

function displayProgramInfo(data, category, id) {
    // Update program name in header
    const programNameEl = document.getElementById('program-name');
    if (programNameEl) {
        programNameEl.textContent = data.title;
        console.log('Updated program name');
    }
    
    // Update program image
    const programImageEl = document.getElementById('program-image');
    if (programImageEl && data.mainImage) {
        programImageEl.src = data.mainImage;
        programImageEl.alt = data.title;
        programImageEl.style.display = 'block';
        console.log('Updated program image:', data.mainImage);
    } else if (programImageEl) {
        // Fallback image if no image is available
        programImageEl.src = '../assets/images/hero/slide1.jpg';
        programImageEl.alt = 'Morocco Tour';
        programImageEl.style.display = 'block';
    }
    
        // Update hidden form fields with pricing structure
    document.getElementById("category").value = category;
    document.getElementById("program-id").value = id;

    // Handle dynamic pricing first
    if (data.groupPricing) {
        // For group pricing, we don't set fixed adult/child prices here
        // The calculation will happen in updateTotalPrice based on the groupPricing tiers
        document.getElementById("program-price").value = 0; // Placeholder, actual price calculated later
        let childrenPriceInput = document.getElementById("children-price");
        if (!childrenPriceInput) {
            childrenPriceInput = document.createElement("input");
            childrenPriceInput.type = "hidden";
            childrenPriceInput.id = "children-price";
            childrenPriceInput.name = "children-price";
            document.getElementById("checkout-form").appendChild(childrenPriceInput);
        }
        childrenPriceInput.value = 0; // Placeholder
    } else if (data.pricing) {
        // New pricing structure with adult/children prices
        document.getElementById("program-price").value = data.pricing.adult;

        // Add hidden field for children price
        let childrenPriceInput = document.getElementById("children-price");
        if (!childrenPriceInput) {
            childrenPriceInput = document.createElement("input");
            childrenPriceInput.type = "hidden";
            childrenPriceInput.id = "children-price";
            childrenPriceInput.name = "children-price";
            document.getElementById("checkout-form").appendChild(childrenPriceInput);
        }
        childrenPriceInput.value = data.pricing.child;
    } else {
        // Fallback to old pricing structure
        document.getElementById("program-price").value = data.price || 0;

        // Calculate children price as 50% of adult price for backward compatibility
        let childrenPriceInput = document.getElementById("children-price");
        if (!childrenPriceInput) {
            childrenPriceInput = document.createElement("input");
            childrenPriceInput.type = "hidden";
            childrenPriceInput.id = "children-price";
            childrenPriceInput.name = "children-price";
            document.getElementById("checkout-form").appendChild(childrenPriceInput);
        }
        childrenPriceInput.value = (data.price || 0) * 0.5;
    }

    
    // Update booking summary
    const summaryProgram = document.getElementById('summary-program');
    if (summaryProgram) {
        summaryProgram.textContent = data.title;
    }
    
    // Update pricing display in summary
    updatePricingDisplay(data);
    
    console.log('Program info displayed successfully');
}

function updatePricingDisplay(data) {
    const summaryPriceEl = document.getElementById('summary-price');
    
    if (!summaryPriceEl) return;
    
    // Get prices based on data structure
    let adultPrice, childPrice;
    
    if (data.pricing) {
        // New pricing structure
        adultPrice = data.pricing.adult;
        childPrice = data.pricing.child;
    } else {
        // Fallback to old structure
        adultPrice = data.price || 0;
        childPrice = (data.price || 0) * 0.5;
    }
    
    // Update the pricing display
    if (adultPrice !== childPrice) {
        // Show both adult and children prices
        summaryPriceEl.innerHTML = `
            <div class="pricing-breakdown">
                <div class="price-item">Adults: €${adultPrice}/person</div>
                <div class="price-item">Children: €${childPrice}/person</div>
            </div>
        `;
    } else {
        // Show single price
        summaryPriceEl.textContent = `$${adultPrice}/person`;
    }
    
    // Calculate initial total
    updateTotalPrice();
}

function showError() {
    const programNameEl = document.getElementById('program-name');
    const summaryProgram = document.getElementById('summary-program');
    
    if (programNameEl) {
        programNameEl.textContent = 'Program Not Found';
    }
    
    if (summaryProgram) {
        summaryProgram.textContent = 'Program Not Found';
    }
}

function initializeForm() {
    // Initialize enhanced date picker FIRST
    addDatePickerCSS();
    initializeDatePicker();
    
    // Handle participant count changes
    const adultsSelect = document.getElementById('adults');
    const childrenSelect = document.getElementById('children');
    
    if (adultsSelect) {
        adultsSelect.addEventListener('change', updateParticipants);
    }
    
    if (childrenSelect) {
        childrenSelect.addEventListener('change', updateParticipants);
    }
    
    // Handle date changes
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            const summaryDate = document.getElementById('summary-date');
            if (summaryDate) {
                // Format the date nicely
                const date = new Date(this.value);
                const options = { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                };
                summaryDate.textContent = date.toLocaleDateString('en-US', options);
            }
        });
    }
    
    // Initial participant update
    updateParticipants();
}

function updateParticipants() {
    const adultsSelect = document.getElementById('adults');
    const childrenSelect = document.getElementById('children');
    const summaryParticipants = document.getElementById('summary-participants');
    
    if (adultsSelect && childrenSelect && summaryParticipants) {
        const adults = parseInt(adultsSelect.value) || 2;
        const children = parseInt(childrenSelect.value) || 0;
        
        summaryParticipants.textContent = `${adults} adult${adults !== 1 ? 's' : ''}, ${children} child${children !== 1 ? 'ren' : ''}`;
        
        // Update total price
        updateTotalPrice();
    }
}

function updateTotalPrice() {
    const adultsSelect = document.getElementById("adults");
    const childrenSelect = document.getElementById("children");
    const summaryTotal = document.getElementById("summary-total");
    const category = document.getElementById("category").value;
    const id = document.getElementById("program-id").value;

    if (adultsSelect && childrenSelect && summaryTotal) {
        const adults = parseInt(adultsSelect.value) || 2;
        const children = parseInt(childrenSelect.value) || 0;
        const totalPeople = adults + children;

        let totalPrice = 0;
        let adultPrice = 0;
        let childPrice = 0;

        // Retrieve program data again to access groupPricing
        let programData = null;
        if (category === 'activity' && typeof activitiesData !== 'undefined') {
            programData = activitiesData[id];
        } else if (category === 'tour' && typeof toursData !== 'undefined') {
            programData = toursData[id];
        }

        if (programData) {
            if (programData.groupPricing) {
                if (category === 'activity') {
                    totalPrice = calculateDynamicPrice(id, totalPeople);
                } else if (category === 'tour') {
                    totalPrice = calculateDynamicTourPrice(id, totalPeople);
                }
                // For display purposes in breakdown, we can approximate per person price
                adultPrice = totalPrice / totalPeople; 
                childPrice = totalPrice / totalPeople; // Assuming same for children in group pricing
            } else if (programData.pricing) {
                adultPrice = programData.pricing.adult;
                childPrice = programData.pricing.child;
                totalPrice = (adults * adultPrice) + (children * childPrice);
            } else if (programData.price) {
                adultPrice = programData.price;
                childPrice = programData.price * 0.5; // Fallback for old single price
                totalPrice = (adults * adultPrice) + (children * childPrice);
            }
        }

        summaryTotal.textContent = totalPrice.toFixed(2);

        // Update detailed breakdown if it exists
        const breakdownEl = document.getElementById("price-breakdown");
        if (breakdownEl) {
            breakdownEl.innerHTML = `
                <div class="breakdown-item">
                    <span>Adults (${adults} × $${adultPrice.toFixed(2)}):</span>
                    <span>$${(adults * adultPrice).toFixed(2)}</span>
                </div>
                ${children > 0 ? `
                <div class="breakdown-item">
                    <span>Children (${children} × $${childPrice.toFixed(2)}):</span>
                    <span>$${(children * childPrice).toFixed(2)}</span>
                </div>` : ''}
                <div class="breakdown-total">
                    <span>Total:</span>
                    <span>$${totalPrice.toFixed(2)}</span>
                </div>
            `;
        }

        console.log("Price calculation:", {
            adultPrice,
            childPrice,
            adults,
            children,
            totalPrice
        });
    }
}


// Date picker functions (keeping your existing ones)
function initializeDatePicker() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;
    
    console.log('Initializing date picker...');
    
    // Set minimum date to today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    dateInput.min = todayString;
    
    // Ensure it's a date input
    dateInput.type = 'date';
    
    // Add enhanced styling
    dateInput.classList.add('enhanced-date-input');
    
    // Wrap in container for icon (only if not already wrapped)
    if (!dateInput.parentElement.classList.contains('date-input-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'date-input-wrapper';
        dateInput.parentNode.insertBefore(wrapper, dateInput);
        wrapper.appendChild(dateInput);
        
        // Add calendar icon
        const calendarIcon = document.createElement('i');
        calendarIcon.className = 'fas fa-calendar-alt date-input-icon';
        wrapper.appendChild(calendarIcon);
        
        // Make icon clickable
        calendarIcon.addEventListener('click', function() {
            dateInput.focus();
            if (dateInput.showPicker) {
                dateInput.showPicker();
            }
        });
        
        console.log('Date picker wrapper and icon added');
    }
    
    // Add validation
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            alert('Please select a future date');
            this.value = '';
            return;
        }
        
        // Update summary with formatted date
        const summaryDate = document.getElementById('summary-date');
        if (summaryDate) {
            const formattedDate = selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            summaryDate.textContent = formattedDate;
        }
        
        console.log('Date selected:', this.value);
    });
    
    // Focus event - try to show picker on supported browsers
    dateInput.addEventListener('focus', function() {
        if (this.showPicker && !this.value) {
            setTimeout(() => {
                if (this.showPicker) {
                    this.showPicker();
                }
            }, 100);
        }
    });
}

function addDatePickerCSS() {
    // Check if styles already added
    if (document.getElementById('date-picker-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'date-picker-styles';
    style.textContent = `
        .date-input-wrapper {
            position: relative;
            display: block;
            width: 100%;
        }
        
        .enhanced-date-input {
            width: 100%;
            padding: 12px 40px 12px 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            font-family: inherit;
            background-color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .enhanced-date-input:focus {
            outline: none;
            border-color: #E57C23;
            box-shadow: 0 0 0 3px rgba(229, 124, 35, 0.2);
        }
        
        .date-input-icon {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #E57C23;
            cursor: pointer;
            font-size: 16px;
            transition: color 0.3s ease;
        }
        
        .date-input-icon:hover {
            color: #d06a1e;
        }
        
        /* Hide default calendar icon in WebKit browsers */
        .enhanced-date-input::-webkit-calendar-picker-indicator {
            opacity: 0;
            position: absolute;
            right: 0;
            width: 40px;
            height: 100%;
            cursor: pointer;
        }
        
        .pricing-breakdown {
            font-size: 0.9rem;
        }
        
        .price-item {
            margin-bottom: 5px;
        }
        
        .breakdown-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }
        
        .breakdown-total {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-weight: 600;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .enhanced-date-input {
                padding: 14px 45px 14px 15px;
                font-size: 16px; /* Prevents zoom on iOS */
            }
            
            .date-input-icon {
                right: 15px;
                font-size: 18px;
            }
        }
    `;
    
    document.head.appendChild(style);
    console.log('Date picker CSS added');
}

// Add this to your checkout.js
document.addEventListener('DOMContentLoaded', function() {
    function updateTotalPriceField() {
        const totalPriceField = document.getElementById('total-price');
        const summaryTotal = document.getElementById('summary-total');
        const programName = document.getElementById('program-name');
        const programNameField = document.getElementById('program-name-hidden');
        
        if (totalPriceField && summaryTotal && summaryTotal.textContent) {
            totalPriceField.value = '€' + summaryTotal.textContent;
            console.log('Updated total price field:', totalPriceField.value);
        }
        
        if (programNameField && programName && programName.textContent !== 'Loading...') {
            programNameField.value = programName.textContent;
            console.log('Updated program name field:', programNameField.value);
        }
    }
    
    // Update on page load
    setTimeout(updateTotalPriceField, 2000);
    
    // Update when adults/children change
    const adultsSelect = document.getElementById('adults');
    const childrenSelect = document.getElementById('children');
    
    if (adultsSelect) {
        adultsSelect.addEventListener('change', function() {
            setTimeout(updateTotalPriceField, 100);
        });
    }
    
    if (childrenSelect) {
        childrenSelect.addEventListener('change', function() {
            setTimeout(updateTotalPriceField, 100);
        });
    }
});