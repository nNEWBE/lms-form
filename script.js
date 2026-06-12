document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons safely
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {
    console.warn('Lucide CDN is offline; icons will not render.');
  }

  // ---- Theme Toggle (Dark / Light) ----
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('lms-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('lms-theme', isLight ? 'light' : 'dark');
    if (typeof lucide !== 'undefined') {
      lucide.createIcons(); // re-render icons after toggle
    }
  });

  // Elements - Form Inputs
  const form = document.getElementById('library-member-form');
  const inputName = document.getElementById('full_name');
  const inputEmail = document.getElementById('email');
  const inputPhone = document.getElementById('phone');
  const inputPassword = document.getElementById('password');
  const inputAvatar = document.getElementById('avatar');
  const dropzoneAvatar = document.getElementById('avatar-dropzone');
  const labelFile = document.getElementById('file-label');
  const inputProfileUrl = document.getElementById('profile_url');
  
  const inputDob = document.getElementById('dob');
  const inputMembershipStart = document.getElementById('membership_start');
  const inputMembershipExpiry = document.getElementById('membership_expiry');

  const inputCardTheme = document.getElementById('card_theme');
  const labelColorHex = document.getElementById('color-hex-label');
  const inputBorrowLimit = document.getElementById('borrow_limit');
  const labelLimitValue = document.getElementById('borrow-limit-val');
  const ticksElements = document.querySelectorAll('.slider-scale-ticks .tick');
  const selectBranch = document.getElementById('branch');
  const inputSearch = document.getElementById('search_interests');
  const genreCheckboxes = document.querySelectorAll('#genre-checkbox-container input[type="checkbox"]');
  const inputAddress = document.getElementById('address');
  const inputAgree = document.getElementById('agree_terms');

  // Elements - Preview Card Cardboard
  const cardPerspective = document.getElementById('card-perspective');
  const libraryCard = document.getElementById('library-id-card');
  const previewName = document.getElementById('preview-name');
  const previewEmail = document.getElementById('preview-email');
  const previewPhone = document.getElementById('preview-phone');
  const previewTier = document.getElementById('preview-tier');
  const previewLimit = document.getElementById('preview-limit');
  const previewTerm = document.getElementById('preview-term');
  const previewCardKey = document.getElementById('preview-card-key');
  const previewAvatar = document.getElementById('preview-avatar');
  const previewAvatarIcon = document.getElementById('preview-avatar-icon');

  // Reusable Custom Select Setup Helper
  function setupCustomSelect({
    wrapperId,
    triggerId,
    valueId,
    optionsContainerId,
    hiddenSelectId,
    defaultValue,
    onChange
  }) {
    const wrapper = document.getElementById(wrapperId);
    const trigger = document.getElementById(triggerId);
    const displayValue = document.getElementById(valueId);
    const optionsContainer = document.getElementById(optionsContainerId);
    const hiddenSelect = document.getElementById(hiddenSelectId);
    
    if (!wrapper || !trigger || !displayValue || !optionsContainer || !hiddenSelect) return null;
    
    const options = optionsContainer.querySelectorAll('.custom-option');
    let currentValue = defaultValue || hiddenSelect.value;
    
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) wrapper.classList.add('open');
    });
    
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = option.getAttribute('data-value');
        const text = option.textContent;
        
        hiddenSelect.value = val;
        hiddenSelect.dispatchEvent(new Event('change'));
        hiddenSelect.dispatchEvent(new Event('input'));
        
        displayValue.textContent = text;
        
        options.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        
        wrapper.classList.remove('open');
        currentValue = val;
        if (onChange) onChange(val, text);
      });
    });
    
    return {
      getWrapper: () => wrapper,
      getValue: () => currentValue,
      reset: () => {
        currentValue = defaultValue;
        hiddenSelect.value = defaultValue;
        hiddenSelect.dispatchEvent(new Event('change'));
        hiddenSelect.dispatchEvent(new Event('input'));
        
        options.forEach(o => {
          if (o.getAttribute('data-value') === defaultValue) {
            o.classList.add('selected');
            displayValue.textContent = o.textContent;
          } else {
            o.classList.remove('selected');
          }
        });
      },
      setValue: (val) => {
        options.forEach(o => {
          if (o.getAttribute('data-value') === val) {
            o.click();
          }
        });
      }
    };
  }

  // Reusable Date Picker Setup Helper
  function setupDatePicker({
    wrapperId,
    triggerId,
    displayId,
    hiddenId,
    calendarId,
    monthYearLabelId,
    prevMonthBtnId,
    nextMonthBtnId,
    daysGridId,
    clearDateBtnId,
    selectTodayBtnId,
    onSelect
  }) {
    const wrapper = document.getElementById(wrapperId);
    const trigger = document.getElementById(triggerId);
    const display = document.getElementById(displayId);
    const hidden = document.getElementById(hiddenId);
    const calendar = document.getElementById(calendarId);
    const monthYearLabel = document.getElementById(monthYearLabelId);
    const prevMonthBtn = document.getElementById(prevMonthBtnId);
    const nextMonthBtn = document.getElementById(nextMonthBtnId);
    const daysGrid = document.getElementById(daysGridId);
    const clearDateBtn = document.getElementById(clearDateBtnId);
    const selectTodayBtn = document.getElementById(selectTodayBtnId);

    if (!wrapper || !trigger || !display || !hidden || !calendar) return null;

    let calendarDate = new Date();
    let selectedDate = null;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        wrapper.classList.add('open');
        render();
      }
    });

    function render() {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      monthYearLabel.textContent = `${monthNames[month]} ${year}`;

      daysGrid.innerHTML = '';

      const firstDayIndex = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day-cell', 'empty');
        daysGrid.appendChild(emptyCell);
      }

      const today = new Date();
      for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        cell.classList.add('calendar-day-cell');
        cell.textContent = day;

        const cellDate = new Date(year, month, day);

        if (cellDate.getDate() === today.getDate() && 
            cellDate.getMonth() === today.getMonth() && 
            cellDate.getFullYear() === today.getFullYear()) {
          cell.classList.add('today');
        }

        if (selectedDate && 
            cellDate.getDate() === selectedDate.getDate() && 
            cellDate.getMonth() === selectedDate.getMonth() && 
            cellDate.getFullYear() === selectedDate.getFullYear()) {
          cell.classList.add('selected');
        }

        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          selectDate(cellDate);
        });

        daysGrid.appendChild(cell);
      }
    }

    function selectDate(date) {
      selectedDate = new Date(date);
      
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const yyyy = selectedDate.getFullYear();
      display.value = `${mm}/${dd}/${yyyy}`;

      hidden.value = `${yyyy}-${mm}-${dd}`;
      hidden.dispatchEvent(new Event('input'));
      hidden.dispatchEvent(new Event('change'));

      wrapper.classList.remove('open');

      if (onSelect) {
        onSelect(selectedDate);
      }
    }

    prevMonthBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarDate.setMonth(calendarDate.getMonth() - 1);
      render();
    });

    nextMonthBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarDate.setMonth(calendarDate.getMonth() + 1);
      render();
    });

    clearDateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedDate = null;
      display.value = '';
      hidden.value = '';
      hidden.dispatchEvent(new Event('input'));
      hidden.dispatchEvent(new Event('change'));
      wrapper.classList.remove('open');
      if (onSelect) {
        onSelect(null);
      }
    });

    selectTodayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectDate(new Date());
    });

    return {
      getWrapper: () => wrapper,
      getSelectedDate: () => selectedDate,
      reset: () => {
        selectedDate = null;
        calendarDate = new Date();
        display.value = '';
        hidden.value = '';
        hidden.dispatchEvent(new Event('input'));
        hidden.dispatchEvent(new Event('change'));
      },
      selectDate: (date) => selectDate(date)
    };
  }
  
  // Buttons & Notifications
  const btnReset = document.getElementById('reset-form-btn');
  const btnSubmit = document.getElementById('submit-form-btn');
  const successToast = document.getElementById('success-toast');
  const toastMessage = document.getElementById('toast-message');

  // Constants / Defaults
  const DEFAULTS = {
    name: 'Ayon Debnath',
    email: 'username@domain.com',
    phone: '+1 555-0199',
    tier: 'Standard',
    limit: 5,
    term: 'DEC 2026',
    theme: '#8b5cf6'
  };

  // Generate a random membership card key on load
  function generateCardKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randPart1 = Math.floor(1000 + Math.random() * 9000);
    const randPart2 = Math.floor(10 + Math.random() * 89);
    const randChar = chars[Math.floor(Math.random() * chars.length)];
    const key = `LMS-${randPart1}-${randPart2}${randChar}`;
    previewCardKey.textContent = key;
  }
  generateCardKey();

  // Live Syncing Input Handlers
  inputName.addEventListener('input', (e) => {
    previewName.textContent = e.target.value.trim() || DEFAULTS.name;
  });

  inputEmail.addEventListener('input', (e) => {
    previewEmail.textContent = e.target.value.trim() || DEFAULTS.email;
  });

  inputPhone.addEventListener('input', (e) => {
    previewPhone.textContent = e.target.value.trim() || DEFAULTS.phone;
  });

  // Sync Membership Tier Radio Input
  const radioTiers = document.querySelectorAll('input[name="tier"]');
  const tierMap = {
    'Standard': { icon: 'shield', label: 'Standard', class: 'tier-standard' },
    'Faculty': { icon: 'graduation-cap', label: 'Faculty', class: 'tier-faculty' },
    'Premium': { icon: 'zap', label: 'Premium', class: 'tier-premium' },
    'VIP': { icon: 'crown', label: 'VIP', class: 'tier-vip' }
  };

  radioTiers.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        const tierData = tierMap[e.target.value] || tierMap['Standard'];
        
        // Update class list on the preview tier element
        previewTier.className = 'card-type'; // reset
        previewTier.classList.add(tierData.class);
        
        // Update content with proper icon
        previewTier.innerHTML = `<i data-lucide="${tierData.icon}"></i><span>${tierData.label}</span>`;
        
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        // Optionally animate card type scaling
        previewTier.style.transform = 'scale(1.15)';
        setTimeout(() => {
          previewTier.style.transform = 'scale(1)';
        }, 200);
      }
    });
  });

  // Sync Card Accent Color Picker
  inputCardTheme.addEventListener('input', (e) => {
    const chosenColor = e.target.value;
    labelColorHex.textContent = chosenColor;
    
    // Set custom CSS variable on library card
    libraryCard.style.setProperty('--user-card-theme', chosenColor);
    
    // Update SVG background path beam glow matching picker color
    document.documentElement.style.setProperty('--accent-primary', chosenColor);
  });

  // Sync Max Borrow Limit Range Slider
  function updateSliderProgress(slider) {
    const min = parseFloat(slider.min) || 1;
    const max = parseFloat(slider.max) || 25;
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-progress', `${percent}%`);
  }

  function updateSliderTicks(val) {
    ticksElements.forEach(tick => {
      const tickVal = parseInt(tick.getAttribute('data-value'));
      if (tickVal <= val) {
        tick.classList.add('active');
      } else {
        tick.classList.remove('active');
      }
    });
  }

  inputBorrowLimit.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    labelLimitValue.textContent = value;
    previewLimit.textContent = `${value} BOOK${value > 1 ? 'S' : ''}`;
    updateSliderTicks(value);
    updateSliderProgress(e.target);
  });

  // Ticks click handlers
  ticksElements.forEach(tick => {
    tick.addEventListener('click', () => {
      const val = tick.getAttribute('data-value');
      inputBorrowLimit.value = val;
      inputBorrowLimit.dispatchEvent(new Event('input'));
    });
  });

  // Initialize ticks and progress
  updateSliderTicks(parseInt(inputBorrowLimit.value));
  updateSliderProgress(inputBorrowLimit);

  // Sync Expiry Term Date Input (e.g. "2026-12-15" -> "DEC 2026")
  inputMembershipExpiry.addEventListener('input', (e) => {
    if (!e.target.value) {
      previewTerm.textContent = DEFAULTS.term;
      return;
    }
    const [year, month, day] = e.target.value.split('-');
    const date = new Date(year, month - 1, day);
    const monthStr = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    previewTerm.textContent = `${monthStr} ${year}`;
  });

  // Avatar Upload Handler
  inputAvatar.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewAvatar.src = event.target.result;
        previewAvatar.style.display = 'block';
        previewAvatarIcon.style.display = 'none';
        
        dropzoneAvatar.classList.add('has-file');
        labelFile.textContent = file.name;
      };
      reader.readAsDataURL(file);
    } else {
      resetAvatarPreview();
    }
  });

  function resetAvatarPreview() {
    previewAvatar.src = '';
    previewAvatar.style.display = 'none';
    previewAvatarIcon.style.display = 'block';
    dropzoneAvatar.classList.remove('has-file');
    labelFile.textContent = 'Choose image or drag here';
  }

  // Genre Category Live Filter Tag Search
  inputSearch.addEventListener('input', (e) => {
    const filter = e.target.value.toLowerCase().trim();
    genreCheckboxes.forEach(checkbox => {
      const parentLabel = checkbox.closest('.custom-checkbox');
      const labelText = parentLabel.querySelector('span:not(.checkmark)').textContent.toLowerCase();
      
      if (labelText.includes(filter)) {
        parentLabel.style.opacity = '1';
        parentLabel.style.transform = 'scale(1)';
        parentLabel.style.pointerEvents = 'auto';
      } else {
        parentLabel.style.opacity = '0.35';
        parentLabel.style.transform = 'scale(0.95)';
        parentLabel.style.pointerEvents = 'none';
      }
    });
  });

  // Drag and drop event listeners for avatar dropzone
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzoneAvatar.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzoneAvatar.style.borderColor = 'var(--accent-secondary)';
      dropzoneAvatar.style.background = 'rgba(6, 182, 212, 0.04)';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzoneAvatar.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzoneAvatar.style.borderColor = '';
      dropzoneAvatar.style.background = '';
    }, false);
  });

  dropzoneAvatar.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file && file.type.startsWith('image/')) {
      inputAvatar.files = dt.files;
      // Trigger change event manually
      const event = new Event('change');
      inputAvatar.dispatchEvent(event);
    }
  });

  // Immersive 3D Tilt & Holographic reflection card calculations
  cardPerspective.addEventListener('mousemove', (e) => {
    const cardRect = cardPerspective.getBoundingClientRect();
    
    // Mouse coords relative to card
    const x = e.clientX - cardRect.left;
    const y = e.clientY - cardRect.top;
    
    // Centering calculations (-0.5 to 0.5 range)
    const px = (x / cardRect.width) - 0.5;
    const py = (y / cardRect.height) - 0.5;
    
    // Rotational angles (maximum 15deg tilt)
    const rotateY = px * 20;
    const rotateX = -py * 20;
    
    libraryCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    // Holographic shine translation
    const glowAngle = Math.atan2(y - cardRect.height / 2, x - cardRect.width / 2) * (180 / Math.PI);
    libraryCard.style.setProperty('--hologram-pos', `${x / cardRect.width * 100}% ${y / cardRect.height * 100}%`);
    
    // Modify shine overlay dynamically
    const shineOverlay = libraryCard.querySelector('.library-card-glow');
    shineOverlay.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`;
  });

  cardPerspective.addEventListener('mouseleave', () => {
    // Reset rotations smoothly
    libraryCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    const shineOverlay = libraryCard.querySelector('.library-card-glow');
    shineOverlay.style.background = `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)`;
  });

  // Form Reset handler
  btnReset.addEventListener('click', () => {
    // Form will reset field inputs automatically, we manually reset preview cards and indicators
    setTimeout(() => {
      // Restore card values to default
      previewName.textContent = DEFAULTS.name;
      previewEmail.textContent = DEFAULTS.email;
      previewPhone.textContent = DEFAULTS.phone;
      previewTier.textContent = DEFAULTS.tier;
      
      previewLimit.textContent = `${DEFAULTS.limit} BOOKS`;
      labelLimitValue.textContent = DEFAULTS.limit;
      updateSliderTicks(DEFAULTS.limit);
      updateSliderProgress(inputBorrowLimit);
      
      previewTerm.textContent = DEFAULTS.term;
      
      labelColorHex.textContent = DEFAULTS.theme;
      libraryCard.style.setProperty('--user-card-theme', DEFAULTS.theme);
      document.documentElement.style.setProperty('--accent-primary', DEFAULTS.theme);
      
      resetAvatarPreview();
      generateCardKey();
      
      // Clear visual feedback rings
      const controls = form.querySelectorAll('.input-control');
      controls.forEach(control => {
        control.style.borderColor = '';
        control.style.boxShadow = '';
      });
      
      // Reset genre selection states
      genreCheckboxes.forEach(checkbox => {
        const parentLabel = checkbox.closest('.custom-checkbox');
        parentLabel.style.opacity = '1';
        parentLabel.style.transform = 'scale(1)';
        parentLabel.style.pointerEvents = 'auto';
      });

      // Reset custom selects
      if (deptSelect) deptSelect.reset();
      if (batchSelect) batchSelect.reset();
      if (semesterSelect) semesterSelect.reset();
      
      // Reset tier badge
      previewTier.className = 'card-type tier-standard';
      previewTier.innerHTML = `<i data-lucide="shield"></i><span>Standard</span>`;
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      // Reset custom date pickers
      if (dobPicker) dobPicker.reset();
      if (startDatePicker) startDatePicker.reset();
      if (expiryDatePicker) expiryDatePicker.reset();
    }, 50);
  });

  // Form Validation & Submit handling
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isFormValid = true;
    
    // Validate required text fields
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
      const group = input.closest('.field-group');
      
      if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
        isFormValid = false;
        highlightInputError(input, true);
      } else {
        highlightInputError(input, false);
      }
    });

    // Validate email format specifically if value exists
    if (inputEmail.value.trim() && !validateEmail(inputEmail.value)) {
      isFormValid = false;
      highlightInputError(inputEmail, true);
    }

    if (!isFormValid) {
      // Visual wobble animation on the form card
      const formPanel = document.getElementById('registration-form-panel');
      formPanel.style.animation = 'shake-panel 0.4s ease';
      setTimeout(() => {
        formPanel.style.animation = '';
      }, 400);
      return;
    }

    // Process submission (loading state transition)
    btnSubmit.classList.add('is-loading');
    
    // Simulate API Database Post delay
    setTimeout(() => {
      btnSubmit.classList.remove('is-loading');
      
      // Setup success toast info
      const nameVal = inputName.value.trim() || 'Member';
      toastMessage.textContent = `${nameVal} has been successfully added to the Central Database.`;
      
      // Show Success Toast Notification
      successToast.classList.add('show');
      setTimeout(() => {
        successToast.classList.remove('show');
      }, 4000);
      
      // Trigger a clean reset of the form
      btnReset.click();
    }, 1600);
  });

  // Validation helper styling functions
  function highlightInputError(input, hasError) {
    if (hasError) {
      input.style.borderColor = 'var(--accent-error)';
    } else {
      input.style.borderColor = '';
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // ---- Close All Dropdowns Helper ----
  function closeAllDropdowns() {
    document.querySelectorAll('.custom-select-wrapper.open, .custom-datepicker-wrapper.open').forEach(wrapper => {
      wrapper.classList.remove('open');
    });
  }

  // ---- Initialize Custom Select Dropdowns ----
  const deptSelect = setupCustomSelect({
    wrapperId: 'custom-select-dept',
    triggerId: 'custom-select-trigger-dept',
    valueId: 'custom-select-value-dept',
    optionsContainerId: 'custom-select-options-dept',
    hiddenSelectId: 'department',
    defaultValue: 'CSE',
    onChange: (val) => {
      const el = document.getElementById('preview-dept');
      if (el) el.textContent = val;
    }
  });

  const batchSelect = setupCustomSelect({
    wrapperId: 'custom-select-batch',
    triggerId: 'custom-select-trigger-batch',
    valueId: 'custom-select-value-batch',
    optionsContainerId: 'custom-select-options-batch',
    hiddenSelectId: 'batch',
    defaultValue: 'Batch 60',
    onChange: (val) => {
      const el = document.getElementById('preview-batch');
      if (el) el.textContent = val.toUpperCase();
    }
  });

  const semesterSelect = setupCustomSelect({
    wrapperId: 'custom-select-semester',
    triggerId: 'custom-select-trigger-semester',
    valueId: 'custom-select-value-semester',
    optionsContainerId: 'custom-select-options-semester',
    hiddenSelectId: 'semester',
    defaultValue: '8th Sem',
    onChange: (val) => {
      const el = document.getElementById('preview-semester');
      if (el) el.textContent = val.toUpperCase();
    }
  });

  // ---- Initialize Custom Date Pickers ----
  const dobPicker = setupDatePicker({
    wrapperId: 'custom-datepicker-dob',
    triggerId: 'datepicker-dob-trigger',
    displayId: 'dob-display',
    hiddenId: 'dob',
    calendarId: 'datepicker-dob-calendar',
    monthYearLabelId: 'calendar-month-year',
    prevMonthBtnId: 'calendar-prev-month',
    nextMonthBtnId: 'calendar-next-month',
    daysGridId: 'calendar-days-grid',
    clearDateBtnId: 'calendar-clear-date',
    selectTodayBtnId: 'calendar-select-today'
  });

  const startDatePicker = setupDatePicker({
    wrapperId: 'custom-datepicker-start',
    triggerId: 'datepicker-start-trigger',
    displayId: 'start-date-display',
    hiddenId: 'membership_start',
    calendarId: 'datepicker-start-calendar',
    monthYearLabelId: 'start-calendar-month-year',
    prevMonthBtnId: 'start-calendar-prev-month',
    nextMonthBtnId: 'start-calendar-next-month',
    daysGridId: 'start-calendar-days-grid',
    clearDateBtnId: 'start-calendar-clear-date',
    selectTodayBtnId: 'start-calendar-select-today'
  });

  const expiryDatePicker = setupDatePicker({
    wrapperId: 'custom-datepicker-expiry',
    triggerId: 'datepicker-expiry-trigger',
    displayId: 'expiry-date-display',
    hiddenId: 'membership_expiry',
    calendarId: 'datepicker-expiry-calendar',
    monthYearLabelId: 'expiry-calendar-month-year',
    prevMonthBtnId: 'expiry-calendar-prev-month',
    nextMonthBtnId: 'expiry-calendar-next-month',
    daysGridId: 'expiry-calendar-days-grid',
    clearDateBtnId: 'expiry-calendar-clear-date',
    selectTodayBtnId: 'expiry-calendar-select-today'
  });

  // Global click to close custom dropdowns on click outside
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-select-wrapper.open, .custom-datepicker-wrapper.open').forEach(wrapper => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
      }
    });
  });
});

// Dynamic keyframe injection for invalid shake animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes shake-panel {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(styleSheet);
