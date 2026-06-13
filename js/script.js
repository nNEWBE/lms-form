document.addEventListener('DOMContentLoaded', () => {

  // Override Event constructor to ensure programmatically dispatched events bubble by default
  const OriginalEvent = window.Event;
  window.Event = function (type, options) {
    if (type === 'input' || type === 'change') {
      options = Object.assign({ bubbles: true }, options);
    }
    return new OriginalEvent(type, options);
  };
  window.Event.prototype = OriginalEvent.prototype;

  document.querySelectorAll('label').forEach(label => {
    if (label.innerHTML.includes('*')) {
      label.innerHTML = label.innerHTML.replace(/\*/g, '<span class="required-asterisk">*</span>');
    }
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {
    console.warn('Lucide CDN is offline; icons will not render.');
  }

  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('lms-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
  const savedColor = localStorage.getItem('lms-card-theme-color');
  if (savedColor) {
    document.documentElement.style.setProperty('--accent-primary', savedColor);
  }
  themeToggle.addEventListener('click', (e) => {
    const isLight = !document.body.classList.contains('light-mode');

    const rect = themeToggle.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);

    const maxR = Math.ceil(
      Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    );

    document.documentElement.style.setProperty('--ripple-x', x + 'px');
    document.documentElement.style.setProperty('--ripple-y', y + 'px');
    document.documentElement.style.setProperty('--ripple-r', maxR + 'px');
    document.documentElement.style.setProperty(
      '--ripple-color',
      isLight ? '#f0f1f5' : '#05060b'
    );

    const doToggle = () => {
      document.body.classList.toggle('light-mode');
      localStorage.setItem('lms-theme', isLight ? 'light' : 'dark');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    if (document.startViewTransition) {
      document.documentElement.setAttribute('data-theme-transitioning', isLight ? 'to-light' : 'to-dark');
      const transition = document.startViewTransition(doToggle);
      transition.finished.finally(() => {
        document.documentElement.removeAttribute('data-theme-transitioning');
      });
    } else {

      const ripple = document.createElement('div');
      ripple.id = 'theme-ripple-overlay';
      ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: ${isLight ? '#f0f1f5' : '#05060b'};
        transform: translate(-50%, -50%);
        z-index: 99999;
        pointer-events: none;
        transition: width 1.0s cubic-bezier(0.22,1,0.36,1), height 1.0s cubic-bezier(0.22,1,0.36,1);
      `;
      document.body.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.width = (maxR * 2) + 'px';
        ripple.style.height = (maxR * 2) + 'px';
      });
      setTimeout(() => {
        doToggle();
        ripple.style.transition = 'opacity 0.35s ease';
        ripple.style.opacity = '0';
        setTimeout(() => ripple.remove(), 350);
      }, 650);
    }
  });

  

  

  function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const resizeHandler = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#eab308', '#22c55e', '#3b82f6'];
    const particles = [];

    const particleCount = 120;
    for (let i = 0; i < particleCount; i++) {
      const isLeft = i < particleCount / 2;
      particles.push({
        x: isLeft ? 0 : width,
        y: height * 0.85,
        vx: isLeft ? (6 + Math.random() * 12) : -(6 + Math.random() * 12),
        vy: -14 - Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotationSpeed: -6 + Math.random() * 12,
        opacity: 1,
        gravity: 0.35,
        drag: 0.975
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      particles.forEach(p => {
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y < height && p.opacity > 0 && p.x >= 0 && p.x <= width) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();

          if (p.vy > 0) {
            p.opacity -= 0.012;
          }
        }
      });

      if (alive) {
        requestAnimationFrame(animate);
      } else {
        window.removeEventListener('resize', resizeHandler);
        canvas.remove();
      }
    }

    animate();
  }

  const form = document.getElementById('library-member-form');
  const inputFirstName = document.getElementById('first_name');
  const inputLastName = document.getElementById('last_name');
  const inputEmail = document.getElementById('email');
  const inputPhone = document.getElementById('phone');
  const inputPassword = document.getElementById('password');
  const inputAvatar = document.getElementById('avatar');
  const dropzoneAvatar = document.getElementById('avatar-dropzone');
  const labelFile = document.getElementById('file-label');
  const inputProfileUrl = document.getElementById('profile_url');

  const inputEnrollment = document.getElementById('enrollment_proof');
  const dropzoneEnrollment = document.getElementById('enrollment-dropzone');
  const labelEnrollmentFile = document.getElementById('enrollment-file-label');

  const inputDob = document.getElementById('dob');
  const inputMembershipStart = document.getElementById('membership_start');
  const inputMembershipExpiry = document.getElementById('membership_expiry');

  const inputCardTheme = document.getElementById('card_theme');
  const labelColorHex = document.getElementById('color-hex-label');
  const inputBorrowLimit = document.getElementById('borrow_limit');
  const labelLimitValue = document.getElementById('borrow-limit-val');
  const ticksElements = document.querySelectorAll('.slider-scale-ticks .tick');
  const inputBatch = document.getElementById('admission_session');

  const inputAddress = document.getElementById('address');
  const inputAgree = document.getElementById('agree_terms');

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
  const previewAvatarContainer = document.getElementById('preview-avatar-container');
  if (libraryCard && savedColor) {
    libraryCard.style.setProperty('--user-card-theme', savedColor);
  }

  if (previewAvatar) {
    previewAvatar.addEventListener('error', () => {
      const rawSrc = previewAvatar.getAttribute('src');
      if (!rawSrc || rawSrc === '' || previewAvatar.style.display === 'none') {
        return;
      }
      console.error("Avatar failed to load. Configured src URL was:", previewAvatar.src);
      showToast("Avatar Load Failed", "Failed to load: " + previewAvatar.src, true);
    });
  }

  function setupCustomSelect({
    wrapperId,
    triggerId,
    valueId,
    optionsContainerId,
    hiddenSelectId,
    defaultValue,
    placeholderText,
    hasSearch,
    searchPlaceholder,
    onChange
  }) {
    const wrapper = document.getElementById(wrapperId);
    const trigger = document.getElementById(triggerId);
    const displayValue = document.getElementById(valueId);
    const optionsContainer = document.getElementById(optionsContainerId);
    const hiddenSelect = document.getElementById(hiddenSelectId);

    if (!wrapper || !trigger || !displayValue || !optionsContainer || !hiddenSelect) return null;

    const options = optionsContainer.querySelectorAll('.custom-option');
    let currentValue = defaultValue !== undefined ? defaultValue : hiddenSelect.value;

    function updateStyle() {
      if (hiddenSelect.value === '') {
        displayValue.classList.add('placeholder-style');
      } else {
        displayValue.classList.remove('placeholder-style');
      }
    }

    let searchInput = null;
    if (hasSearch) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'select-search-container';
      searchContainer.innerHTML = `
        <i data-lucide="search" class="select-search-icon"></i>
        <input type="text" class="select-search-input" placeholder="${searchPlaceholder || 'Search...'}">
      `;
      optionsContainer.insertBefore(searchContainer, optionsContainer.firstChild);

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      searchInput = searchContainer.querySelector('.select-search-input');

      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        options.forEach(option => {
          const text = option.textContent.toLowerCase();
          if (text.includes(query)) {
            option.style.display = '';
          } else {
            option.style.display = 'none';
          }
        });
      });
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        const rect = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 230;
        if (spaceBelow < dropdownHeight && rect.top > spaceBelow) {
          wrapper.classList.add('open-top');
        } else {
          wrapper.classList.remove('open-top');
        }
        wrapper.classList.add('open');
        if (searchInput) {
          searchInput.value = '';
          options.forEach(o => o.style.display = '');
          setTimeout(() => searchInput.focus(), 50);
        }
      }
    });

    hiddenSelect.addEventListener('change', () => {
      const val = hiddenSelect.value;
      currentValue = val;
      updateStyle();

      let text = placeholderText || 'Select';
      if (val === '') {
        displayValue.textContent = text;
        options.forEach(o => o.classList.remove('selected'));
      } else {
        const option = Array.from(options).find(o => o.getAttribute('data-value') === val);
        if (option) {
          text = option.textContent;
          displayValue.textContent = text;
          options.forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');
        }
      }
      if (onChange) onChange(val, text);
    });

    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = option.getAttribute('data-value');

        hiddenSelect.value = val;
        hiddenSelect.dispatchEvent(new Event('change'));
        hiddenSelect.dispatchEvent(new Event('input'));

        wrapper.classList.remove('open');
        wrapper.classList.remove('open-top');
      });
    });

    hiddenSelect.dispatchEvent(new Event('change'));

    return {
      getWrapper: () => wrapper,
      getValue: () => currentValue,
      reset: () => {
        hiddenSelect.value = defaultValue;
        hiddenSelect.dispatchEvent(new Event('change'));
        hiddenSelect.dispatchEvent(new Event('input'));
        if (searchInput) {
          searchInput.value = '';
          options.forEach(o => o.style.display = '');
        }
      },
      setValue: (val) => {
        hiddenSelect.value = val;
        hiddenSelect.dispatchEvent(new Event('change'));
        hiddenSelect.dispatchEvent(new Event('input'));
      }
    };
  }

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
        const rect = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 330;
        if (spaceBelow < dropdownHeight && rect.top > spaceBelow) {
          wrapper.classList.add('open-top');
        } else {
          wrapper.classList.remove('open-top');
        }
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
      wrapper.classList.remove('open-top');

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
      wrapper.classList.remove('open-top');
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

  const btnReset = document.getElementById('reset-form-btn');
  const btnSubmit = document.getElementById('submit-form-btn');
  const successToast = document.getElementById('success-toast');
  const toastMessage = document.getElementById('toast-message');
  const cardActionsWrapper = document.querySelector('.card-actions-wrapper');

  let isCardCreated = false;

  function updateSubmitButtonText() {
    if (!btnSubmit) return;
    const span = btnSubmit.querySelector('span');
    if (span) {
      if (isCardCreated) {
        span.innerHTML = 'Update<span class="btn-text-full"> Member</span>';
      } else {
        span.innerHTML = 'Create<span class="btn-text-full"> Member</span>';
      }
    }
  }

  function updateCardActionsVisibility() {
    if (!cardActionsWrapper) return;
    cardActionsWrapper.style.display = isCardCreated ? 'grid' : 'none';
  }

  const DEFAULTS = {
    name: 'Your User Name',
    email: 'example@domain.com',
    phone: '+00 000-0000',
    tier: 'Standard',
    limit: 1,
    term: 'DEC 2026',
    theme: '#06b6d4'
  };

  function updateQrCodeElement(key) {
    const qrImage = document.getElementById('preview-qr');
    if (!qrImage) return;
    try {
      if (typeof QRious !== 'undefined') {
        const qr = new QRious({
          value: key,
          size: 150,
          background: '#12131a',
          foreground: '#ffffff',
          level: 'H'
        });
        qrImage.src = qr.toDataURL();
      } else {
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(key)}&color=ffffff&bgcolor=12131a`;
      }
    } catch (e) {
      console.error("Local QR generation failed, falling back to API:", e);
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(key)}&color=ffffff&bgcolor=12131a`;
    }
  }

  function generateCardKey() {
    if (!previewCardKey) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randPart1 = Math.floor(1000 + Math.random() * 9000);
    const randPart2 = Math.floor(10 + Math.random() * 89);
    const randChar = chars[Math.floor(Math.random() * chars.length)];
    const key = `LMS-${randPart1}-${randPart2}${randChar}`;
    previewCardKey.textContent = key;

    updateQrCodeElement(key);
  }
  generateCardKey();

  const updatePreviewName = () => {
    
    const first = inputFirstName ? inputFirstName.value.trim() : '';
    const last = inputLastName ? inputLastName.value.trim() : '';
    if (!first && !last) {
      previewName.textContent = DEFAULTS.name;
    } else {
      previewName.textContent = `${first} ${last}`.trim();
    }
  };
  if (inputFirstName) inputFirstName.addEventListener('input', updatePreviewName);
  if (inputLastName) inputLastName.addEventListener('input', updatePreviewName);

  if (inputEmail) {
    inputEmail.addEventListener('input', (e) => {
      previewEmail.textContent = e.target.value.trim() || DEFAULTS.email;
    });
  }

  if (inputPhone) {
    inputPhone.addEventListener('input', (e) => {
      previewPhone.textContent = e.target.value.trim() || DEFAULTS.phone;
    });
  }

  async function checkEmailOrStudentIdExists() {
    
    const emailVal = inputEmail ? inputEmail.value.trim().toLowerCase() : '';
    const studentIdInput = document.getElementById('student_id');
    const studentIdVal = studentIdInput ? studentIdInput.value.trim().toLowerCase() : '';
    if (!emailVal && !studentIdVal) return;

    let members = {};
    try {
      members = await DB.getAllMembers();
    } catch (err) {
      members = DB.getLocalMembers();
    }

    const matched = Object.values(members).find(m => {
      if (!m) return false;
      const mEmail = (m.e || '').trim().toLowerCase();
      const mStudentId = m.student_info ? (m.student_info.student_id || '').trim().toLowerCase() : '';
      if (emailVal && mEmail && emailVal === mEmail) return true;
      if (studentIdVal && mStudentId && studentIdVal === mStudentId) return true;
      return false;
    });

    if (matched) {
      console.log("Input: Found existing member. Syncing key:", matched.k);
      if (previewCardKey) {
        previewCardKey.textContent = matched.k;
        updateQrCodeElement(matched.k);
      }
      isCardCreated = true;
      updateSubmitButtonText();
      updateCardActionsVisibility();
    }
  }

  if (inputEmail) {
    inputEmail.addEventListener('blur', checkEmailOrStudentIdExists);
  }
  const studentIdInput = document.getElementById('student_id');
  if (studentIdInput) {
    studentIdInput.addEventListener('blur', checkEmailOrStudentIdExists);
  }

  const radioTiers = document.querySelectorAll('input[name="tier"]');
  const tierMap = {
    'Standard': { icon: 'shield', label: 'Standard', class: 'tier-standard' },
    'Premium': { icon: 'zap', label: 'Premium', class: 'tier-premium' },
    'VIP': { icon: 'crown', label: 'VIP', class: 'tier-vip' }
  };

  radioTiers.forEach(radio => {
    radio.addEventListener('change', (e) => {
      
      if (e.target.checked) {
        const tierData = tierMap[e.target.value] || tierMap['Standard'];

        previewTier.className = 'card-type';
        previewTier.classList.add(tierData.class);

        previewTier.innerHTML = `<i data-lucide="${tierData.icon}"></i><span>${tierData.label}</span>`;

        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        previewTier.style.transform = 'scale(1.15)';
        setTimeout(() => {
          previewTier.style.transform = 'scale(1)';
        }, 200);
      }
    });
  });

  if (inputCardTheme) {
    inputCardTheme.addEventListener('input', (e) => {
      const chosenColor = e.target.value;
      labelColorHex.textContent = chosenColor;
      if (libraryCard) libraryCard.style.setProperty('--user-card-theme', chosenColor);
      document.documentElement.style.setProperty('--accent-primary', chosenColor);
      try {
        localStorage.setItem('lms-card-theme-color', chosenColor);
      } catch (err) {
        console.warn('Failed to save theme color:', err);
      }
    });
  }

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

  if (inputBorrowLimit) {
    inputBorrowLimit.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      labelLimitValue.textContent = value;
      previewLimit.textContent = `${value} BOOK${value > 1 ? 'S' : ''}`;
      updateSliderTicks(value);
      updateSliderProgress(e.target);
    });

    ticksElements.forEach(tick => {
      tick.addEventListener('click', () => {
        const val = tick.getAttribute('data-value');
        inputBorrowLimit.value = val;
        inputBorrowLimit.dispatchEvent(new Event('input'));
      });
    });

    updateSliderTicks(parseInt(inputBorrowLimit.value));
    updateSliderProgress(inputBorrowLimit);
  }

  document.querySelectorAll('input[name="card_status"]').forEach(radio => {
    radio.addEventListener('change', () => {
      highlightInputError(radio, false);
    });
  });

  if (inputMembershipExpiry) {
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
  }

  async function sha1(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async function uploadToCloudinary(fileOrBlob) {
    const env = window.ENV || {};
    const cloudName = env.CLOUDINARY_CLOUD_NAME || 'dorjgyfdl';
    const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET || 'lms-form';
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured');
    }

    const formData = new FormData();
    formData.append('file', fileOrBlob);

    if (uploadPreset) {
      formData.append('upload_preset', uploadPreset);
    } else {
      if (!apiKey || !apiSecret) {
        throw new Error('Neither Cloudinary upload_preset nor api_key/api_secret are configured in env.js');
      }
      const timestamp = Math.round(Date.now() / 1000);
      const folder = 'lms_avatars';
      const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = await sha1(signatureString);

      formData.append('folder', folder);
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.error?.message || 'Cloudinary upload failed');
    }

    const result = await response.json();
    return result.secure_url;
  }

  function getCloudinaryPath(url) {
    if (!url) return '';
    if (url.startsWith('c:')) return url;
    const match = url.match(/\/image\/upload\/(.+)$/);
    return match ? 'c:' + match[1] : 'c:' + url;
  }

  let toastTimeout = null;
  function showToast(titleText, descText, typeOrError = false) {
    if (successToast && toastMessage) {
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
      const titleEl = successToast.querySelector('.toast-title');
      if (titleEl) titleEl.textContent = titleText;
      toastMessage.textContent = descText;

      // Manage progress bar for loading state
      let progressBar = successToast.querySelector('.toast-progress-bar');
      if (typeOrError === 'loading') {
        if (!progressBar) {
          progressBar = document.createElement('div');
          progressBar.className = 'toast-progress-bar';
          successToast.appendChild(progressBar);
        }
      } else if (progressBar) {
        progressBar.remove();
      }

      const wrapper = successToast.querySelector('.toast-icon-wrapper');
      if (wrapper) {
        let iconName = 'check-circle';
        if (typeOrError === 'loading') {
          iconName = 'loader-2';
          wrapper.classList.add('spin');
        } else {
          wrapper.classList.remove('spin');
          if (typeOrError === 'error' || typeOrError === true) {
            iconName = 'alert-circle';
          }
        }
        wrapper.innerHTML = `<i data-lucide="${iconName}"></i>`;
        if (typeof lucide !== 'undefined') {
          lucide.createIcons({
            node: wrapper
          });
        }
        const svgEl = wrapper.querySelector('svg');
        if (svgEl) {
          if (typeOrError === 'loading') {
            svgEl.style.color = 'var(--accent-primary)';
            successToast.style.borderColor = 'var(--accent-primary)';
          } else if (typeOrError === 'error' || typeOrError === true) {
            svgEl.style.color = 'var(--accent-error)';
            successToast.style.borderColor = 'var(--accent-error)';
          } else {
            svgEl.style.color = 'var(--accent-primary)';
            successToast.style.borderColor = 'var(--accent-primary)';
          }
        }
      }

      successToast.classList.add('show');
      if (typeOrError !== 'loading') {
        toastTimeout = setTimeout(() => {
          successToast.classList.remove('show');
          toastTimeout = null;
        }, 4000);
      }
    }
  }

  function updateToastMessage(descText) {
    if (toastMessage) {
      toastMessage.textContent = descText;
    }
  }

  function yieldAndPaint(ms = 100) {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, ms);
      });
    });
  }

  function breathe(ms = 80) {
    return yieldAndPaint(ms);
  }

  // Processing overlay helpers - updates progress ring and compilation steps
  const processingOverlay = document.getElementById('processing-overlay');
  const processingTitle = document.getElementById('processing-title');
  const progressRingBar = document.getElementById('progress-ring-bar');
  const progressRingText = document.getElementById('progress-ring-text');

  let currentProgressValue = 0;
  let progressAnimationInterval = null;

  function setProgressPercent(targetPercent, animate = true) {
    if (progressRingBar) {
      const radius = 34;
      const circumference = 2 * Math.PI * radius; // ~213.628
      const offset = circumference - (targetPercent / 100) * circumference;

      if (!animate) {
        progressRingBar.style.transition = 'none';
      } else {
        progressRingBar.style.transition = 'stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      }

      progressRingBar.style.strokeDashoffset = offset;

      if (!animate) {
        // Force reflow to clear transitons immediately
        progressRingBar.getBoundingClientRect();
      }
    }

    if (progressRingText) {
      if (progressAnimationInterval) {
        cancelAnimationFrame(progressAnimationInterval);
      }

      if (!animate) {
        progressRingText.textContent = `${targetPercent}%`;
        currentProgressValue = targetPercent;
      } else {
        const duration = 500; // Matches CSS transition duration
        const startValue = currentProgressValue;
        const startTime = performance.now();

        function updateCounter(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
          const currentValue = Math.round(startValue + ease * (targetPercent - startValue));

          progressRingText.textContent = `${currentValue}%`;
          currentProgressValue = currentValue;

          if (progress < 1) {
            progressAnimationInterval = requestAnimationFrame(updateCounter);
          } else {
            progressRingText.textContent = `${targetPercent}%`;
            currentProgressValue = targetPercent;
          }
        }

        progressAnimationInterval = requestAnimationFrame(updateCounter);
      }
    } else {
      currentProgressValue = targetPercent;
    }
  }

  function setStepState(stepId, state) {
    const el = document.getElementById(stepId);
    if (!el) return;
    el.classList.remove('pending', 'current', 'done');
    el.classList.add(state);
  }

  function showProcessing(titleText, packageLabelText) {
    if (processingTitle) processingTitle.textContent = titleText;

    const packageLabel = document.getElementById('step-package-label');
    if (packageLabel && packageLabelText) {
      packageLabel.textContent = packageLabelText;
    }

    setStepState('step-prepare', 'pending');
    setStepState('step-render-front', 'pending');
    setStepState('step-render-back', 'pending');
    setStepState('step-package', 'pending');

    currentProgressValue = 0;
    if (progressAnimationInterval) {
      cancelAnimationFrame(progressAnimationInterval);
    }
    setProgressPercent(0, false); // Reset to 0% instantly without animation

    if (processingOverlay) processingOverlay.classList.add('active');
  }

  function hideProcessing() {
    if (processingOverlay) processingOverlay.classList.remove('active');
  }

  let selectedAvatarBlob = null;
  let cloudinaryAvatarUrl = '';

  function compressAvatar(dataUrl, callback) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 100;

      const size = Math.min(img.width, img.height);
      const sourceX = (img.width - size) / 2;
      const sourceY = (img.height - size) / 2;

      canvas.width = maxDim;
      canvas.height = maxDim;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, maxDim, maxDim);

      const compressedUrl = canvas.toDataURL('image/jpeg', 0.6);
      const base64Data = compressedUrl.split(',')[1];
      callback(base64Data);
    };
    img.src = dataUrl;
  }

  let isUploadingAvatar = false;
  let isUploadingEnrollment = false;
  let selectedFileForCrop = null;

  let firestoreDb = null;
  if (window.ENV && window.ENV.FIREBASE_CONFIG && typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.ENV.FIREBASE_CONFIG);
      }
      firestoreDb = firebase.firestore();
      console.log("Firebase & Firestore initialized successfully.");
    } catch (e) {
      console.error("Firebase/Firestore initialization failed:", e);
    }
  }

  const DB = {
    getFirebaseUrl() {
      return (window.ENV && window.ENV.FIREBASE_URL) ? window.ENV.FIREBASE_URL.replace(/\/$/, '') : null;
    },

    async saveMember(member) {
      // Always save locally first for instant access
      const members = this.getLocalMembers();
      members[member.k] = member;
      localStorage.setItem('aether_lms_members', JSON.stringify(members));

      if (firestoreDb) {
        firestoreDb.collection('members').doc(member.k).set(member)
          .then(() => console.log("Member saved to Firestore:", member.k))
          .catch(err => console.warn('Firestore set failed:', err));
      }

      const firebaseUrl = this.getFirebaseUrl();
      if (firebaseUrl) {
        fetch(`${firebaseUrl}/members/${member.k}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member)
        })
          .then(response => {
            if (!response.ok) console.warn('Firebase REST save failed with status:', response.status);
          })
          .catch(err => console.warn('Firebase REST save failed:', err));
      }

      return member;
    },

    async getMember(key) {
      const localMembers = this.getLocalMembers();
      if (localMembers[key]) {
        return localMembers[key];
      }

      if (firestoreDb) {
        try {
          const doc = await Promise.race([
            firestoreDb.collection('members').doc(key).get(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore request timeout')), 1500))
          ]);
          if (doc.exists) {
            const data = doc.data();
            if (data) {
              localMembers[key] = data;
              localStorage.setItem('aether_lms_members', JSON.stringify(localMembers));
              return data;
            }
          }
        } catch (err) {
          console.warn('Firestore get failed or timed out:', err);
        }
      }

      const firebaseUrl = this.getFirebaseUrl();
      if (firebaseUrl) {
        try {
          const response = await Promise.race([
            fetch(`${firebaseUrl}/members/${key}.json`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('REST request timeout')), 1500))
          ]);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              // Cache locally
              localMembers[key] = data;
              localStorage.setItem('aether_lms_members', JSON.stringify(localMembers));
              return data;
            }
          }
        } catch (err) {
          console.warn('Firebase REST get failed or timed out:', err);
        }
      }
      return null;
    },

    async deleteMember(key) {
      const members = this.getLocalMembers();
      delete members[key];
      localStorage.setItem('aether_lms_members', JSON.stringify(members));

      if (firestoreDb) {
        firestoreDb.collection('members').doc(key).delete()
          .then(() => console.log("Member deleted from Firestore:", key))
          .catch(err => console.warn('Firestore delete failed:', err));
      }

      const firebaseUrl = this.getFirebaseUrl();
      if (firebaseUrl) {
        fetch(`${firebaseUrl}/members/${key}.json`, {
          method: 'DELETE'
        })
          .then(response => {
            if (!response.ok) console.warn('Firebase REST delete failed with status:', response.status);
          })
          .catch(err => console.warn('Firebase REST delete failed:', err));
      }
    },

    async getAllMembers() {

      if (firestoreDb) {
        try {
          const snapshot = await firestoreDb.collection('members').get();
          const members = {};
          snapshot.forEach(doc => {
            members[doc.id] = doc.data();
          });
          return members;
        } catch (err) {
          console.error('Firestore fetch failed:', err);
          throw err;
        }
      }

      const firebaseUrl = this.getFirebaseUrl();
      if (firebaseUrl) {
        try {
          const response = await fetch(`${firebaseUrl}/members.json`);
          if (!response.ok) throw new Error('Firebase REST fetch failed');
          const data = await response.json();
          return data || {};
        } catch (err) {
          console.warn('Firebase REST fetch failed, reading from LocalStorage:', err);
        }
      }

      return this.getLocalMembers();
    },

    getLocalMembers() {
      try {
        return JSON.parse(localStorage.getItem('aether_lms_members')) || {};
      } catch (e) {
        return {};
      }
    }
  };

  const cropModal = document.getElementById('crop-modal');
  const cropSourceImage = document.getElementById('crop-source-image');
  const cropZoomSlider = document.getElementById('crop-zoom-slider');
  const cropZoomLabel = document.getElementById('crop-zoom-label');
  const btnApplyCrop = document.getElementById('btn-apply-crop');
  const btnCancelCrop = document.getElementById('btn-cancel-crop');
  const btnCloseCropModal = document.getElementById('btn-close-crop-modal');
  const cropContainer = document.querySelector('.crop-container');

  let cropState = {
    zoom: 1,
    baseScale: 1,
    posX: 0,
    posY: 0,
    isDragging: false,
    startX: 0,
    startY: 0
  };

  function openCropModal(imageSrc) {
    if (!cropModal || !cropSourceImage) return;
    cropSourceImage.src = imageSrc;
    cropSourceImage.onload = () => {
      const imgW = cropSourceImage.naturalWidth;
      const imgH = cropSourceImage.naturalHeight;
      const minScale = 180 / Math.min(imgW, imgH);

      cropState.baseScale = minScale;
      cropState.zoom = 1;
      cropState.posX = 0;
      cropState.posY = 0;

      if (cropZoomSlider) {
        cropZoomSlider.value = 1;
      }
      if (cropZoomLabel) {
        cropZoomLabel.textContent = '1.0x';
      }

      cropSourceImage.style.display = 'block';
      cropModal.style.display = 'flex';

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      setTimeout(() => {
        updateCropImageTransform();
        cropModal.classList.add('open');
      }, 50);
    };
  }

  function closeCropModal() {
    if (!cropModal) return;
    cropModal.classList.remove('open');
    setTimeout(() => {
      cropModal.style.display = 'none';
      if (cropSourceImage) {
        cropSourceImage.src = '';
        cropSourceImage.style.display = 'none';
      }
    }, 350);
  }

  function updateCropImageTransform() {
    if (!cropSourceImage || !cropContainer) return;
    const scale = cropState.baseScale * cropState.zoom;
    const containerW = cropContainer.clientWidth || 390;
    const containerH = cropContainer.clientHeight || 300;

    const w = cropSourceImage.naturalWidth * scale;
    const h = cropSourceImage.naturalHeight * scale;

    cropSourceImage.style.width = `${w}px`;
    cropSourceImage.style.height = `${h}px`;

    const left = (containerW - w) / 2 + cropState.posX;
    const top = (containerH - h) / 2 + cropState.posY;

    cropSourceImage.style.left = `${left}px`;
    cropSourceImage.style.top = `${top}px`;
  }

  if (cropContainer) {
    cropContainer.addEventListener('mousedown', (e) => {
      cropState.isDragging = true;
      cropState.startX = e.clientX - cropState.posX;
      cropState.startY = e.clientY - cropState.posY;
      cropContainer.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!cropState.isDragging) return;
      cropState.posX = e.clientX - cropState.startX;
      cropState.posY = e.clientY - cropState.startY;

      const scale = cropState.baseScale * cropState.zoom;
      const w = cropSourceImage.naturalWidth * scale;
      const h = cropSourceImage.naturalHeight * scale;

      const limitX = Math.max(0, (w - 180) / 2);
      const limitY = Math.max(0, (h - 180) / 2);

      cropState.posX = Math.max(-limitX, Math.min(limitX, cropState.posX));
      cropState.posY = Math.max(-limitY, Math.min(limitY, cropState.posY));

      updateCropImageTransform();
    });

    window.addEventListener('mouseup', () => {
      if (cropState.isDragging) {
        cropState.isDragging = false;
        cropContainer.style.cursor = 'move';
      }
    });

    cropContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        cropState.isDragging = true;
        cropState.startX = e.touches[0].clientX - cropState.posX;
        cropState.startY = e.touches[0].clientY - cropState.posY;
      }
    });

    cropContainer.addEventListener('touchmove', (e) => {
      if (!cropState.isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      cropState.posX = e.touches[0].clientX - cropState.startX;
      cropState.posY = e.touches[0].clientY - cropState.startY;

      const scale = cropState.baseScale * cropState.zoom;
      const w = cropSourceImage.naturalWidth * scale;
      const h = cropSourceImage.naturalHeight * scale;

      const limitX = Math.max(0, (w - 180) / 2);
      const limitY = Math.max(0, (h - 180) / 2);

      cropState.posX = Math.max(-limitX, Math.min(limitX, cropState.posX));
      cropState.posY = Math.max(-limitY, Math.min(limitY, cropState.posY));

      updateCropImageTransform();
    }, { passive: false });

    cropContainer.addEventListener('touchend', () => {
      cropState.isDragging = false;
    });

    cropContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomStep = 0.05;
      let newZoom = cropState.zoom + (e.deltaY < 0 ? zoomStep : -zoomStep);
      newZoom = Math.max(1, Math.min(3, newZoom));

      cropState.zoom = newZoom;
      if (cropZoomSlider) {
        cropZoomSlider.value = newZoom;
      }
      if (cropZoomLabel) {
        cropZoomLabel.textContent = `${newZoom.toFixed(1)}x`;
      }

      const scale = cropState.baseScale * cropState.zoom;
      const w = cropSourceImage.naturalWidth * scale;
      const h = cropSourceImage.naturalHeight * scale;

      const limitX = Math.max(0, (w - 180) / 2);
      const limitY = Math.max(0, (h - 180) / 2);

      cropState.posX = Math.max(-limitX, Math.min(limitX, cropState.posX));
      cropState.posY = Math.max(-limitY, Math.min(limitY, cropState.posY));

      updateCropImageTransform();
    }, { passive: false });
  }

  if (cropZoomSlider) {
    cropZoomSlider.addEventListener('input', (e) => {
      cropState.zoom = parseFloat(e.target.value);
      if (cropZoomLabel) {
        cropZoomLabel.textContent = `${cropState.zoom.toFixed(1)}x`;
      }

      const scale = cropState.baseScale * cropState.zoom;
      const w = cropSourceImage.naturalWidth * scale;
      const h = cropSourceImage.naturalHeight * scale;

      const limitX = Math.max(0, (w - 180) / 2);
      const limitY = Math.max(0, (h - 180) / 2);

      cropState.posX = Math.max(-limitX, Math.min(limitX, cropState.posX));
      cropState.posY = Math.max(-limitY, Math.min(limitY, cropState.posY));

      updateCropImageTransform();
    });
  }

  if (btnApplyCrop) {
    btnApplyCrop.addEventListener('click', () => {
      const scale = cropState.baseScale * cropState.zoom;
      const containerW = cropContainer.clientWidth || 390;
      const containerH = cropContainer.clientHeight || 300;

      const imgW = cropSourceImage.naturalWidth * scale;
      const imgH = cropSourceImage.naturalHeight * scale;

      const offsetX = (imgW - 180) / 2 - cropState.posX;
      const offsetY = (imgH - 180) / 2 - cropState.posY;

      const sourceX = offsetX / scale;
      const sourceY = offsetY / scale;
      const sourceW = 180 / scale;
      const sourceH = 180 / scale;

      const canvas = document.createElement('canvas');
      canvas.width = sourceW;
      canvas.height = sourceH;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        cropSourceImage,
        sourceX, sourceY, sourceW, sourceH,
        0, 0, sourceW, sourceH
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          showToast('Crop Failed', 'Could not generate photo crop.', 'error');
          return;
        }

        selectedAvatarBlob = blob;

        if (previewAvatar) {
          previewAvatar.src = URL.createObjectURL(blob);
        }
        if (previewAvatarContainer) {
          previewAvatarContainer.classList.add('has-image');
        }

        saveFormDraft();

        closeCropModal();

        labelFile.textContent = selectedFileForCrop ? selectedFileForCrop.name : 'avatar.jpg';
        showToast('Photo Adjusted', 'Student photo preview updated.', 'success');
      }, 'image/jpeg', 0.95);
    });
  }

  if (btnCancelCrop) {
    btnCancelCrop.addEventListener('click', () => {
      closeCropModal();
      inputAvatar.value = '';
    });
  }

  if (btnCloseCropModal) {
    btnCloseCropModal.addEventListener('click', () => {
      closeCropModal();
      inputAvatar.value = '';
    });
  }

  if (inputAvatar) {
    inputAvatar.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const maxSize = 1048576;
        if (file.size > maxSize) {
          showToast('File Too Large', 'Student photo must be less than 1MB.', true);
          inputAvatar.value = '';
          resetAvatarPreview();
          return;
        }
        selectedFileForCrop = file;
        const reader = new FileReader();
        reader.onload = (event) => {
          openCropModal(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        resetAvatarPreview();
      }
    });
  }

  function resetAvatarPreview() {
    if (previewAvatar) {
      previewAvatar.src = '';
    }
    if (previewAvatarContainer) {
      previewAvatarContainer.classList.remove('has-image');
    }
    dropzoneAvatar.classList.remove('has-file');
    labelFile.textContent = 'Choose image or drag here';
    selectedAvatarBlob = null;
    cloudinaryAvatarUrl = '';
    isUploadingAvatar = false;
    selectedFileForCrop = null;
    saveFormDraft();
  }

  if (dropzoneAvatar) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzoneAvatar.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzoneAvatar.style.borderColor = 'var(--accent-secondary)';
        dropzoneAvatar.style.background = 'rgba(139, 92, 246, 0.04)';
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
        if (inputAvatar) {
          inputAvatar.files = dt.files;
          const event = new Event('change');
          inputAvatar.dispatchEvent(event);
        }
      }
    });
  }

  let cloudinaryEnrollmentUrl = '';
  let selectedEnrollmentFile = null;

  if (inputEnrollment && dropzoneEnrollment && labelEnrollmentFile) {
    inputEnrollment.addEventListener('change', (e) => {
      
      const file = e.target.files[0];
      if (file) {
        const maxSize = 1048576;
        if (file.size > maxSize) {
          showToast('File Too Large', 'Enrollment proof must be less than 1MB.', true);
          inputEnrollment.value = '';
          cloudinaryEnrollmentUrl = '';
          selectedEnrollmentFile = null;
          dropzoneEnrollment.classList.remove('has-file');
          labelEnrollmentFile.textContent = 'Choose PDF or Image';
          return;
        }
        dropzoneEnrollment.classList.add('has-file');
        labelEnrollmentFile.textContent = file.name;
        selectedEnrollmentFile = file;
        showToast('Document Attached', 'Enrollment proof selected.', 'success');
        saveFormDraft();
      } else {
        cloudinaryEnrollmentUrl = '';
        selectedEnrollmentFile = null;
        dropzoneEnrollment.classList.remove('has-file');
        labelEnrollmentFile.textContent = 'Choose PDF or Image';
        saveFormDraft();
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzoneEnrollment.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzoneEnrollment.style.borderColor = 'var(--accent-secondary)';
        dropzoneEnrollment.style.background = 'rgba(139, 92, 246, 0.04)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzoneEnrollment.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzoneEnrollment.style.borderColor = '';
        dropzoneEnrollment.style.background = '';
      }, false);
    });

    dropzoneEnrollment.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      if (file) {
        inputEnrollment.files = dt.files;
        const event = new Event('change');
        inputEnrollment.dispatchEvent(event);
      }
    });
  }

  let isFlipping = false;

  const handleTiltMove = (e, container) => {
    if (isFlipping) return;

    libraryCard.style.transition = 'none';

    const cardRect = container.getBoundingClientRect();

    const x = e.clientX - cardRect.left;
    const y = e.clientY - cardRect.top;

    const px = (x / cardRect.width) - 0.5;
    const py = (y / cardRect.height) - 0.5;

    const rotateY = px * 20;
    const rotateX = -py * 20;

    const isFlipped = libraryCard.classList.contains('flipped');
    const baseRotationY = isFlipped ? 180 : 0;

    libraryCard.style.transform = `rotateX(${rotateX}deg) rotateY(${baseRotationY + rotateY}deg)`;

    libraryCard.style.setProperty('--hologram-pos', `${x / cardRect.width * 100}% ${y / cardRect.height * 100}%`);

    const shineOverlays = libraryCard.querySelectorAll('.library-card-glow');
    shineOverlays.forEach(overlay => {
      overlay.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`;
    });
  };

  const handleTiltLeave = () => {
    if (isFlipping) return;

    libraryCard.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

    const isFlipped = libraryCard.classList.contains('flipped');
    libraryCard.style.transform = `rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg)`;
    const shineOverlays = libraryCard.querySelectorAll('.library-card-glow');
    shineOverlays.forEach(overlay => {
      overlay.style.background = `radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--user-card-theme, var(--accent-primary)) 8%, transparent) 0%, transparent 50%)`;
    });
  };

  if (cardPerspective) {
    cardPerspective.addEventListener('mousemove', (e) => handleTiltMove(e, cardPerspective));
    cardPerspective.addEventListener('mouseleave', handleTiltLeave);
  }



  if (btnReset) {
    btnReset.addEventListener('click', () => {
      localStorage.removeItem('aether_lms_form_draft');
      localStorage.removeItem('lms-card-theme-color');

      setTimeout(() => {
        if (previewName) previewName.textContent = DEFAULTS.name;
        if (previewEmail) previewEmail.textContent = DEFAULTS.email;
        if (previewPhone) previewPhone.textContent = DEFAULTS.phone;
        if (previewTier) {
          previewTier.className = 'card-type tier-standard';
          previewTier.innerHTML = `<i data-lucide="shield"></i><span>Standard</span>`;
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }

        if (previewLimit) previewLimit.textContent = `${DEFAULTS.limit} BOOK${DEFAULTS.limit > 1 ? 'S' : ''}`;
        if (labelLimitValue) labelLimitValue.textContent = DEFAULTS.limit;
        updateSliderTicks(DEFAULTS.limit);
        updateSliderProgress(inputBorrowLimit);

        if (previewTerm) previewTerm.textContent = DEFAULTS.term;

        if (labelColorHex) labelColorHex.textContent = DEFAULTS.theme;
        if (libraryCard) libraryCard.style.setProperty('--user-card-theme', DEFAULTS.theme);
        document.documentElement.style.setProperty('--accent-primary', DEFAULTS.theme);

        resetAvatarPreview();
        generateCardKey();
        isCardCreated = false;
        updateSubmitButtonText();
        updateCardActionsVisibility();

        if (form) {
          const controls = form.querySelectorAll('.input-control');
          controls.forEach(control => {
            control.style.borderColor = '';
            control.style.boxShadow = '';
          });
        }

        if (deptSelect) deptSelect.reset();
        if (semesterSelect) semesterSelect.reset();
        if (degreeLevelSelect) degreeLevelSelect.reset();
        if (campusSelect) campusSelect.reset();
        if (genderSelect) genderSelect.reset();
        if (bloodGroupSelect) bloodGroupSelect.reset();
        if (membershipTypeSelect) membershipTypeSelect.reset();
        if (preferredBranchSelect) preferredBranchSelect.reset();
        if (borrowingCategorySelect) borrowingCategorySelect.reset();
        if (preferredContactSelect) preferredContactSelect.reset();

        const deptTrigger = document.getElementById('custom-select-trigger-dept');
        if (deptTrigger) deptTrigger.style.borderColor = '';
        const semesterTrigger = document.getElementById('custom-select-trigger-semester');
        if (semesterTrigger) semesterTrigger.style.borderColor = '';
        const degreeLevelTrigger = document.getElementById('custom-select-trigger-degree-level');
        if (degreeLevelTrigger) degreeLevelTrigger.style.borderColor = '';
        const campusTrigger = document.getElementById('custom-select-trigger-campus');
        if (campusTrigger) campusTrigger.style.borderColor = '';
        const genderTrigger = document.getElementById('custom-select-trigger-gender');
        if (genderTrigger) genderTrigger.style.borderColor = '';
        const bloodGroupTrigger = document.getElementById('custom-select-trigger-blood-group');
        if (bloodGroupTrigger) bloodGroupTrigger.style.borderColor = '';
        const membershipTypeTrigger = document.getElementById('custom-select-trigger-membership-type');
        if (membershipTypeTrigger) membershipTypeTrigger.style.borderColor = '';
        const preferredBranchTrigger = document.getElementById('custom-select-trigger-preferred-branch');
        if (preferredBranchTrigger) preferredBranchTrigger.style.borderColor = '';
        const borrowingCategoryTrigger = document.getElementById('custom-select-trigger-borrowing-category');
        if (borrowingCategoryTrigger) borrowingCategoryTrigger.style.borderColor = '';
        const preferredContactTrigger = document.getElementById('custom-select-trigger-preferred-contact');
        if (preferredContactTrigger) preferredContactTrigger.style.borderColor = '';

        const previewDeptEl = document.getElementById('preview-dept');
        if (previewDeptEl) previewDeptEl.textContent = 'DEPT N/A';
        const previewSemEl = document.getElementById('preview-semester');
        if (previewSemEl) previewSemEl.textContent = 'SEMESTER N/A';

        if (inputBatch) {
          inputBatch.value = '';
        }
        const previewBatchEl = document.getElementById('preview-batch');
        if (previewBatchEl) previewBatchEl.textContent = 'BATCH N/A';

        if (dropzoneEnrollment) {
          dropzoneEnrollment.classList.remove('has-file');
        }
        if (labelEnrollmentFile) {
          labelEnrollmentFile.textContent = 'Choose PDF or Image';
        }
        cloudinaryEnrollmentUrl = '';
        selectedEnrollmentFile = null;

        if (dobPicker) dobPicker.reset();
        if (startDatePicker) startDatePicker.reset();
        if (expiryDatePicker) expiryDatePicker.reset();
      }, 50);
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isFormValid = true;

    const requiredInputs = form.querySelectorAll('[required]');
    const validatedRadioNames = new Set();
    requiredInputs.forEach(input => {
      let hasError = false;
      if (input.type === 'checkbox') {
        hasError = !input.checked;
      } else if (input.type === 'radio') {
        if (validatedRadioNames.has(input.name)) return;
        validatedRadioNames.add(input.name);
        const checkedRadio = form.querySelector(`input[name="${input.name}"]:checked`);
        hasError = !checkedRadio;
      } else {
        hasError = !input.value.trim();
      }

      if (hasError) {
        isFormValid = false;
        highlightInputError(input, true);
      } else {
        highlightInputError(input, false);
      }
    });

    if (inputEmail.value.trim() && !validateEmail(inputEmail.value)) {
      isFormValid = false;
      highlightInputError(inputEmail, true);
    }

    if (!isFormValid) {
      const formPanel = document.getElementById('registration-form-panel');
      formPanel.style.animation = 'shake-panel 0.4s ease';
      setTimeout(() => {
        formPanel.style.animation = '';
      }, 400);
      return;
    }

    btnSubmit.classList.add('is-loading');

    // Duplicate validation (excluding current card key)
    let members = {};
    try {
      members = await DB.getAllMembers();
    } catch (err) {
      console.warn("Could not check duplicate info from database:", err);
      members = DB.getLocalMembers();
    }

    const keyVal = previewCardKey ? previewCardKey.textContent : '';
    const currentEmail = inputEmail ? inputEmail.value.trim().toLowerCase() : '';
    const currentStudentId = document.getElementById('student_id') ? document.getElementById('student_id').value.trim().toLowerCase() : '';

    const duplicate = Object.values(members).find(m => {
      if (!m) return false;
      // Skip comparing against own card key (allows updates)
      if (m.k === keyVal) return false;

      const mEmail = (m.e || '').trim().toLowerCase();
      const mStudentId = m.student_info ? (m.student_info.student_id || '').trim().toLowerCase() : '';

      if (currentEmail && mEmail && currentEmail === mEmail) return true;
      if (currentStudentId && mStudentId && currentStudentId === mStudentId) return true;

      return false;
    });

    if (duplicate) {
      // If a member with this email or student ID already exists, we adopt their existing key
      // and allow updates instead of creating a duplicate entry under a new key.
      console.log("Submit: Adopting existing key for matching duplicate member:", duplicate.k);
      if (previewCardKey) {
        previewCardKey.textContent = duplicate.k;
        updateQrCodeElement(duplicate.k);
      }
      isCardCreated = true;
      updateSubmitButtonText();
      updateCardActionsVisibility();
    }

    const isUpdating = isCardCreated;
    if (isUpdating) {
      showToast('Updating Member', 'Saving member record to database...', 'loading');
    } else {
      showToast('Creating Member', 'Registering member to database...', 'loading');
    }

    setTimeout(async () => {
      // Upload avatar to Cloudinary if a new one is selected
      if (selectedAvatarBlob) {
        try {
          updateToastMessage('Saving student photo to cloud...');
          cloudinaryAvatarUrl = await uploadToCloudinary(selectedAvatarBlob);
          selectedAvatarBlob = null; // Clear local data on success
          if (previewAvatar && cloudinaryAvatarUrl) {
            previewAvatar.src = buildAvatarSrc(cloudinaryAvatarUrl);
          }
          saveFormDraft();
        } catch (err) {
          console.error('Cloudinary avatar upload failed:', err);
          showToast('Upload Failed', 'Could not upload student photo. Please try again.', 'error');
          btnSubmit.classList.remove('is-loading');
          return;
        }
      }

      // Upload enrollment proof to Cloudinary if a new one is selected
      if (selectedEnrollmentFile) {
        try {
          updateToastMessage('Saving enrollment proof to cloud...');
          cloudinaryEnrollmentUrl = await uploadToCloudinary(selectedEnrollmentFile);
          selectedEnrollmentFile = null; // Clear local data on success
        } catch (err) {
          console.error('Cloudinary enrollment proof upload failed:', err);
          showToast('Upload Failed', 'Could not upload enrollment proof. Please try again.', 'error');
          btnSubmit.classList.remove('is-loading');
          return;
        }
      }

      btnSubmit.classList.remove('is-loading');

      const first = inputFirstName ? inputFirstName.value.trim() : '';
      const last = inputLastName ? inputLastName.value.trim() : '';
      const nameVal = `${first} ${last}`.trim() || 'Member';
      const tierVal = document.querySelector('input[name="tier"]:checked')?.value || 'Standard';
      const keyVal = previewCardKey.textContent;

      document.getElementById('success-summary-name').textContent = nameVal;
      document.getElementById('success-summary-tier').textContent = tierVal;
      document.getElementById('success-summary-key').textContent = keyVal;

      const deptInput = document.getElementById('department');
      const deptValText = deptInput ? deptInput.value.trim() : 'DEPT';
      const semInput = document.getElementById('semester');
      const semValText = semInput ? semInput.value.trim() : 'SEMESTER';
      const limitValText = previewLimit.textContent;
      const themeValText = libraryCard.style.getPropertyValue('--user-card-theme') || DEFAULTS.theme;
      const addrText = document.getElementById('preview-address') ? document.getElementById('preview-address').textContent : '';

      const emergencyName = document.getElementById('emergency_name') ? document.getElementById('emergency_name').value.trim() : '';
      const emergencyRelationship = document.getElementById('emergency_relationship') ? document.getElementById('emergency_relationship').value.trim() : '';
      const emergencyPhone = document.getElementById('emergency_phone') ? document.getElementById('emergency_phone').value.trim() : '';
      const emergencyAddress = document.getElementById('emergency_address') ? document.getElementById('emergency_address').value.trim() : '';

      const gender = document.getElementById('gender') ? document.getElementById('gender').value : '';
      const bloodGroup = document.getElementById('blood_group') ? document.getElementById('blood_group').value : '';
      const nationality = document.getElementById('nationality') ? document.getElementById('nationality').value.trim() : '';
      const nidPassport = document.getElementById('nid_passport') ? document.getElementById('nid_passport').value.trim() : '';
      const altPhone = document.getElementById('alt_phone') ? document.getElementById('alt_phone').value.trim() : '';
      const permanentAddress = document.getElementById('permanent_address') ? document.getElementById('permanent_address').value.trim() : '';
      const city = document.getElementById('city') ? document.getElementById('city').value.trim() : '';
      const postcode = document.getElementById('postcode') ? document.getElementById('postcode').value.trim() : '';
      const country = document.getElementById('country') ? document.getElementById('country').value.trim() : '';
      const dob = inputDob ? inputDob.value : '';

      const membershipType = document.getElementById('membership_type') ? document.getElementById('membership_type').value : '';
      const preferredBranch = document.getElementById('preferred_branch') ? document.getElementById('preferred_branch').value : '';
      const borrowingCategory = document.getElementById('borrowing_category') ? document.getElementById('borrowing_category').value : '';
      const preferredContact = document.getElementById('preferred_contact') ? document.getElementById('preferred_contact').value : '';
      const cardStatus = document.querySelector('input[name="card_status"]:checked')?.value || 'New Card';

      const researchInterestsArray = [];
      document.querySelectorAll('input[name="interest"]:checked').forEach(cb => {
        researchInterestsArray.push(cb.value);
      });

      const memberRecord = {
        n: nameVal,
        d: (deptValText === 'DEPT' || deptValText === 'Select Department') ? '' : deptValText,
        b: inputBatch ? inputBatch.value : 'Batch 60',
        s: (semValText === 'SEMESTER' || semValText === 'Select Semester') ? '' : semValText,
        e: inputEmail.value.trim() || DEFAULTS.email,
        p: inputPhone.value.trim() || DEFAULTS.phone,
        l: limitValText,
        t: previewTerm.textContent,
        k: keyVal,
        th: themeValText,
        a: (addrText === '' || addrText === 'No specific special clearances or address declared.') ? '' : addrText,
        tr: tierVal,
        av: cloudinaryAvatarUrl,
        ep: cloudinaryEnrollmentUrl || '',

        student_info: {
          first_name: first,
          last_name: last,
          student_id: document.getElementById('student_id') ? document.getElementById('student_id').value.trim() : '',
          degree_level: document.getElementById('degree_level') ? document.getElementById('degree_level').value : '',
          faculty: document.getElementById('faculty') ? document.getElementById('faculty').value.trim() : '',
          program: document.getElementById('program') ? document.getElementById('program').value.trim() : '',
          campus: document.getElementById('campus') ? document.getElementById('campus').value : '',
          advisor: document.getElementById('academic_advisor') ? document.getElementById('academic_advisor').value.trim() : ''
        },
        personal_info: {
          dob: dob,
          gender: gender,
          blood_group: bloodGroup,
          nationality: nationality,
          nid_passport: nidPassport,
          alt_phone: altPhone,
          present_address: inputAddress ? inputAddress.value.trim() : '',
          permanent_address: permanentAddress,
          city: city,
          postcode: postcode,
          country: country
        },
        emergency_contact: {
          name: emergencyName,
          relationship: emergencyRelationship,
          phone: emergencyPhone,
          address: emergencyAddress
        },
        membership_details: {
          type: membershipType,
          branch: preferredBranch,
          category: borrowingCategory,
          interests: researchInterestsArray,
          status: cardStatus,
          contact_method: preferredContact,
          start_date: inputMembershipStart ? inputMembershipStart.value : '',
          expiry_date: inputMembershipExpiry ? inputMembershipExpiry.value : ''
        }
      };

      const successModal = document.getElementById('success-modal');

      updateToastMessage('Saving member record...');
      try {
        await DB.saveMember(memberRecord);
        isCardCreated = true;
        updateSubmitButtonText();
        updateCardActionsVisibility();

        if (isUpdating) {
          showToast('Member Updated', 'Member record updated successfully.', 'success');
        } else {
          showToast('Member Created', 'Member record registered successfully.', 'success');
        }

        if (successModal) {
          successModal.classList.add('open');
        }

        triggerConfetti();
      } catch (dbErr) {
        console.error("Database save failed:", dbErr);
        showToast('Save Failed', 'Could not save member record to database.', 'error');
      }

      const btnSuccessView = document.getElementById('btn-success-view');
      if (btnSuccessView) {
        btnSuccessView.onclick = () => {
          if (successModal) successModal.classList.remove('open');

          const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
          window.location.href = `${baseUrl}pages/share.html#${keyVal}`;
        };
      }

      const btnSuccessClose = document.getElementById('btn-success-close');
      if (btnSuccessClose) {
        btnSuccessClose.onclick = () => {
          if (successModal) successModal.classList.remove('open');
        };
      }
    }, 1600);
  });
  }

  function highlightInputError(input, hasError) {
    let target = input;
    if (input.tagName === 'SELECT') {
      target = input.closest('.custom-select-wrapper') ? input.closest('.custom-select-wrapper').querySelector('.custom-select-trigger') : input;
    }
    if (input.type === 'radio') {
      const group = input.closest('.radio-card-group');
      if (group) {
        const radioCards = group.querySelectorAll('.custom-radio-card');
        radioCards.forEach(card => {
          if (hasError) {
            card.style.borderColor = 'var(--accent-error)';
          } else {
            card.style.borderColor = '';
          }
        });
      }
      return;
    }
    if (hasError) {
      target.style.borderColor = 'var(--accent-error)';
    } else {
      target.style.borderColor = '';
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.custom-select-wrapper, .custom-datepicker-wrapper').forEach(wrapper => {
      wrapper.classList.remove('open');
      wrapper.classList.remove('open-top');
    });
  }

  const deptSelect = setupCustomSelect({
    wrapperId: 'custom-select-dept',
    triggerId: 'custom-select-trigger-dept',
    valueId: 'custom-select-value-dept',
    optionsContainerId: 'custom-select-options-dept',
    hiddenSelectId: 'department',
    defaultValue: '',
    placeholderText: 'Select Department',
    hasSearch: true,
    searchPlaceholder: 'Search department...',
    onChange: (val) => {
      
      const el = document.getElementById('preview-dept');
      if (el) el.textContent = val ? val.toUpperCase() : 'DEPT N/A';
    }
  });

  const semesterSelect = setupCustomSelect({
    wrapperId: 'custom-select-semester',
    triggerId: 'custom-select-trigger-semester',
    valueId: 'custom-select-value-semester',
    optionsContainerId: 'custom-select-options-semester',
    hiddenSelectId: 'semester',
    defaultValue: '',
    placeholderText: 'Select Semester',
    hasSearch: true,
    searchPlaceholder: 'Search semester...',
    onChange: (val) => {
      
      const el = document.getElementById('preview-semester');
      if (el) el.textContent = val ? val.toUpperCase() : 'SEMESTER N/A';
    }
  });

  const degreeLevelSelect = setupCustomSelect({
    wrapperId: 'custom-select-degree-level',
    triggerId: 'custom-select-trigger-degree-level',
    valueId: 'custom-select-value-degree-level',
    optionsContainerId: 'custom-select-options-degree-level',
    hiddenSelectId: 'degree_level',
    defaultValue: '',
    placeholderText: 'Select level'
  });

  const campusSelect = setupCustomSelect({
    wrapperId: 'custom-select-campus',
    triggerId: 'custom-select-trigger-campus',
    valueId: 'custom-select-value-campus',
    optionsContainerId: 'custom-select-options-campus',
    hiddenSelectId: 'campus',
    defaultValue: 'Main Campus',
    placeholderText: 'Main Campus'
  });

  const genderSelect = setupCustomSelect({
    wrapperId: 'custom-select-gender',
    triggerId: 'custom-select-trigger-gender',
    valueId: 'custom-select-value-gender',
    optionsContainerId: 'custom-select-options-gender',
    hiddenSelectId: 'gender',
    defaultValue: '',
    placeholderText: 'Select'
  });

  const bloodGroupSelect = setupCustomSelect({
    wrapperId: 'custom-select-blood-group',
    triggerId: 'custom-select-trigger-blood-group',
    valueId: 'custom-select-value-blood-group',
    optionsContainerId: 'custom-select-options-blood-group',
    hiddenSelectId: 'blood_group',
    defaultValue: '',
    placeholderText: 'Select'
  });

  const membershipTypeSelect = setupCustomSelect({
    wrapperId: 'custom-select-membership-type',
    triggerId: 'custom-select-trigger-membership-type',
    valueId: 'custom-select-value-membership-type',
    optionsContainerId: 'custom-select-options-membership-type',
    hiddenSelectId: 'membership_type',
    defaultValue: '',
    placeholderText: 'Select type'
  });

  const preferredBranchSelect = setupCustomSelect({
    wrapperId: 'custom-select-preferred-branch',
    triggerId: 'custom-select-trigger-preferred-branch',
    valueId: 'custom-select-value-preferred-branch',
    optionsContainerId: 'custom-select-options-preferred-branch',
    hiddenSelectId: 'preferred_branch',
    defaultValue: '',
    placeholderText: 'Select branch'
  });

  const borrowingCategorySelect = setupCustomSelect({
    wrapperId: 'custom-select-borrowing-category',
    triggerId: 'custom-select-trigger-borrowing-category',
    valueId: 'custom-select-value-borrowing-category',
    optionsContainerId: 'custom-select-options-borrowing-category',
    hiddenSelectId: 'borrowing_category',
    defaultValue: 'General Collection',
    placeholderText: 'General Collection'
  });

  const preferredContactSelect = setupCustomSelect({
    wrapperId: 'custom-select-preferred-contact',
    triggerId: 'custom-select-trigger-preferred-contact',
    valueId: 'custom-select-value-preferred-contact',
    optionsContainerId: 'custom-select-options-preferred-contact',
    hiddenSelectId: 'preferred_contact',
    defaultValue: 'Email',
    placeholderText: 'Email'
  });

  if (inputBatch) {
    inputBatch.addEventListener('input', (e) => {
      
      const el = document.getElementById('preview-batch');
      if (el) el.textContent = e.target.value.trim().toUpperCase() || 'BATCH N/A';
    });
  }

  const inputSemester = document.getElementById('semester');
  if (inputSemester) {
    inputSemester.addEventListener('input', (e) => {
      
      const el = document.getElementById('preview-semester');
      if (el) el.textContent = e.target.value.trim().toUpperCase() || 'SEMESTER N/A';
    });
  }

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

  // --- Form Draft Persistence ---
  let blockAutosave = true;

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  function saveFormDraft() {
    if (!form) return;
    if (blockAutosave) {
      console.log("saveFormDraft: autosave is currently blocked. Skipping save.");
      return;
    }
    

    const draft = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.type === 'file') return;
      const name = input.name || input.id;
      if (!name) return;

      if (input.type === 'checkbox') {
        if (input.name === 'interest') {
          if (!draft[name]) draft[name] = [];
          if (input.checked) {
            draft[name].push(input.value);
          }
        } else {
          draft[name] = input.checked;
        }
      } else if (input.type === 'radio') {
        if (input.checked) {
          draft[name] = input.value;
        }
      } else {
        draft[name] = input.value;
      }
    });

    if (cloudinaryAvatarUrl) {
      draft['cloudinaryAvatarUrl'] = cloudinaryAvatarUrl;
    }
    if (cloudinaryEnrollmentUrl) {
      draft['cloudinaryEnrollmentUrl'] = cloudinaryEnrollmentUrl;
    }
    if (previewCardKey && previewCardKey.textContent) {
      draft['card_key'] = previewCardKey.textContent;
    }

    console.log("saveFormDraft: saving draft to localStorage", draft);

    try {
      localStorage.setItem('aether_lms_form_draft', JSON.stringify(draft));
    } catch (e) {
      console.warn('Failed to save draft to localStorage:', e);
    }
  }

  function restoreFormDraft() {
    if (!form) return;
    let rawDraft = null;
    try {
      rawDraft = localStorage.getItem('aether_lms_form_draft');
    } catch (e) {
      console.warn('Failed to read draft from localStorage:', e);
    }
    console.log("restoreFormDraft: rawDraft read =", rawDraft);
    if (!rawDraft) return;

    let draft = null;
    try {
      draft = JSON.parse(rawDraft);
    } catch (e) {
      console.error('Failed to parse draft:', e);
      return;
    }
    if (!draft) return;

    console.log("restoreFormDraft: Restoring fields into DOM...");

    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.type === 'file') return;
      const name = input.name || input.id;
      if (!name || !(name in draft)) return;

      if (input.type === 'checkbox') {
        if (input.name === 'interest') {
          input.checked = Array.isArray(draft[name]) && draft[name].includes(input.value);
        } else {
          input.checked = !!draft[name];
        }
      } else if (input.type === 'radio') {
        input.checked = (input.value === draft[name]);
      } else {
        input.value = draft[name];
      }
    });

    if (draft['cloudinaryAvatarUrl']) {
      cloudinaryAvatarUrl = draft['cloudinaryAvatarUrl'];
      if (previewAvatar) {
        previewAvatar.src = buildAvatarSrc(cloudinaryAvatarUrl);
      }
      if (previewAvatarContainer) {
        previewAvatarContainer.classList.add('has-image');
      }
    }
    if (draft['cloudinaryEnrollmentUrl']) {
      cloudinaryEnrollmentUrl = draft['cloudinaryEnrollmentUrl'];
      if (dropzoneEnrollment) {
        dropzoneEnrollment.classList.add('has-file');
      }
      if (labelEnrollmentFile) {
        const match = cloudinaryEnrollmentUrl.match(/\/([^\/]+)$/);
        labelEnrollmentFile.textContent = match ? match[1] : 'Document Attached';
      }
    }
    if (draft['card_key']) {
      if (previewCardKey) {
        previewCardKey.textContent = draft['card_key'];
        updateQrCodeElement(draft['card_key']);
      }
      const localMembers = DB.getLocalMembers();
      if (localMembers[draft['card_key']]) {
        isCardCreated = true;
        updateSubmitButtonText();
        updateCardActionsVisibility();
      }
    }

    if (draft['dob'] && dobPicker) {
      const parts = draft['dob'].split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        dobPicker.selectDate(d);
      }
    }
    if (draft['membership_start'] && startDatePicker) {
      const parts = draft['membership_start'].split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        startDatePicker.selectDate(d);
      }
    }
    if (draft['membership_expiry'] && expiryDatePicker) {
      const parts = draft['membership_expiry'].split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        expiryDatePicker.selectDate(d);
      }
    }

    inputs.forEach(input => {
      if (input.id === 'dob' || input.id === 'membership_start' || input.id === 'membership_expiry') return;
      if (input.type === 'file') return;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('change'));
    });

    console.log("restoreFormDraft: restoration complete");
  }

  // Restore draft before adding auto-save event listeners
  restoreFormDraft();

  if (form) {
    form.addEventListener('input', debounce(saveFormDraft, 500));
    form.addEventListener('change', saveFormDraft);
  }

  const demoAutofillBtn = document.getElementById('demo-autofill-btn');
  if (demoAutofillBtn) {
    demoAutofillBtn.addEventListener('click', () => {
      // 1. Names
      const firstNames = ['Aria', 'Ethan', 'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Lucas', 'Sophia', 'Mason', 'Isabella', 'Logan', 'Mia', 'Sajid', 'Anik', 'Nabil', 'Tasnim', 'Fariha', 'Zeeshan'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Debnath', 'Hasan', 'Rahman', 'Islam', 'Ahmed', 'Chowdhury', 'Roy'];
      const first = firstNames[Math.floor(Math.random() * firstNames.length)];
      const last = lastNames[Math.floor(Math.random() * lastNames.length)];

      if (inputFirstName) {
        inputFirstName.value = first;
        inputFirstName.dispatchEvent(new Event('input'));
        highlightInputError(inputFirstName, false);
      }
      if (inputLastName) {
        inputLastName.value = last;
        inputLastName.dispatchEvent(new Event('input'));
        highlightInputError(inputLastName, false);
      }

      // 2. Student ID
      const studentIdInput = document.getElementById('student_id');
      if (studentIdInput) {
        const randId = `LIB-2026-${Math.floor(100 + Math.random() * 900)}`;
        studentIdInput.value = randId;
        studentIdInput.dispatchEvent(new Event('input'));
        highlightInputError(studentIdInput, false);
      }

      // 3. Email & Phone
      if (inputEmail) {
        inputEmail.value = `${first.toLowerCase()}.${last.toLowerCase()}@university.edu`;
        inputEmail.dispatchEvent(new Event('input'));
        highlightInputError(inputEmail, false);
      }
      if (inputPhone) {
        inputPhone.value = `+880 1${Math.floor(5 + Math.random() * 5)}${Math.floor(10000000 + Math.random() * 90000000)}`;
        inputPhone.dispatchEvent(new Event('input'));
        highlightInputError(inputPhone, false);
      }

      // 4. Custom Selects
      if (degreeLevelSelect) {
        const levels = ['BSc', 'MSc', 'PhD', 'Other'];
        degreeLevelSelect.setValue(levels[Math.floor(Math.random() * levels.length)]);
        const degTrigger = document.getElementById('custom-select-trigger-degree-level');
        if (degTrigger) degTrigger.style.borderColor = '';
      }

      const facultyInput = document.getElementById('faculty');
      const faculties = ['Faculty of Science & Information Technology', 'Faculty of Engineering', 'Faculty of Business Administration', 'Faculty of Arts & Social Sciences'];
      const chosenFaculty = faculties[Math.floor(Math.random() * faculties.length)];
      if (facultyInput) {
        facultyInput.value = chosenFaculty;
        facultyInput.dispatchEvent(new Event('input'));
        highlightInputError(facultyInput, false);
      }

      if (deptSelect) {
        const depts = ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Business Administration', 'English', 'Mathematics'];
        deptSelect.setValue(depts[Math.floor(Math.random() * depts.length)]);
        const deptTrigger = document.getElementById('custom-select-trigger-dept');
        if (deptTrigger) deptTrigger.style.borderColor = '';
      }

      const programInput = document.getElementById('program');
      if (programInput) {
        const programs = ['BSc in CSE', 'BSc in SWE', 'BSc in EEE', 'BBA', 'BA in English', 'MSc in CS'];
        programInput.value = programs[Math.floor(Math.random() * programs.length)];
        programInput.dispatchEvent(new Event('input'));
        highlightInputError(programInput, false);
      }

      if (inputSemester) {
        const semesters = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];
        inputSemester.value = semesters[Math.floor(Math.random() * semesters.length)];
        inputSemester.dispatchEvent(new Event('input'));
        highlightInputError(inputSemester, false);
      }

      if (inputBatch) {
        inputBatch.value = `Batch ${Math.floor(50 + Math.random() * 15)}`;
        inputBatch.dispatchEvent(new Event('input'));
        highlightInputError(inputBatch, false);
      }

      if (campusSelect) {
        const campuses = ['Main Campus', 'Permanent Campus', 'City Campus'];
        campusSelect.setValue(campuses[Math.floor(Math.random() * campuses.length)]);
      }

      const advisorInput = document.getElementById('academic_advisor');
      if (advisorInput) {
        const advisors = ['Dr. Alan Turing', 'Dr. Grace Hopper', 'Dr. Ada Lovelace', 'Prof. Richard Feynman', 'Dr. Tim Berners-Lee'];
        advisorInput.value = advisors[Math.floor(Math.random() * advisors.length)];
        advisorInput.dispatchEvent(new Event('input'));
        highlightInputError(advisorInput, false);
      }

      // 5. Personal Information
      if (dobPicker) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - (18 + Math.floor(Math.random() * 8));
        const birthMonth = Math.floor(Math.random() * 12);
        const birthDay = Math.floor(1 + Math.random() * 28);
        dobPicker.selectDate(new Date(birthYear, birthMonth, birthDay));
      }

      if (genderSelect) {
        const genders = ['Male', 'Female', 'Other'];
        genderSelect.setValue(genders[Math.floor(Math.random() * genders.length)]);
      }

      if (bloodGroupSelect) {
        const bloods = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        bloodGroupSelect.setValue(bloods[Math.floor(Math.random() * bloods.length)]);
      }

      const nationalityInput = document.getElementById('nationality');
      if (nationalityInput) {
        nationalityInput.value = 'Bangladeshi';
        nationalityInput.dispatchEvent(new Event('input'));
        highlightInputError(nationalityInput, false);
      }

      const nidInput = document.getElementById('nid_passport');
      if (nidInput) {
        nidInput.value = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        nidInput.dispatchEvent(new Event('input'));
        highlightInputError(nidInput, false);
      }

      const altPhoneInput = document.getElementById('alt_phone');
      if (altPhoneInput) {
        altPhoneInput.value = `+880 1${Math.floor(5 + Math.random() * 5)}${Math.floor(10000000 + Math.random() * 90000000)}`;
        altPhoneInput.dispatchEvent(new Event('input'));
        highlightInputError(altPhoneInput, false);
      }

      if (inputAddress) {
        const addresses = ['House 12, Road 5, Dhanmondi, Dhaka', 'Mirpur-10, Dhaka', 'Uttara Sector-4, Dhaka', 'Savar, Dhaka', 'Banani, Dhaka'];
        inputAddress.value = addresses[Math.floor(Math.random() * addresses.length)];
        inputAddress.dispatchEvent(new Event('input'));
        highlightInputError(inputAddress, false);
      }

      const permAddressInput = document.getElementById('permanent_address');
      if (permAddressInput) {
        permAddressInput.value = 'Same as present address';
        permAddressInput.dispatchEvent(new Event('input'));
        highlightInputError(permAddressInput, false);
      }

      const cityInput = document.getElementById('city');
      if (cityInput) {
        cityInput.value = 'Dhaka';
        cityInput.dispatchEvent(new Event('input'));
        highlightInputError(cityInput, false);
      }

      const postcodeInput = document.getElementById('postcode');
      if (postcodeInput) {
        postcodeInput.value = Math.floor(1000 + Math.random() * 9000).toString();
        postcodeInput.dispatchEvent(new Event('input'));
        highlightInputError(postcodeInput, false);
      }

      const countryInput = document.getElementById('country');
      if (countryInput) {
        countryInput.value = 'Bangladesh';
        countryInput.dispatchEvent(new Event('input'));
        highlightInputError(countryInput, false);
      }

      // 6. Emergency Contact
      const emNameInput = document.getElementById('emergency_name');
      if (emNameInput) {
        const names = ['Komal Debnath', 'Mizanur Rahman', 'Farida Yasmin', 'Zillur Rahman', 'Rowshan Ara'];
        emNameInput.value = names[Math.floor(Math.random() * names.length)];
        emNameInput.dispatchEvent(new Event('input'));
        highlightInputError(emNameInput, false);
      }

      const emRelInput = document.getElementById('emergency_relationship');
      if (emRelInput) {
        const rels = ['Father', 'Mother', 'Spouse', 'Guardian', 'Brother'];
        emRelInput.value = rels[Math.floor(Math.random() * rels.length)];
        emRelInput.dispatchEvent(new Event('input'));
        highlightInputError(emRelInput, false);
      }

      const emPhoneInput = document.getElementById('emergency_phone');
      if (emPhoneInput) {
        emPhoneInput.value = `+880 1${Math.floor(5 + Math.random() * 5)}${Math.floor(10000000 + Math.random() * 90000000)}`;
        emPhoneInput.dispatchEvent(new Event('input'));
        highlightInputError(emPhoneInput, false);
      }

      const emAddrInput = document.getElementById('emergency_address');
      if (emAddrInput) {
        emAddrInput.value = 'Same as student address';
        emAddrInput.dispatchEvent(new Event('input'));
        highlightInputError(emAddrInput, false);
      }

      // 7. Membership Details
      if (membershipTypeSelect) {
        const mTypes = ['Student', 'Faculty', 'Staff'];
        membershipTypeSelect.setValue(mTypes[Math.floor(Math.random() * mTypes.length)]);
        const mTrigger = document.getElementById('custom-select-trigger-membership-type');
        if (mTrigger) mTrigger.style.borderColor = '';
      }

      if (preferredBranchSelect) {
        const branches = ['Main Library', 'Science Branch', 'City Campus Library'];
        preferredBranchSelect.setValue(branches[Math.floor(Math.random() * branches.length)]);
        const branchTrigger = document.getElementById('custom-select-trigger-preferred-branch');
        if (branchTrigger) branchTrigger.style.borderColor = '';
      }

      if (borrowingCategorySelect) {
        const cats = ['General Collection', 'Reference Collection', 'Special Collection'];
        borrowingCategorySelect.setValue(cats[Math.floor(Math.random() * cats.length)]);
      }

      // Checkboxes: Research Interests
      document.querySelectorAll('input[name="interest"]').forEach(cb => {
        cb.checked = Math.random() > 0.5;
        cb.dispatchEvent(new Event('change'));
      });

      // Radio: Card Status
      const radioStatus = document.querySelectorAll('input[name="card_status"]');
      if (radioStatus.length > 0) {
        const chosenRadio = radioStatus[Math.floor(Math.random() * radioStatus.length)];
        chosenRadio.checked = true;
        chosenRadio.dispatchEvent(new Event('change'));
      }

      if (preferredContactSelect) {
        const methods = ['Email', 'Phone'];
        preferredContactSelect.setValue(methods[Math.floor(Math.random() * methods.length)]);
      }

      if (inputPassword) {
        inputPassword.value = Math.floor(1000 + Math.random() * 9000).toString();
        inputPassword.dispatchEvent(new Event('input'));
        highlightInputError(inputPassword, false);
      }

      // Color Theme
      if (inputCardTheme) {
        const colors = ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        inputCardTheme.value = chosenColor;
        inputCardTheme.dispatchEvent(new Event('input'));
      }

      // Borrow Limit
      if (inputBorrowLimit) {
        const limit = Math.floor(1 + Math.random() * 25);
        inputBorrowLimit.value = limit;
        inputBorrowLimit.dispatchEvent(new Event('input'));
      }

      // Dates: Start and Expiry
      const today = new Date();
      if (startDatePicker) {
        startDatePicker.selectDate(today);
      }
      if (expiryDatePicker) {
        const expiry = new Date();
        expiry.setFullYear(today.getFullYear() + 1);
        expiryDatePicker.selectDate(expiry);
      }

      // Radio: Card tier
      const radioTiers = document.querySelectorAll('input[name="tier"]');
      if (radioTiers.length > 0) {
        const chosenTier = radioTiers[Math.floor(Math.random() * radioTiers.length)];
        chosenTier.checked = true;
        chosenTier.dispatchEvent(new Event('change'));
      }

      // Agree terms
      if (inputAgree) {
        inputAgree.checked = true;
        inputAgree.dispatchEvent(new Event('change'));
        highlightInputError(inputAgree, false);
      }

      showToast('Autofill Successful', 'Demo fields populated. Front and back live previews updated.', 'success');
    });
  }

  document.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-select-wrapper.open, .custom-datepicker-wrapper.open').forEach(wrapper => {

      const label = wrapper.parentElement ? wrapper.parentElement.querySelector('label') : null;
      if (label && label.contains(e.target)) {
        return;
      }
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
        wrapper.classList.remove('open-top');
      }
    });
  });

  if (inputAddress) {
    inputAddress.addEventListener('input', (e) => {
      
      const el = document.getElementById('preview-address');
      if (el) el.textContent = e.target.value.trim() || 'No specific special clearances or address declared.';
    });
  }

  const cardElement = document.getElementById('library-id-card');
  const btnFlip = document.getElementById('btn-flip-card');
  const btnViewerFlip = document.getElementById('btn-viewer-flip');

  function toggleCardFlip() {
    if (cardElement && !isFlipping) {
      isFlipping = true;
      cardElement.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      cardElement.classList.toggle('flipped');
      const isFlipped = cardElement.classList.contains('flipped');
      cardElement.style.transform = `rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg)`;
      setTimeout(() => {
        isFlipping = false;
      }, 800);
    }
  }

  if (cardElement) {
    cardElement.addEventListener('click', toggleCardFlip);
  }
  if (btnFlip) {
    btnFlip.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCardFlip();
    });
  }
  if (btnViewerFlip) {
    btnViewerFlip.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCardFlip();
    });
  }

  function prepareCardForCapture(side) {
    const saved = {
      transform: side.style.transform,
      backfaceVisibility: side.style.backfaceVisibility,
      webkitBackfaceVisibility: side.style.webkitBackfaceVisibility,
      position: side.style.position,
      visibility: side.style.visibility
    };
    side.style.transform = 'none';
    side.style.backfaceVisibility = 'visible';
    side.style.webkitBackfaceVisibility = 'visible';
    side.style.position = 'relative';
    side.style.visibility = 'visible';
    return saved;
  }

  function stripHeavyCss(container) {
    const nukeStyle = document.createElement('style');
    nukeStyle.textContent = `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
        will-change: auto !important;
        filter: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        transform-style: flat !important;
        perspective: none !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }
      .library-card-glow,
      .library-card-side::after {
        display: none !important;
      }
    `;
    container.prepend(nukeStyle);
  }

  function restoreCardAfterCapture(side, saved) {
    side.style.transform = saved.transform;
    side.style.backfaceVisibility = saved.backfaceVisibility;
    side.style.webkitBackfaceVisibility = saved.webkitBackfaceVisibility;
    side.style.position = saved.position;
    side.style.visibility = saved.visibility;
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function yieldThread() {
    return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  }

  const COLOR_PROPS = ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'boxShadow', 'textShadow', 'fill', 'stroke'];

  function cssColorToRgba(colorStr) {
    if (!colorStr) return '';
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return colorStr;
    ctx.fillStyle = 'rgba(253, 254, 255, 0.123)';
    ctx.fillStyle = colorStr;
    if (ctx.fillStyle === 'rgba(253, 254, 255, 0.123)' || ctx.fillStyle === 'rgba(253, 254, 255, 0.12)') {
      return colorStr;
    }
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  }

  function resolveCssColors(str) {
    if (typeof str !== 'string') return str;
    const allColorFuncs = ['color-mix', 'color', 'oklch', 'oklab', 'lch', 'lab', 'hwb', 'light-dark'];
    let result = '';
    let i = 0;
    while (i < str.length) {
      let foundFunc = null;
      for (const func of allColorFuncs) {
        if (str.startsWith(func + '(', i)) {
          foundFunc = func;
          break;
        }
      }
      if (foundFunc) {
        let startIdx = i + foundFunc.length + 1;
        let parenCount = 1;
        let j = startIdx;
        while (j < str.length && parenCount > 0) {
          if (str[j] === '(') {
            parenCount++;
          } else if (str[j] === ')') {
            parenCount--;
          }
          j++;
        }
        if (parenCount === 0) {
          const fullFuncStr = str.substring(i, j);
          const resolvedColor = cssColorToRgba(fullFuncStr);
          result += resolvedColor;
          i = j;
        } else {
          result += str[i];
          i++;
        }
      } else {
        result += str[i];
        i++;
      }
    }
    return result;
  }

  function resolveColorMix(root) {
    const snapshots = [];
    const all = [root, ...root.querySelectorAll('*')];
    all.forEach(el => {
      const computed = getComputedStyle(el);
      const overrides = {};
      COLOR_PROPS.forEach(prop => {
        const val = computed[prop];
        if (val && (val.includes('color-mix') || val.includes('color(') || val.includes('oklch') || val.includes('oklab') || val.includes('lch') || val.includes('lab'))) {
          const resolved = resolveCssColors(val);
          if (resolved !== val) {
            overrides[prop] = resolved;
          }
        }
      });
      const bgImage = computed.backgroundImage;
      if (bgImage && (bgImage.includes('color-mix') || bgImage.includes('color(') || bgImage.includes('oklch') || bgImage.includes('oklab') || bgImage.includes('lch') || bgImage.includes('lab'))) {
        const resolved = resolveCssColors(bgImage);
        if (resolved !== bgImage) {
          overrides.backgroundImage = resolved;
        }
      }
      if (Object.keys(overrides).length) {
        const saved = {};
        Object.keys(overrides).forEach(prop => {
          saved[prop] = el.style[prop];
          el.style[prop] = overrides[prop];
        });
        snapshots.push({ el, saved });
      }
    });
    return snapshots;
  }

  function restoreColorMix(snapshots) {
    snapshots.forEach(({ el, saved }) => {
      Object.keys(saved).forEach(prop => {
        el.style[prop] = saved[prop];
      });
    });
  }

  const renderOpts = {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    imageTimeout: 0,
    removeContainer: true
  };

  const btnDownloadImg = document.getElementById('btn-download-img');
  if (btnDownloadImg) {
    btnDownloadImg.addEventListener('click', async () => {
      const cardEl = document.getElementById('library-id-card');
      if (!cardEl) return;
      const frontSide = cardEl.querySelector('.card-front');
      const backSide = cardEl.querySelector('.card-back');
      if (!frontSide || !backSide) return;

      btnDownloadImg.style.opacity = '0.5';
      btnDownloadImg.style.pointerEvents = 'none';

      // Step 1: Preparation (10%)
      showProcessing('Downloading Images', 'Generating ZIP archive');
      // Yield to let the browser paint the initial 0% state as the overlay fades in
      await yieldAndPaint(400);

      setStepState('step-prepare', 'current');
      setProgressPercent(10);
      await yieldAndPaint(600);

      const containerFront = document.createElement('div');
      containerFront.style.position = 'fixed';
      containerFront.style.left = '-9999px';
      containerFront.style.top = '-9999px';
      containerFront.style.width = getComputedStyle(cardEl).width;
      containerFront.style.height = getComputedStyle(cardEl).height;
      containerFront.style.opacity = '1';
      containerFront.style.visibility = 'visible';
      containerFront.style.contain = 'strict';

      const containerBack = document.createElement('div');
      containerBack.style.position = 'fixed';
      containerBack.style.left = '-9999px';
      containerBack.style.top = '-9999px';
      containerBack.style.width = getComputedStyle(cardEl).width;
      containerBack.style.height = getComputedStyle(cardEl).height;
      containerBack.style.opacity = '1';
      containerBack.style.visibility = 'visible';
      containerBack.style.contain = 'strict';

      const frontClone = frontSide.cloneNode(true);
      const backClone = backSide.cloneNode(true);

      containerFront.appendChild(frontClone);
      containerBack.appendChild(backClone);

      document.body.appendChild(containerFront);
      document.body.appendChild(containerBack);

      const snapsFront = resolveColorMix(frontClone);
      const snapsBack = resolveColorMix(backClone);

      const savedFront = prepareCardForCapture(frontClone);
      const savedBack = prepareCardForCapture(backClone);

      stripHeavyCss(containerFront);
      stripHeavyCss(containerBack);

      try {
        console.time('Image Download Process');

        // Step 2: Render Front (45%)
        setStepState('step-prepare', 'done');
        setStepState('step-render-front', 'current');
        setProgressPercent(45);
        await yieldAndPaint(600);

        let frontBlob, backBlob;
        try {
          console.time('html-to-image toBlob');
          frontBlob = await htmlToImage.toBlob(frontClone, { pixelRatio: 2, cacheBust: true, fontEmbedCSS: '' });

          // Step 3: Render Back (80%)
          setStepState('step-render-front', 'done');
          setStepState('step-render-back', 'current');
          setProgressPercent(80);
          await yieldAndPaint(600);

          backBlob = await htmlToImage.toBlob(backClone, { pixelRatio: 2, cacheBust: true, fontEmbedCSS: '' });
          console.timeEnd('html-to-image toBlob');
        } catch (e) {
          console.warn('html-to-image failed, falling back to html2canvas:', e);

          if (!frontBlob) {
            // Front side rendering with html2canvas fallback
            setStepState('step-render-front', 'current');
            setProgressPercent(45);
            await yieldAndPaint(600);

            console.time('html2canvas render front');
            const canvasFront = await html2canvas(frontClone, renderOpts);
            frontBlob = await new Promise(resolve => canvasFront.toBlob(resolve, 'image/png'));
            setStepState('step-render-front', 'done');
          }

          // Back side rendering with html2canvas fallback
          setStepState('step-render-back', 'current');
          setProgressPercent(80);
          await yieldAndPaint(600);

          console.time('html2canvas render back');
          const canvasBack = await html2canvas(backClone, renderOpts);
          backBlob = await new Promise(resolve => canvasBack.toBlob(resolve, 'image/png'));
        }

        restoreColorMix(snapsFront);
        restoreCardAfterCapture(frontClone, savedFront);
        restoreColorMix(snapsBack);
        restoreCardAfterCapture(backClone, savedBack);

        document.body.removeChild(containerFront);
        document.body.removeChild(containerBack);

        // Step 4: Package Zip (95%)
        setStepState('step-render-back', 'done');
        setStepState('step-package', 'current');
        setProgressPercent(95);
        await yieldAndPaint(600);

        const zip = new JSZip();
        zip.file('AETHER-LMS-Card-Front.png', frontBlob);
        zip.file('AETHER-LMS-Card-Back.png', backBlob);

        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'STORE'
        });

        triggerDownload(zipBlob, 'AETHER-LMS-Card-Images.zip');

        console.timeEnd('Image Download Process');

        // Done (100%)
        setStepState('step-package', 'done');
        setProgressPercent(100);
        await yieldAndPaint(800);

        hideProcessing();
        showToast('Download Started', 'Card assets compiled successfully. Check browser downloads.', 'success');
      } catch (err) {
        console.error('Image rendering failed:', err);
        if (containerFront.parentNode) {
          document.body.removeChild(containerFront);
        }
        if (containerBack.parentNode) {
          document.body.removeChild(containerBack);
        }
        hideProcessing();
        showToast('Download Failed', 'Could not compile card images.', 'error');
      }
      btnDownloadImg.style.opacity = '';
      btnDownloadImg.style.pointerEvents = '';
    });
  }

  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', async () => {
      const cardEl = document.getElementById('library-id-card');
      if (!cardEl) return;
      const frontSide = cardEl.querySelector('.card-front');
      const backSide = cardEl.querySelector('.card-back');
      if (!frontSide || !backSide) return;

      btnDownloadPdf.style.opacity = '0.5';
      btnDownloadPdf.style.pointerEvents = 'none';

      // Step 1: Preparation (10%)
      showProcessing('Downloading PDF', 'Generating PDF document');
      // Yield to let the browser paint the initial 0% state as the overlay fades in
      await yieldAndPaint(400);

      setStepState('step-prepare', 'current');
      setProgressPercent(10);
      await yieldAndPaint(600);

      const containerFront = document.createElement('div');
      containerFront.style.position = 'fixed';
      containerFront.style.left = '-9999px';
      containerFront.style.top = '-9999px';
      containerFront.style.width = getComputedStyle(cardEl).width;
      containerFront.style.height = getComputedStyle(cardEl).height;
      containerFront.style.opacity = '1';
      containerFront.style.visibility = 'visible';
      containerFront.style.contain = 'strict';

      const containerBack = document.createElement('div');
      containerBack.style.position = 'fixed';
      containerBack.style.left = '-9999px';
      containerBack.style.top = '-9999px';
      containerBack.style.width = getComputedStyle(cardEl).width;
      containerBack.style.height = getComputedStyle(cardEl).height;
      containerBack.style.opacity = '1';
      containerBack.style.visibility = 'visible';
      containerBack.style.contain = 'strict';

      const frontClone = frontSide.cloneNode(true);
      const backClone = backSide.cloneNode(true);

      containerFront.appendChild(frontClone);
      containerBack.appendChild(backClone);

      document.body.appendChild(containerFront);
      document.body.appendChild(containerBack);

      const snapsFront = resolveColorMix(frontClone);
      const snapsBack = resolveColorMix(backClone);

      const savedFront = prepareCardForCapture(frontClone);
      const savedBack = prepareCardForCapture(backClone);

      stripHeavyCss(containerFront);
      stripHeavyCss(containerBack);

      try {
        // Step 2: Render Front (45%)
        setStepState('step-prepare', 'done');
        setStepState('step-render-front', 'current');
        setProgressPercent(45);
        await yieldAndPaint(600);

        let canvasFront, canvasBack;
        try {
          canvasFront = await htmlToImage.toCanvas(frontClone, { pixelRatio: 2, cacheBust: true });

          // Step 3: Render Back (80%)
          setStepState('step-render-front', 'done');
          setStepState('step-render-back', 'current');
          setProgressPercent(80);
          await yieldAndPaint(600);

          canvasBack = await htmlToImage.toCanvas(backClone, { pixelRatio: 2, cacheBust: true });
        } catch (e) {
          console.warn('html-to-image failed, falling back to html2canvas:', e);

          if (!canvasFront) {
            // Front side rendering with html2canvas fallback
            setStepState('step-render-front', 'current');
            setProgressPercent(45);
            await yieldAndPaint(600);

            canvasFront = await html2canvas(frontClone, renderOpts);
            setStepState('step-render-front', 'done');
          }

          // Back side rendering with html2canvas fallback
          setStepState('step-render-back', 'current');
          setProgressPercent(80);
          await yieldAndPaint(600);

          canvasBack = await html2canvas(backClone, renderOpts);
        }

        restoreColorMix(snapsFront);
        restoreCardAfterCapture(frontClone, savedFront);
        restoreColorMix(snapsBack);
        restoreCardAfterCapture(backClone, savedBack);

        document.body.removeChild(containerFront);
        document.body.removeChild(containerBack);

        // Step 4: Generate PDF (95%)
        setStepState('step-render-back', 'done');
        setStepState('step-package', 'current');
        setProgressPercent(95);
        await yieldAndPaint(600);

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const cardW = 150;
        const cardH = 94.5;
        const x = (297 - cardW) / 2;
        const y = (210 - cardH) / 2;

        pdf.addImage(canvasFront, 'PNG', x, y, cardW, cardH);
        pdf.addPage();
        pdf.addImage(canvasBack, 'PNG', x, y, cardW, cardH);

        const pdfBlob = pdf.output('blob');

        triggerDownload(pdfBlob, 'AETHER-LMS-Card.pdf');

        // Done (100%)
        setStepState('step-package', 'done');
        setProgressPercent(100);
        await yieldAndPaint(800);

        hideProcessing();
        showToast('Download Started', 'Card assets compiled successfully. Check browser downloads.', 'success');
      } catch (err) {
        console.error('PDF generation failed:', err);
        if (containerFront.parentNode) {
          document.body.removeChild(containerFront);
        }
        if (containerBack.parentNode) {
          document.body.removeChild(containerBack);
        }
        hideProcessing();
        showToast('Download Failed', 'Could not compile card PDF.', 'error');
      }
      btnDownloadPdf.style.opacity = '';
      btnDownloadPdf.style.pointerEvents = '';
    });
  }

  const btnShare = document.getElementById('btn-share-card');
  const shareModal = document.getElementById('share-modal');
  const btnCloseShareModal = document.getElementById('btn-close-share-modal');
  const shareLinkUrl = document.getElementById('share-link-url');
  const btnCopyShareLink = document.getElementById('btn-copy-share-link');
  let currentShareCaption = '';

  const shareFb = document.getElementById('share-fb');
  const shareTw = document.getElementById('share-tw');
  const shareLn = document.getElementById('share-ln');
  const shareWa = document.getElementById('share-wa');
  const shareMsg = document.getElementById('share-msg');
  const shareDiscord = document.getElementById('share-discord');

  (function fixOgImageUrls() {
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    const ogImage = document.getElementById('og-image');
    const twImage = document.getElementById('twitter-image');
    const prodBase = 'https://nnewbe.github.io/lms-form/';

    if (ogImage) {
      const content = ogImage.getAttribute('content') || '';
      if (!content.startsWith('http')) {
        ogImage.setAttribute('content', baseUrl + content);
      } else if (content.startsWith(prodBase) && window.location.origin !== 'https://nnewbe.github.io') {
        ogImage.setAttribute('content', content.replace(prodBase, baseUrl));
      }
    }
    if (twImage) {
      const content = twImage.getAttribute('content') || '';
      if (!content.startsWith('http')) {
        twImage.setAttribute('content', baseUrl + content);
      } else if (content.startsWith(prodBase) && window.location.origin !== 'https://nnewbe.github.io') {
        twImage.setAttribute('content', content.replace(prodBase, baseUrl));
      }
    }
  })();

  function updateSocialShareUrls(shareUrl) {
    const encodedUrl = encodeURIComponent(shareUrl);

    if (shareFb) shareFb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    if (shareTw) shareTw.href = `https://twitter.com/intent/tweet?url=${encodedUrl}`;
    if (shareLn) shareLn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    if (shareWa) shareWa.href = `https://api.whatsapp.com/send?text=${encodedUrl}`;
    if (shareMsg) shareMsg.href = `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=966242223397117&redirect_uri=${encodedUrl}`;
    if (shareDiscord) shareDiscord.href = `https://discord.com/channels/@me`;
  }

  if (btnShare && shareModal) {
    btnShare.addEventListener('click', async () => {
      // If photo upload is currently in progress, wait for it
      if (isUploadingAvatar) {
        showToast('Uploading Photo', 'Please wait while the student photo upload completes...', 'loading');
        let checkCount = 0;
        while (isUploadingAvatar && checkCount < 30) {
          await new Promise(resolve => setTimeout(resolve, 300));
          checkCount++;
        }
      }

      // If there is an avatar selected, but it hasn't been uploaded to Cloudinary yet (or upload failed earlier):
      if (selectedAvatarBlob && !cloudinaryAvatarUrl) {
        showToast('Uploading Photo', 'Please wait while the student photo is being uploaded...', 'loading');
        try {
          cloudinaryAvatarUrl = await uploadToCloudinary(selectedAvatarBlob);
          selectedAvatarBlob = null;
          if (previewAvatar && cloudinaryAvatarUrl) {
            previewAvatar.src = buildAvatarSrc(cloudinaryAvatarUrl);
          }
          saveFormDraft();
          showToast('Upload Complete', 'Student photo uploaded successfully.', 'success');
        } catch (err) {
          console.error('Cloudinary upload on share failed:', err);
          showToast('Upload Failed', 'Could not upload student photo.', 'error');
        }
      }

      const keyVal = previewCardKey ? previewCardKey.textContent : '';
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
      const finalShareUrl = `${baseUrl}pages/share.html?id=${encodeURIComponent(keyVal)}`;

      shareLinkUrl.value = finalShareUrl;

      updateSocialShareUrls(finalShareUrl);

      shareModal.classList.add('open');
    });
  }

  if (btnCloseShareModal) {
    btnCloseShareModal.addEventListener('click', () => {
      shareModal.classList.remove('open');
    });
  }

  if (shareModal) {
    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
        shareModal.classList.remove('open');
      }
    });
  }

  if (btnCopyShareLink) {
    btnCopyShareLink.addEventListener('click', () => {

      navigator.clipboard.writeText(shareLinkUrl.value).then(() => {
        btnCopyShareLink.innerHTML = `<i data-lucide="check"></i><span>Copied!</span>`;
        btnCopyShareLink.classList.add('copied');
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        setTimeout(() => {
          btnCopyShareLink.innerHTML = `<i data-lucide="copy" id="copy-icon"></i><span id="copy-btn-text">Copy</span>`;
          btnCopyShareLink.classList.remove('copied');
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }, 2000);
      });
    });
  }

  if (shareDiscord) {
    shareDiscord.addEventListener('click', (e) => {
      e.preventDefault();

      navigator.clipboard.writeText(shareLinkUrl.value).then(() => {
        showToast('Link Copied', 'Share link copied! Opening Discord...', 'success');

        setTimeout(() => {
          window.open('https://discord.com/channels/@me', '_blank');
        }, 800);
      }).catch(err => {
        console.error('Failed to copy text for Discord:', err);
        window.open('https://discord.com/channels/@me', '_blank');
      });
    });
  }

  const formCardPlacement = document.getElementById('card-perspective');
  const mainNavbar = document.getElementById('main-navbar');
  const beamContainer = document.querySelector('.beam-container');
  const skelRails = document.querySelectorAll('.skel-rail');

  function buildAvatarSrc(av) {
    if (!av) return '';
    if (typeof av !== 'string') return '';
    if (av.startsWith('c:')) {
      const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
      return `https://res.cloudinary.com/${cloudName}/image/upload/${av.substring(2)}`;
    }
    if (av.startsWith('http://') || av.startsWith('https://')) {
      return av;
    }
    if (av.includes('lms_avatars/') || av.includes('lms-avatars/')) {
      const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
      return `https://res.cloudinary.com/${cloudName}/image/upload/${av}`;
    }
    return '';
  }

  function checkSharedLink() {
    const isReadyAdmin = window.location.pathname.includes('admin.html');
    const isReadyLogin = window.location.pathname.includes('login.html');
    const appWrapper = document.querySelector('.app-wrapper');
    const adminPanelMode = document.getElementById('admin-panel-mode');
    const adminLoginMode = document.getElementById('admin-login-mode');
    const adminLoginError = document.getElementById('admin-login-error');

    if (adminPanelMode) adminPanelMode.style.display = 'none';
    if (adminLoginMode) adminLoginMode.style.display = 'none';
    if (appWrapper) appWrapper.style.display = '';
    if (mainNavbar) mainNavbar.style.display = '';
    if (beamContainer) beamContainer.style.display = '';
    skelRails.forEach(rail => rail.style.display = '');

    if (adminLoginError) adminLoginError.style.display = 'none';

    if (isReadyAdmin) {
      if (appWrapper) appWrapper.style.display = 'none';
      const navAdminBtn = document.querySelector('.admin-panel-btn');
      if (navAdminBtn) navAdminBtn.style.display = 'none';

      if (isAdminAuthenticated) {
        if (adminPanelMode) adminPanelMode.style.display = 'flex';
        renderAdminDirectory();
      } else {
        window.location.href = 'login.html';
      }
    } else if (isReadyLogin) {
      if (appWrapper) appWrapper.style.display = 'none';
      if (isAdminAuthenticated) {
        window.location.href = 'admin.html';
      } else {
        if (adminLoginMode) adminLoginMode.style.display = 'flex';

        setTimeout(() => {
          const uInput = document.getElementById('admin-username');
          if (uInput) uInput.focus();
        }, 50);
      }
    } else {
      if (!isCardCreated) {
        generateCardKey();
      }
      updateSubmitButtonText();
      updateCardActionsVisibility();

      if (formCardPlacement && libraryCard && libraryCard.parentElement !== formCardPlacement) {
        formCardPlacement.appendChild(libraryCard);

        if (libraryCard.classList.contains('flipped')) {
          libraryCard.classList.remove('flipped');
          libraryCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
        }
      }

      if (inputFirstName) inputFirstName.dispatchEvent(new Event('input'));
      if (inputLastName) inputLastName.dispatchEvent(new Event('input'));
      if (inputEmail) inputEmail.dispatchEvent(new Event('input'));
      if (inputPhone) inputPhone.dispatchEvent(new Event('input'));
      if (inputBatch) inputBatch.dispatchEvent(new Event('input'));
      if (inputAddress) inputAddress.dispatchEvent(new Event('input'));
      if (inputBorrowLimit) inputBorrowLimit.dispatchEvent(new Event('input'));
      if (inputMembershipExpiry) inputMembershipExpiry.dispatchEvent(new Event('input'));

      if (inputCardTheme) {
        inputCardTheme.dispatchEvent(new Event('input'));
      }

      const activeRadio = document.querySelector('input[name="tier"]:checked');
      if (activeRadio) {
        activeRadio.dispatchEvent(new Event('change'));
      }

      if (selectedAvatarBlob) {
        if (previewAvatar) {
          previewAvatar.src = URL.createObjectURL(selectedAvatarBlob);
        }
        if (previewAvatarContainer) {
          previewAvatarContainer.classList.add('has-image');
        }
      } else if (cloudinaryAvatarUrl) {
        if (previewAvatar) {
          previewAvatar.src = buildAvatarSrc(cloudinaryAvatarUrl);
        }
        if (previewAvatarContainer) {
          previewAvatarContainer.classList.add('has-image');
        }
      } else {
        if (previewAvatar) {
          previewAvatar.src = '';
        }
        if (previewAvatarContainer) {
          previewAvatarContainer.classList.remove('has-image');
        }
      }

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }

  if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth()) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        isAdminAuthenticated = true;
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        if (window.location.pathname.includes('login.html')) {
          window.location.href = 'admin.html';
        } else if (window.location.pathname.includes('admin.html')) {
          const adminPanelMode = document.getElementById('admin-panel-mode');
          if (adminPanelMode) {
            adminPanelMode.style.display = 'flex';
            renderAdminDirectory();
          }
        }
      } else {
        if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
          isAdminAuthenticated = true;
          if (window.location.pathname.includes('admin.html')) {
            const adminPanelMode = document.getElementById('admin-panel-mode');
            if (adminPanelMode) {
              adminPanelMode.style.display = 'flex';
              renderAdminDirectory();
            }
          }
        } else {
          isAdminAuthenticated = false;
          if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'login.html';
          }
        }
      }
    });
  } else {
    if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
      isAdminAuthenticated = true;
      if (window.location.pathname.includes('login.html')) {
        window.location.href = 'admin.html';
      } else if (window.location.pathname.includes('admin.html')) {
        const adminPanelMode = document.getElementById('admin-panel-mode');
        if (adminPanelMode) {
          adminPanelMode.style.display = 'flex';
          renderAdminDirectory();
        }
      }
    } else {
      isAdminAuthenticated = false;
      if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'login.html';
      }
    }
  }

  let isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
  let currentFilteredMembers = [];
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginError = document.getElementById('admin-login-error');
  const btnLoginCancel = document.getElementById('btn-login-cancel');

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailVal = document.getElementById('admin-username').value.trim();
      const passVal = document.getElementById('admin-password').value;

      const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
      const submitBtnSpan = submitBtn ? submitBtn.querySelector('span') : null;
      const originalText = submitBtnSpan ? submitBtnSpan.textContent : "Unlock Directory";
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtnSpan) submitBtnSpan.textContent = "Verifying...";
      }

      function handleSuccessfulLogin() {
        isAdminAuthenticated = true;
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        if (adminLoginError) adminLoginError.style.display = 'none';
        adminLoginForm.reset();
        window.location.href = 'admin.html';
      }

      function handleFailedLogin() {
        if (adminLoginError) adminLoginError.style.display = 'block';
        const loginPanel = adminLoginForm.closest('.glass-panel');
        if (loginPanel) {
          loginPanel.style.animation = 'shake-panel 0.4s ease';
          setTimeout(() => { loginPanel.style.animation = ''; }, 400);
        }
      }

      function resetSubmitBtn() {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtnSpan) submitBtnSpan.textContent = originalText;
        }
      }

      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth()) {
        firebase.auth().signInWithEmailAndPassword(emailVal, passVal)
          .then((userCredential) => {
            console.log("Logged in via Firebase Auth successfully:", userCredential.user.email);
            handleSuccessfulLogin();
          })
          .catch((error) => {
            console.warn("Firebase Auth sign-in failed:", error.code, error.message);
            const expectedUser = (window.ENV && window.ENV.ADMIN_USERNAME) || 'admin@gmail.com';
            const expectedPass = (window.ENV && window.ENV.ADMIN_PASSWORD) || 'admin1234';
            if (emailVal === expectedUser && passVal === expectedPass) {
              console.log("Firebase Auth failed; local fallback credentials matched successfully.");
              handleSuccessfulLogin();
            } else {
              handleFailedLogin();
            }
          })
          .finally(() => {
            resetSubmitBtn();
          });
      } else {
        console.warn("Firebase Auth SDK not active. Falling back to local credentials.");
        const expectedUser = (window.ENV && window.ENV.ADMIN_USERNAME) || 'admin@gmail.com';
        const expectedPass = (window.ENV && window.ENV.ADMIN_PASSWORD) || 'admin1234';

        if (emailVal === expectedUser && passVal === expectedPass) {
          handleSuccessfulLogin();
        } else {
          handleFailedLogin();
        }
        resetSubmitBtn();
      }
    });
  }

  if (btnLoginCancel) {
    btnLoginCancel.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '../index.html';
      }
    });
  }

  function showMemberDetailsModal(m) {
    const detailsModal = document.getElementById('admin-details-modal');
    if (!detailsModal) return;

    const fullNameEl = document.getElementById('details-full-name');
    if (fullNameEl) fullNameEl.textContent = m.n || 'N/A';
    const keyEl = document.getElementById('details-key');
    if (keyEl) keyEl.textContent = m.k || 'N/A';
    const studentIdEl = document.getElementById('details-student-id');
    if (studentIdEl) studentIdEl.textContent = m.student_info?.student_id || 'N/A';

    const detailsAvatar = document.getElementById('details-avatar');
    const detailsAvatarPlaceholder = document.getElementById('details-avatar-placeholder');
    if (detailsAvatar) {
      if (m.av) {
        let src = m.av;
        if (src.startsWith('c:')) {
          const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
          src = `https://res.cloudinary.com/${cloudName}/image/upload/${src.substring(2)}`;
        } else if (src.startsWith('http://') || src.startsWith('https://')) {

        } else if (src.includes('lms_avatars/') || src.includes('lms-avatars/')) {
          const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
          src = `https://res.cloudinary.com/${cloudName}/image/upload/${src}`;
        } else {
          src = 'data:image/jpeg;base64,' + src;
        }
        detailsAvatar.src = src;
        detailsAvatar.style.display = 'block';
        if (detailsAvatarPlaceholder) detailsAvatarPlaceholder.style.display = 'none';
      } else {
        detailsAvatar.src = '';
        detailsAvatar.style.display = 'none';
        if (detailsAvatarPlaceholder) detailsAvatarPlaceholder.style.display = 'block';
      }
    }

    const degreeEl = document.getElementById('details-degree-level');
    if (degreeEl) degreeEl.textContent = m.student_info?.degree_level || 'N/A';
    const facultyEl = document.getElementById('details-faculty');
    if (facultyEl) facultyEl.textContent = m.student_info?.faculty || 'N/A';
    const deptEl = document.getElementById('details-dept');
    if (deptEl) deptEl.textContent = m.d || m.student_info?.department || 'N/A';
    const programEl = document.getElementById('details-program');
    if (programEl) programEl.textContent = m.student_info?.program || 'N/A';
    const semesterEl = document.getElementById('details-semester');
    if (semesterEl) semesterEl.textContent = m.s || m.student_info?.semester || 'N/A';
    const sessionEl = document.getElementById('details-session');
    if (sessionEl) sessionEl.textContent = m.b || m.student_info?.session || 'N/A';
    const campusEl = document.getElementById('details-campus');
    if (campusEl) campusEl.textContent = m.student_info?.campus || 'N/A';
    const advisorEl = document.getElementById('details-advisor');
    if (advisorEl) advisorEl.textContent = m.student_info?.advisor || 'N/A';

    const dobEl = document.getElementById('details-dob');
    if (dobEl) dobEl.textContent = m.personal_info?.dob || 'N/A';
    const genderEl = document.getElementById('details-gender');
    if (genderEl) genderEl.textContent = m.personal_info?.gender || 'N/A';
    const bloodEl = document.getElementById('details-blood');
    if (bloodEl) bloodEl.textContent = m.personal_info?.blood_group || 'N/A';
    const nationalityEl = document.getElementById('details-nationality');
    if (nationalityEl) nationalityEl.textContent = m.personal_info?.nationality || 'N/A';
    const nidEl = document.getElementById('details-nid');
    if (nidEl) nidEl.textContent = m.personal_info?.nid_passport || 'N/A';
    const altPhoneEl = document.getElementById('details-alt-phone');
    if (altPhoneEl) altPhoneEl.textContent = m.personal_info?.alt_phone || 'N/A';
    const presentAddrEl = document.getElementById('details-present-addr');
    if (presentAddrEl) presentAddrEl.textContent = m.a || m.personal_info?.present_address || 'N/A';
    const permanentAddrEl = document.getElementById('details-permanent-addr');
    if (permanentAddrEl) permanentAddrEl.textContent = m.personal_info?.permanent_address || 'N/A';

    const cityPostCountryEl = document.getElementById('details-city-post-country');
    if (cityPostCountryEl) {
      const city = m.personal_info?.city || 'N/A';
      const postcode = m.personal_info?.postcode || 'N/A';
      const country = m.personal_info?.country || 'N/A';
      cityPostCountryEl.textContent = `${city} / ${postcode} / ${country}`;
    }

    const emNameEl = document.getElementById('details-emergency-name');
    if (emNameEl) emNameEl.textContent = m.emergency_contact?.name || 'N/A';
    const emRelationEl = document.getElementById('details-emergency-relation');
    if (emRelationEl) emRelationEl.textContent = m.emergency_contact?.relationship || 'N/A';
    const emPhoneEl = document.getElementById('details-emergency-phone');
    if (emPhoneEl) emPhoneEl.textContent = m.emergency_contact?.phone || 'N/A';
    const emAddrEl = document.getElementById('details-emergency-addr');
    if (emAddrEl) emAddrEl.textContent = m.emergency_contact?.address || 'N/A';

    const mTypeEl = document.getElementById('details-membership-type');
    if (mTypeEl) mTypeEl.textContent = m.membership_details?.type || m.tr || 'Standard';
    const branchEl = document.getElementById('details-branch');
    if (branchEl) branchEl.textContent = m.membership_details?.branch || 'N/A';
    const categoryEl = document.getElementById('details-category');
    if (categoryEl) categoryEl.textContent = m.membership_details?.category || 'N/A';

    const interestsEl = document.getElementById('details-interests');
    if (interestsEl) {
      const interests = m.membership_details?.interests;
      interestsEl.textContent = (interests && interests.length > 0) ? interests.join(', ') : 'None';
    }

    const cardStatusEl = document.getElementById('details-card-status');
    if (cardStatusEl) cardStatusEl.textContent = m.membership_details?.status || 'N/A';
    const contactMethodEl = document.getElementById('details-contact-method');
    if (contactMethodEl) contactMethodEl.textContent = m.membership_details?.contact_method || 'N/A';

    const borrowLimitEl = document.getElementById('details-borrow-limit');
    if (borrowLimitEl) borrowLimitEl.textContent = m.l || '5';
    const themeColorEl = document.getElementById('details-theme-color');
    if (themeColorEl) themeColorEl.textContent = m.th || '#06b6d4';

    const startDateEl = document.getElementById('details-start-date');
    if (startDateEl) startDateEl.textContent = m.membership_details?.start_date || 'N/A';
    const expiryDateEl = document.getElementById('details-expiry-date');
    if (expiryDateEl) expiryDateEl.textContent = m.t || m.membership_details?.expiry_date || 'N/A';

    detailsModal.style.display = 'flex';
    requestAnimationFrame(() => {
      detailsModal.classList.add('open');
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  const detailsModal = document.getElementById('admin-details-modal');
  const btnCloseDetailsModal = document.getElementById('btn-close-details-modal');
  const btnCloseDetailsFooter = document.getElementById('btn-close-details-footer');

  function closeDetailsModal() {
    if (detailsModal) {
      detailsModal.classList.remove('open');
      setTimeout(() => {
        if (!detailsModal.classList.contains('open')) {
          detailsModal.style.display = 'none';
        }
      }, 350);
    }
  }

  if (btnCloseDetailsModal) btnCloseDetailsModal.addEventListener('click', closeDetailsModal);
  if (btnCloseDetailsFooter) btnCloseDetailsFooter.addEventListener('click', closeDetailsModal);
  if (detailsModal) {
    detailsModal.addEventListener('click', (e) => {
      if (e.target === detailsModal) {
        closeDetailsModal();
      }
    });
  }

  async function renderAdminDirectory() {
    const tableBody = document.getElementById('admin-table-body');
    const searchInput = document.getElementById('admin-search-input');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;"><div style="display:inline-block; width:1.5rem; height:1.5rem; border:2px solid currentColor; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:0.5rem; vertical-align:middle;"></div><p style="margin:0; font-size:0.85rem; display:inline-block; margin-left:0.5rem;">Loading directory...</p></td></tr>';

    try {
      const members = await DB.getAllMembers();
      tableBody.innerHTML = '';

      const allMembers = Object.values(members).filter(Boolean);

      // Update KPI Statistics
      const totalEl = document.getElementById('stat-total-count');
      const vipEl = document.getElementById('stat-vip-count');
      const premiumEl = document.getElementById('stat-premium-count');
      const activeEl = document.getElementById('stat-active-count');

      if (totalEl) totalEl.textContent = allMembers.length;
      if (vipEl) vipEl.textContent = allMembers.filter(m => (m.tr || '').toUpperCase() === 'VIP').length;
      if (premiumEl) premiumEl.textContent = allMembers.filter(m => (m.tr || '').toUpperCase() === 'PREMIUM').length;
      if (activeEl) activeEl.textContent = allMembers.filter(m => (m.membership_details?.status || '').toUpperCase() === 'ACTIVE').length;

      // Extract unique departments dynamically
      const departments = new Set();
      allMembers.forEach(m => {
        const d = m.d || (m.student_info && m.student_info.department);
        if (d && d.trim()) {
          departments.add(d.trim());
        }
      });
      const sortedDepts = Array.from(departments).sort();

      // Populate filter-dept select
      const filterDeptSelect = document.getElementById('filter-dept');
      if (filterDeptSelect) {
        const currentVal = filterDeptSelect.value;
        const existingOpts = Array.from(filterDeptSelect.options).map(o => o.value).filter(Boolean);
        const hasChanged = existingOpts.length !== sortedDepts.length || !existingOpts.every((v, i) => v === sortedDepts[i]);

        if (hasChanged) {
          filterDeptSelect.innerHTML = '<option value="">All Departments</option>';
          sortedDepts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            filterDeptSelect.appendChild(opt);
          });
          if (sortedDepts.includes(currentVal)) {
            filterDeptSelect.value = currentVal;
          } else {
            filterDeptSelect.value = '';
          }
          rebuildCustomFilterDeptOptions(sortedDepts, filterDeptSelect.value);
        }
      }

      // Filter pipeline
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

      const filterTierSelect = document.getElementById('filter-tier');
      const tierVal = filterTierSelect ? filterTierSelect.value : '';

      const deptVal = filterDeptSelect ? filterDeptSelect.value : '';

      const filterStatusSelect = document.getElementById('filter-status');
      const statusVal = filterStatusSelect ? filterStatusSelect.value : '';

      const filtered = allMembers.filter(m => {
        if (!m) return false;

        // 1. Search query filter
        const name = (m.n || '').toLowerCase();
        const key = (m.k || '').toLowerCase();
        const email = (m.e || '').toLowerCase();
        const dept = (m.d || (m.student_info && m.student_info.department) || '').toLowerCase();
        const matchesQuery = !query || name.includes(query) || key.includes(query) || email.includes(query) || dept.includes(query);

        // 2. Tier filter
        const matchesTier = !tierVal || (m.tr || '').toLowerCase() === tierVal.toLowerCase();

        // 3. Department filter
        const mDept = m.d || (m.student_info && m.student_info.department) || '';
        const matchesDept = !deptVal || mDept.trim() === deptVal.trim();

        // 4. Status filter
        const mStatus = m.membership_details?.status || '';
        const matchesStatus = !statusVal || mStatus.toLowerCase() === statusVal.toLowerCase();

        return matchesQuery && matchesTier && matchesDept && matchesStatus;
      });

      // Cache the filtered list for exports
      currentFilteredMembers = filtered;

      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
              <i data-lucide="info" style="width: 2rem; height: 2rem; margin-bottom: 0.5rem; color: var(--accent-secondary); display: inline-block;"></i>
              <p style="margin: 0; font-size: 0.85rem;">No members match the current filters.</p>
            </td>
          </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }

      filtered.forEach(m => {
        const row = document.createElement('tr');
        row.style.setProperty('--member-theme', m.th || 'var(--accent-primary)');

        let avatarHtml = `<i data-lucide="user" class="table-avatar-placeholder"></i>`;
        if (m.av) {
          let src = m.av;
          if (src.startsWith('c:')) {
            const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
            src = `https://res.cloudinary.com/${cloudName}/image/upload/${src.substring(2)}`;
          } else if (src.startsWith('http://') || src.startsWith('https://')) {

          } else if (src.includes('lms_avatars/') || src.includes('lms-avatars/')) {
            const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
            src = `https://res.cloudinary.com/${cloudName}/image/upload/${src}`;
          } else {
            src = 'data:image/jpeg;base64,' + src;
          }
          avatarHtml = `<img src="${src}" alt="${m.n}" class="table-avatar-img">`;
        }

        let tierIcon = 'shield';
        let tierClass = 'tier-standard';
        if (m.tr === 'Premium') {
          tierIcon = 'zap';
          tierClass = 'tier-premium';
        } else if (m.tr === 'VIP') {
          tierIcon = 'crown';
          tierClass = 'tier-vip';
        }

        row.innerHTML = `
          <td style="padding: 0.85rem 1rem;">
            <div class="table-member-info">
              <div class="table-avatar-container">
                ${avatarHtml}
              </div>
              <div style="min-width: 0;">
                <h4 class="table-member-name">${m.n}</h4>
              </div>
            </div>
          </td>
          <td style="padding: 0.85rem 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--member-theme); font-weight: 600;">
            LMS-${(m.k || '').replace('LMS-', '')}
          </td>
          <td style="padding: 0.85rem 1rem; color: var(--text-main); font-size: 0.78rem;">
            ${m.e || 'N/A'}
          </td>
          <td style="padding: 0.85rem 1rem; color: var(--text-muted); font-size: 0.78rem;">
            <div style="color: var(--text-main); font-weight: 500;">${m.d || (m.student_info && m.student_info.department) || 'N/A'}</div>
            <div style="font-size: 0.7rem;">${m.b || (m.student_info && m.student_info.session) || 'N/A'}</div>
          </td>
          <td style="padding: 0.85rem 1rem;">
            <span class="table-tier-badge ${tierClass}">
              <i data-lucide="${tierIcon}"></i>
              <span>${m.tr || 'Standard'}</span>
            </span>
          </td>
          <td style="padding: 0.85rem 1rem;">
            <div class="table-actions">
              <button class="table-action-btn view-btn">
                <i data-lucide="eye" style="width: 0.8rem; height: 0.8rem; margin-right: 0.25rem;"></i> View
              </button>
              <button class="table-action-btn delete-btn">
                <i data-lucide="trash-2" style="width: 0.8rem; height: 0.8rem;"></i>
              </button>
            </div>
          </td>
        `;

        row.querySelector('.view-btn').addEventListener('click', () => {
          showMemberDetailsModal(m);
        });

        row.querySelector('.delete-btn').addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete ${m.n}'s record?`)) {
            await DB.deleteMember(m.k);
            renderAdminDirectory();
            showToast('Record Deleted', `${m.n} has been deleted from database.`);
          }
        });

        tableBody.appendChild(row);
      });

      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error("renderAdminDirectory failed:", err);
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-error); padding: 2rem 1rem;"><i data-lucide="alert-circle" style="width: 2rem; height: 2rem; margin-bottom: 0.5rem; display: inline-block;"></i><p style="margin: 0; font-size: 0.85rem;">Failed to load directory: ${err.message || err}</p></td></tr>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  function rebuildCustomFilterDeptOptions(sortedDepts, currentVal) {
    const optionsContainer = document.getElementById('custom-select-options-filter-dept');
    if (!optionsContainer) return;

    optionsContainer.innerHTML = '';

    const allOpt = document.createElement('div');
    allOpt.className = 'custom-option';
    allOpt.setAttribute('data-value', '');
    allOpt.textContent = 'All Departments';
    optionsContainer.appendChild(allOpt);

    sortedDepts.forEach(d => {
      const opt = document.createElement('div');
      opt.className = 'custom-option';
      opt.setAttribute('data-value', d);
      opt.textContent = d;
      optionsContainer.appendChild(opt);
    });

    const options = optionsContainer.querySelectorAll('.custom-option');
    const hiddenSelect = document.getElementById('filter-dept');
    const displayValue = document.getElementById('custom-select-value-filter-dept');
    const wrapper = document.getElementById('custom-select-filter-dept');

    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = option.getAttribute('data-value');
        hiddenSelect.value = val;
        hiddenSelect.dispatchEvent(new Event('change'));
        hiddenSelect.dispatchEvent(new Event('input'));
        wrapper.classList.remove('open');
        wrapper.classList.remove('open-top');
      });
    });

    const activeVal = hiddenSelect ? hiddenSelect.value : '';
    const activeText = activeVal || 'All Departments';
    if (displayValue) displayValue.textContent = activeText;
  }

  function exportToCSV(members) {
    if (!members || members.length === 0) {
      showToast('No Data', 'No members found to export.', 'error');
      return;
    }

    const headers = [
      'Access Key', 'Name', 'Email', 'Phone', 'Department', 'Session/Batch', 
      'Tier', 'Status', 'Borrow Limit', 'Start Date', 'Expiry Date',
      'Student ID', 'Degree Level', 'Faculty', 'Program', 'Semester', 'Campus', 'Advisor',
      'Date of Birth', 'Gender', 'Blood Group', 'Nationality', 'NID/Passport', 'Alt Phone', 
      'Present Address', 'Permanent Address', 'City', 'Postcode', 'Country',
      'Emergency Contact Name', 'Emergency Contact Relationship', 'Emergency Contact Phone', 'Emergency Contact Address',
      'Branch', 'Borrowing Category', 'Preferred Contact Method'
    ];

    const csvRows = [headers.join(',')];

    for (const m of members) {
      const values = [
        m.k || '',
        m.n || '',
        m.e || '',
        m.phone || m.personal_info?.alt_phone || '',
        m.d || m.student_info?.department || '',
        m.b || m.student_info?.session || '',
        m.tr || 'Standard',
        m.membership_details?.status || 'Active',
        m.l || '5',
        m.membership_details?.start_date || '',
        m.t || m.membership_details?.expiry_date || '',
        m.student_info?.student_id || '',
        m.student_info?.degree_level || '',
        m.student_info?.faculty || '',
        m.student_info?.program || '',
        m.student_info?.semester || '',
        m.student_info?.campus || '',
        m.student_info?.advisor || '',
        m.personal_info?.dob || '',
        m.personal_info?.gender || '',
        m.personal_info?.blood_group || '',
        m.personal_info?.nationality || '',
        m.personal_info?.nid_passport || '',
        m.personal_info?.alt_phone || '',
        m.a || m.personal_info?.present_address || '',
        m.personal_info?.permanent_address || '',
        m.personal_info?.city || '',
        m.personal_info?.postcode || '',
        m.personal_info?.country || '',
        m.emergency_contact?.name || '',
        m.emergency_contact?.relationship || '',
        m.emergency_contact?.phone || '',
        m.emergency_contact?.address || '',
        m.membership_details?.branch || '',
        m.membership_details?.category || '',
        m.membership_details?.contact_method || ''
      ];

      const escapedValues = values.map(val => {
        let str = String(val);
        str = str.replace(/"/g, '""');
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str}"`;
        }
        return str;
      });

      csvRows.push(escapedValues.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, 'AETHER-LMS-Directory.csv');
    showToast('Export Complete', 'Members directory successfully exported to CSV.', 'success');
  }

  function exportToJSON(members) {
    if (!members || members.length === 0) {
      showToast('No Data', 'No members found to export.', 'error');
      return;
    }
    const jsonContent = JSON.stringify(members, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    triggerDownload(blob, 'AETHER-LMS-Directory.json');
    showToast('Export Complete', 'Members directory successfully exported to JSON.', 'success');
  }

  const btnAdminClose = document.getElementById('btn-admin-close');
  if (btnAdminClose) {
    btnAdminClose.addEventListener('click', (e) => {
      e.preventDefault();

      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth()) {
        firebase.auth().signOut()
          .then(() => {
            console.log("Signed out of Firebase Auth successfully.");
          })
          .catch(err => {
            console.warn("Firebase signout error:", err);
          });
      }
      isAdminAuthenticated = false;
      sessionStorage.removeItem('isAdminAuthenticated');
      window.location.href = '../index.html';
    });
  }

  const adminSearchInput = document.getElementById('admin-search-input');
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', () => {
      renderAdminDirectory();
    });
  }

  const filterTier = document.getElementById('filter-tier');
  if (filterTier) {
    filterTier.addEventListener('change', () => {
      renderAdminDirectory();
    });
  }

  const filterDept = document.getElementById('filter-dept');
  if (filterDept) {
    filterDept.addEventListener('change', () => {
      renderAdminDirectory();
    });
  }

  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) {
    filterStatus.addEventListener('change', () => {
      renderAdminDirectory();
    });
  }

  // Export dropdown
  const exportToggle = document.getElementById('btn-export-dropdown-toggle');
  const exportMenu = document.getElementById('export-dropdown-menu');
  const exportChevron = document.getElementById('export-chevron');

  if (exportToggle && exportMenu) {
    exportToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = exportMenu.style.display === 'block';
      exportMenu.style.display = isOpen ? 'none' : 'block';
      if (exportChevron) {
        exportChevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        exportChevron.style.transition = 'transform 0.2s';
      }
    });

    document.addEventListener('click', (e) => {
      if (!exportToggle.contains(e.target) && !exportMenu.contains(e.target)) {
        exportMenu.style.display = 'none';
        if (exportChevron) {
          exportChevron.style.transform = 'rotate(0deg)';
        }
      }
    });
  }

  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      exportToCSV(currentFilteredMembers);
      if (exportMenu) {
        exportMenu.style.display = 'none';
        if (exportChevron) exportChevron.style.transform = 'rotate(0deg)';
      }
    });
  }

  const btnExportJson = document.getElementById('btn-export-json');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      exportToJSON(currentFilteredMembers);
      if (exportMenu) {
        exportMenu.style.display = 'none';
        if (exportChevron) exportChevron.style.transform = 'rotate(0deg)';
      }
    });
  }

  // Initialize admin custom select filters
  if (document.getElementById('custom-select-filter-tier')) {
    setupCustomSelect({
      wrapperId: 'custom-select-filter-tier',
      triggerId: 'custom-select-trigger-filter-tier',
      valueId: 'custom-select-value-filter-tier',
      optionsContainerId: 'custom-select-options-filter-tier',
      hiddenSelectId: 'filter-tier',
      placeholderText: 'All Tiers',
      onChange: () => {
        renderAdminDirectory();
      }
    });
  }

  if (document.getElementById('custom-select-filter-status')) {
    setupCustomSelect({
      wrapperId: 'custom-select-filter-status',
      triggerId: 'custom-select-trigger-filter-status',
      valueId: 'custom-select-value-filter-status',
      optionsContainerId: 'custom-select-options-filter-status',
      hiddenSelectId: 'filter-status',
      placeholderText: 'All Statuses',
      onChange: () => {
        renderAdminDirectory();
      }
    });
  }

  if (document.getElementById('custom-select-filter-dept')) {
    setupCustomSelect({
      wrapperId: 'custom-select-filter-dept',
      triggerId: 'custom-select-trigger-filter-dept',
      valueId: 'custom-select-value-filter-dept',
      optionsContainerId: 'custom-select-options-filter-dept',
      hiddenSelectId: 'filter-dept',
      placeholderText: 'All Departments',
      hasSearch: true,
      searchPlaceholder: 'Search department...',
      onChange: () => {
        renderAdminDirectory();
      }
    });
  }

  checkSharedLink();
  blockAutosave = false;
});

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes shake-panel {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(styleSheet);
