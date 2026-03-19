// ===== STATE =====
const state = {
    currentStep: 1,
    selectedService: null,
    selectedPrice: null,
    selectedDate: null,
    selectedTime: null,
    clientName: '',
    clientSurname: '',
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear(),
};

const WHATSAPP_NUMBER = '5491150006396';
const APPS_SCRIPT_URL = '';
const STORAGE_KEY = 'thoto_reservas';
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initLocationCard();
    initServiceCards();
    initStaggeredPrices();
    cleanOldReservations();
});

// ===== TYPEWRITER EFFECT =====
function initTypewriter() {
    const elements = document.querySelectorAll('.typewriter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                typewrite(entry.target);
            }
        });
    }, { threshold: 0.5 });

    elements.forEach(el => {
        el.textContent = '';
        observer.observe(el);
    });

    // Trigger hero immediately
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        setTimeout(() => typewrite(heroTitle), 400);
        heroTitle.dataset.animated = 'true';
    }
}

function typewrite(element) {
    const text = element.dataset.text;
    if (!text) return;
    element.textContent = '';
    element.style.width = 'auto';
    element.style.maxWidth = '0';
    element.style.whiteSpace = 'nowrap';
    element.style.overflow = 'hidden';
    element.style.borderRight = '3px solid var(--accent)';

    let i = 0;
    const speed = 70;

    // Measure the full width
    const temp = element.cloneNode();
    temp.textContent = text;
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = 'nowrap';
    temp.style.maxWidth = 'none';
    temp.style.width = 'auto';
    temp.style.borderRight = 'none';
    element.parentNode.appendChild(temp);
    const fullWidth = temp.offsetWidth;
    temp.remove();

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            element.style.maxWidth = ((i + 1) / text.length * fullWidth + 20) + 'px';
            i++;
            setTimeout(type, speed);
        } else {
            element.style.maxWidth = 'none';
            // Remove cursor after a pause
            setTimeout(() => {
                element.style.borderRightColor = 'transparent';
                element.classList.add('no-cursor');
            }, 1500);
        }
    }
    type();
}

// Active step typewriters (for booking flow)
function triggerStepTypewriter(stepEl) {
    const tw = stepEl.querySelector('.step-title');
    if (tw && !tw.dataset.reanimated) {
        tw.dataset.reanimated = 'true';
        tw.dataset.animated = 'true';
        tw.textContent = '';
        tw.classList.remove('no-cursor');
        tw.style.borderRightColor = '';
        typewrite(tw);
    }
}

// ===== STAGGERED PRICE ANIMATION =====
function initStaggeredPrices() {
    const priceEls = document.querySelectorAll('.stagger-price');
    priceEls.forEach(el => {
        const value = el.dataset.value;
        el.innerHTML = '';
        for (let i = 0; i < value.length; i++) {
            const wrapper = document.createElement('span');
            wrapper.className = 'digit-wrapper';
            const digit = document.createElement('span');
            digit.className = 'digit';
            digit.textContent = value[i];
            wrapper.appendChild(digit);
            el.appendChild(wrapper);
        }
    });
}

function animatePrices() {
    const priceEls = document.querySelectorAll('.stagger-price');
    priceEls.forEach(el => {
        const digits = el.querySelectorAll('.digit');
        digits.forEach((d, i) => {
            d.classList.remove('visible');
            setTimeout(() => {
                d.classList.add('visible');
            }, 150 + i * 100);
        });
    });
}

// ===== LOCATION CARD TILT =====
function initLocationCard() {
    const card = document.getElementById('locationCard');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
    });
}

// ===== SERVICE CARDS =====
function initServiceCards() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => selectService(card));
    });
}

function selectService(card) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    state.selectedService = card.dataset.service;
    state.selectedPrice = parseInt(card.dataset.price);

    // Auto-advance after brief delay
    setTimeout(() => goToStep(2), 400);
}

// ===== NAVIGATION =====
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function startBooking() {
    const overlay = document.getElementById('bookingOverlay');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
        overlay.classList.add('open');
    });
    state.currentStep = 1;
    resetBookingState();
    updateProgress();
    showStep(1);
    animatePrices();
    document.body.style.overflow = 'hidden';
}

function closeBooking() {
    const overlay = document.getElementById('bookingOverlay');
    overlay.classList.remove('open');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 400);
    document.body.style.overflow = '';
}

function resetBookingState() {
    state.selectedService = null;
    state.selectedPrice = null;
    state.selectedDate = null;
    state.selectedTime = null;
    state.clientName = '';
    state.clientSurname = '';
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.booking-step .step-title').forEach(t => {
        t.dataset.reanimated = '';
    });
    // Reset inputs
    const nameInput = document.getElementById('clientName');
    const surnameInput = document.getElementById('clientSurname');
    if (nameInput) nameInput.value = '';
    if (surnameInput) surnameInput.value = '';
}

function goToStep(step) {
    state.currentStep = step;
    showStep(step);
    updateProgress();

    if (step === 2) {
        buildCalendar();
    } else if (step === 3) {
        buildTimeslots();
    } else if (step === 4) {
        initClientForm();
    }
}

function showStep(step) {
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    const activeStep = document.getElementById('step' + step);
    activeStep.classList.add('active');
    triggerStepTypewriter(activeStep);

    // Scroll overlay to top
    document.getElementById('bookingOverlay').scrollTop = 0;

    // Show/hide back button
    const backBtn = document.getElementById('backBtn');
    backBtn.style.display = step === 1 ? 'none' : 'flex';
}

function updateProgress() {
    const bar = document.getElementById('progressBar');
    bar.dataset.step = state.currentStep;

    document.querySelectorAll('.progress-steps .step').forEach(s => {
        const stepNum = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        if (stepNum === state.currentStep) s.classList.add('active');
        else if (stepNum < state.currentStep) s.classList.add('completed');
    });
}

function goBack() {
    if (state.currentStep === 1) {
        closeBooking();
    } else {
        if (state.currentStep === 4) {
            state.clientName = '';
            state.clientSurname = '';
        } else if (state.currentStep === 3) {
            state.selectedTime = null;
        } else if (state.currentStep === 2) {
            state.selectedDate = null;
        }
        goToStep(state.currentStep - 1);
    }
}

// ===== CALENDAR =====
function buildCalendar() {
    const container = document.getElementById('calendarContainer');
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay(); // 0=Sun

    container.innerHTML = `
        <div class="calendar-header">
            <span class="calendar-month">${MONTHS_ES[month]} ${year}</span>
            <div class="calendar-nav">
                <button onclick="changeMonth(-1)" aria-label="Mes anterior">‹</button>
                <button onclick="changeMonth(1)" aria-label="Mes siguiente">›</button>
            </div>
        </div>
        <div class="calendar-weekdays">
            ${DAYS_ES.map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="calendar-days" id="calendarDays"></div>
    `;

    const daysContainer = document.getElementById('calendarDays');

    // Empty cells before first day
    for (let i = 0; i < startWeekday; i++) {
        daysContainer.innerHTML += '<div class="calendar-day empty"></div>';
    }

    // Day cells
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        const dayOfWeek = date.getDay();
        const isPast = date < today;
        const isWeekend = dayOfWeek === 0;
        const isToday = date.getTime() === today.getTime();
        const isDisabled = isPast || isWeekend;

        const dateStr = formatDateKey(date);
        const isSelected = state.selectedDate && formatDateKey(state.selectedDate) === dateStr;

        let classes = 'calendar-day';
        if (isDisabled) classes += ' disabled';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';

        const onclick = isDisabled ? '' : `onclick="selectDate(${year}, ${month}, ${d})"`;

        daysContainer.innerHTML += `<div class="${classes}" ${onclick}>${d}</div>`;
    }
}

function changeMonth(delta) {
    state.calendarMonth += delta;
    if (state.calendarMonth > 11) {
        state.calendarMonth = 0;
        state.calendarYear++;
    } else if (state.calendarMonth < 0) {
        state.calendarMonth = 11;
        state.calendarYear--;
    }
    buildCalendar();
}

function selectDate(year, month, day) {
    state.selectedDate = new Date(year, month, day);
    buildCalendar();
    // Auto-advance
    setTimeout(() => goToStep(3), 300);
}

// ===== TIME SLOTS =====
async function buildTimeslots() {
    const grid = document.getElementById('timeslotsGrid');
    const dateText = document.getElementById('selectedDateText');
    const btn = document.getElementById('finalizeBtn');

    if (!state.selectedDate) return;

    const dateKey = formatDateKey(state.selectedDate);
    dateText.textContent = `${DAYS_FULL[state.selectedDate.getDay()]} ${state.selectedDate.getDate()} de ${MONTHS_ES[state.selectedDate.getMonth()]}`;

    const timeslotsForDay = state.selectedDate.getDay() === 6
        ? ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
        : ['13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30'];

    // Show Loader
    grid.innerHTML = '<div class="loader-container"><div class="spinner"></div><p>Cargando disponibilidad...</p></div>';
    btn.disabled = true;

    let reserved = [];
    if (!APPS_SCRIPT_URL) {
        reserved = getReservedSlots(dateKey);
        // Fake delay for demo
        await new Promise(r => setTimeout(r, 600));
    } else {
        try {
            const resp = await fetch(`${APPS_SCRIPT_URL}?fecha=${dateKey}`);
            const result = await resp.json();
            
            // support both formats: raw array or {ok:true, ocupados:[]}
            if (Array.isArray(result)) {
                reserved = result;
            } else if (result.ocupados && Array.isArray(result.ocupados)) {
                reserved = result.ocupados;
            } else {
                reserved = [];
            }
        } catch (e) {
            console.error(e);
            alert("Error al cargar horarios. Por favor intentá de nuevo.");
            reserved = [];
        }
    }

    grid.innerHTML = '';
    timeslotsForDay.forEach((slot, i) => {
        const isReserved = reserved.includes(slot);
        const isSelected = state.selectedTime === slot;

        const div = document.createElement('div');
        div.className = 'timeslot';
        if (isReserved) div.classList.add('reserved');
        if (isSelected) div.classList.add('selected');
        div.textContent = slot;

        if (!isReserved) {
            div.addEventListener('click', () => selectTimeslot(slot));
        }

        // Stagger animation
        div.style.opacity = '0';
        div.style.transform = 'translateY(10px)';
        setTimeout(() => {
            div.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            div.style.opacity = isReserved ? '0.25' : '1';
            div.style.transform = 'translateY(0)';
        }, 80 * i);

        grid.appendChild(div);
    });

    // Reset finalize button
    btn.disabled = !state.selectedTime;
}

function selectTimeslot(slot) {
    state.selectedTime = slot;

    document.querySelectorAll('.timeslot').forEach(t => {
        t.classList.remove('selected');
        if (t.textContent === slot) t.classList.add('selected');
    });

    document.getElementById('finalizeBtn').disabled = false;
}

// ===== CLIENT FORM =====
function initClientForm() {
    const nameInput = document.getElementById('clientName');
    const surnameInput = document.getElementById('clientSurname');
    const btn = document.getElementById('finalizeBtnData');

    // Restore values if going back
    if (state.clientName) nameInput.value = state.clientName;
    if (state.clientSurname) surnameInput.value = state.clientSurname;

    function checkName() {
        state.clientName = nameInput.value.trim();
        state.clientSurname = surnameInput.value.trim();
        btn.disabled = state.clientName.length === 0;
    }

    nameInput.addEventListener('input', checkName);
    surnameInput.addEventListener('input', checkName);
    checkName();
}

// ===== CONFIRMATION =====
function showConfirmation() {
    if (!state.selectedService || !state.selectedDate || !state.selectedTime || !state.clientName) return;

    const modal = document.getElementById('confirmationModal');
    const fullName = state.clientSurname ? `${state.clientName} ${state.clientSurname}` : state.clientName;
    document.getElementById('confirmClient').textContent = fullName;
    document.getElementById('confirmService').textContent = state.selectedService;
    document.getElementById('confirmPrice').textContent = `$${state.selectedPrice.toLocaleString('es-AR')}${state.selectedService === 'Corte a Domicilio' ? ' (minimo)' : ''}`;
    document.getElementById('confirmDate').textContent = `${DAYS_FULL[state.selectedDate.getDay()]} ${state.selectedDate.getDate()} de ${MONTHS_ES[state.selectedDate.getMonth()]} ${state.selectedDate.getFullYear()}`;
    document.getElementById('confirmTime').textContent = state.selectedTime + ' hs';

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closeConfirmation() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('open');
    setTimeout(() => modal.style.display = 'none', 300);
}

async function confirmBooking() {
    const confirmBtn = document.getElementById('chatBtnConfirm');
    const btnText = document.getElementById('chatBtnText');
    const originalText = btnText.textContent;

    btnText.textContent = "Procesando...";
    confirmBtn.style.pointerEvents = 'none';
    confirmBtn.style.opacity = '0.7';

    const fullName = state.clientSurname ? `${state.clientName} ${state.clientSurname}` : state.clientName;
    const isSuccess = await processBooking(fullName);

    btnText.textContent = originalText;
    confirmBtn.style.pointerEvents = 'auto';
    confirmBtn.style.opacity = '1';

    if (isSuccess) {
        closeConfirmation();
        setTimeout(() => showSuccessScreen(), 300);
    }
}

async function processBooking(fullName) {
    if (!APPS_SCRIPT_URL) {
        // Fallback local mode
        saveReservation(formatDateKey(state.selectedDate), state.selectedTime);
        await new Promise(r => setTimeout(r, 1000));
        return true;
    }

    try {
        const payload = {
            nombre: fullName,
            servicio: state.selectedService,
            fecha: formatDateKey(state.selectedDate),
            horario: state.selectedTime,
            precio: state.selectedPrice
        };

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        });

        let result;
        try {
            result = await response.json();
        } catch (parseError) {
            console.error("Error al leer JSON del Apps Script:", parseError);
            alert("La reserva se envió, pero el servidor no respondió con un JSON válido. Revisa el código del backend.");
            return false;
        }
        
        if (result.ok) {
            return true;
        } else {
            if (result.error && result.error.toLowerCase().includes("ya fue reservado")) {
                alert("Ese horario ya fue reservado. Por favor elegí otro.");
                closeConfirmation();
                goToStep(3);
                return false;
            } else {
                alert("Hubo un problema al procesar la reserva: " + (result.error || "Error desconocido"));
                return false;
            }
        }
    } catch (e) {
        console.error("Fetch Network o CORS Error:", e);
        alert("Ocurrió un error al conectar con el servidor (Posible error de CORS o URL inválida). Por favor revisá la consola F12.");
        return false;
    }
}

function showSuccessScreen() {
    const dateStr = `${DAYS_FULL[state.selectedDate.getDay()]} ${state.selectedDate.getDate()} de ${MONTHS_ES[state.selectedDate.getMonth()]} ${state.selectedDate.getFullYear()}`;
    const modal = document.getElementById('successModal');
    
    document.getElementById('successClient').textContent = state.clientSurname ? `${state.clientName} ${state.clientSurname}` : state.clientName;
    document.getElementById('successService').textContent = state.selectedService;
    document.getElementById('successDate').textContent = dateStr;
    document.getElementById('successTime').textContent = state.selectedTime + ' hs';

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closeSuccessScreen() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('open');
    setTimeout(() => {
        modal.style.display = 'none';
        closeBooking();
    }, 300);
}

function confirmViaWhatsApp() {
    const fullName = state.clientSurname ? `${state.clientName} ${state.clientSurname}` : state.clientName;
    const dateStr = `${DAYS_FULL[state.selectedDate.getDay()]} ${state.selectedDate.getDate()}/${String(state.selectedDate.getMonth()+1).padStart(2,'0')}/${state.selectedDate.getFullYear()}`;
    
    const message = `Hola! Reservé un turno:\n👤 ${fullName}\n📋 ${state.selectedService}\n📅 ${dateStr}\n🕐 ${state.selectedTime} hs`;
    
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    closeSuccessScreen();
}

// ===== LOCAL STORAGE =====
function getReservations() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveReservation(dateKey, time) {
    const reservations = getReservations();
    if (!reservations[dateKey]) {
        reservations[dateKey] = [];
    }
    if (!reservations[dateKey].includes(time)) {
        reservations[dateKey].push(time);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

function getReservedSlots(dateKey) {
    const reservations = getReservations();
    return reservations[dateKey] || [];
}

function cleanOldReservations() {
    const reservations = getReservations();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let changed = false;

    for (const dateKey in reservations) {
        const [y, m, d] = dateKey.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        if (date < today) {
            delete reservations[dateKey];
            changed = true;
        }
    }

    if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    }
}

// ===== HELPERS =====
function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}


