document.addEventListener('DOMContentLoaded', () => {
  
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

  function isViewingShared() {
    const hash = window.location.hash;
    return hash && decodeURIComponent(hash).startsWith('#share=');
  }

  function getSharePayload() {
    const deptInput = document.getElementById('department');
    const deptValText = deptInput ? deptInput.value.trim() : 'DEPT';
    const semInput = document.getElementById('semester');
    const semValText = semInput ? semInput.value.trim() : 'SEMESTER';

    const semMap = {
      '1st Sem': '1', '2nd Sem': '2', '3rd Sem': '3', '4th Sem': '4', '5th Sem': '5',
      '6th Sem': '6', '7th Sem': '7', '8th Sem': '8', '9th Sem': '9', '10th Sem': '10'
    };
    const tierMap = { 'Standard': 'S', 'Premium': 'P', 'VIP': 'V' };

    const nameVal = previewName.textContent === DEFAULTS.name ? "" : previewName.textContent;
    const deptVal = (deptValText === 'DEPT' || deptValText === 'Select Department' || deptValText === "") ? "" : deptValText;
    const sessionInput = document.getElementById('admission_session');
    const batchValText = sessionInput ? sessionInput.value.trim() : 'Batch 60';
    const batchVal = (batchValText === 'Batch 60' || batchValText === "") ? "" : batchValText.replace(/Batch\s+/i, '');
    const semVal = (semValText === 'SEMESTER' || semValText === 'Select Semester' || semValText === "") ? "" : (semMap[semValText] || semValText);
    const emailVal = previewEmail.textContent === DEFAULTS.email ? "" : previewEmail.textContent;
    const phoneVal = previewPhone.textContent === DEFAULTS.phone ? "" : previewPhone.textContent;
    const limitValText = previewLimit.textContent;
    const limitDigits = limitValText.match(/\d+/);
    const limitVal = (limitDigits && limitDigits[0] === String(DEFAULTS.limit)) ? "" : (limitDigits ? limitDigits[0] : "");
    const termVal = previewTerm.textContent === DEFAULTS.term ? "" : previewTerm.textContent;
    const keyValText = previewCardKey.textContent;
    const keyVal = keyValText.startsWith('LMS-') ? keyValText.replace('LMS-', '') : keyValText;
    const themeValText = libraryCard.style.getPropertyValue('--user-card-theme') || DEFAULTS.theme;
    const themeVal = themeValText === DEFAULTS.theme ? "" : themeValText.replace('#', '');
    const addrText = document.getElementById('preview-address') ? document.getElementById('preview-address').textContent : '';
    const addrVal = (addrText === '' || addrText === 'No specific special clearances or address declared.') ? "" : addrText;
    const tierText = previewTier.querySelector('span') ? previewTier.querySelector('span').textContent : 'Standard';
    const tierVal = tierText === DEFAULTS.tier ? "" : (tierMap[tierText] || tierText);

    const cardDataArray = [
      nameVal,
      deptVal,
      batchVal,
      semVal,
      emailVal,
      phoneVal,
      limitVal,
      termVal,
      keyVal,
      themeVal,
      addrVal,
      tierVal,
      cloudinaryAvatarUrl ? getCloudinaryPath(cloudinaryAvatarUrl) : compressedAvatarBase64
    ];

    const rawString = cardDataArray.join('\u001f');
    return btoa(unescape(encodeURIComponent(rawString))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

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

  const DEFAULTS = {
    name: 'Your User Name',
    email: 'example@domain.com',
    phone: '+00 000-0000',
    tier: 'Standard',
    limit: 1,
    term: 'DEC 2026',
    theme: '#06b6d4'
  };

  function generateCardKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randPart1 = Math.floor(1000 + Math.random() * 9000);
    const randPart2 = Math.floor(10 + Math.random() * 89);
    const randChar = chars[Math.floor(Math.random() * chars.length)];
    const key = `LMS-${randPart1}-${randPart2}${randChar}`;
    previewCardKey.textContent = key;

    const qrImage = document.getElementById('preview-qr');
    if (qrImage) {
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(key)}&color=ffffff&bgcolor=12131a`;
    }
  }
  generateCardKey();

  const updatePreviewName = () => {
    if (isViewingShared()) return;
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

  inputEmail.addEventListener('input', (e) => {
    if (isViewingShared()) return;
    previewEmail.textContent = e.target.value.trim() || DEFAULTS.email;
  });

  inputPhone.addEventListener('input', (e) => {
    if (isViewingShared()) return;
    previewPhone.textContent = e.target.value.trim() || DEFAULTS.phone;
  });

  const radioTiers = document.querySelectorAll('input[name="tier"]');
  const tierMap = {
    'Standard': { icon: 'shield', label: 'Standard', class: 'tier-standard' },
    'Premium': { icon: 'zap', label: 'Premium', class: 'tier-premium' },
    'VIP': { icon: 'crown', label: 'VIP', class: 'tier-vip' }
  };

  radioTiers.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (isViewingShared()) return;
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

  inputCardTheme.addEventListener('input', (e) => {
    if (isViewingShared()) return;
    const chosenColor = e.target.value;
    labelColorHex.textContent = chosenColor;

    libraryCard.style.setProperty('--user-card-theme', chosenColor);

    document.documentElement.style.setProperty('--accent-primary', chosenColor);
  });

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
    if (isViewingShared()) return;
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

  document.querySelectorAll('input[name="card_status"]').forEach(radio => {
    radio.addEventListener('change', () => {
      highlightInputError(radio, false);
    });
  });

  inputMembershipExpiry.addEventListener('input', (e) => {
    if (isViewingShared()) return;
    if (!e.target.value) {
      previewTerm.textContent = DEFAULTS.term;
      return;
    }
    const [year, month, day] = e.target.value.split('-');
    const date = new Date(year, month - 1, day);
    const monthStr = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    previewTerm.textContent = `${monthStr} ${year}`;
  });

  async function sha1(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async function uploadToCloudinary(base64Data) {
    const env = window.ENV || {};
    const cloudName = env.CLOUDINARY_CLOUD_NAME || 'dorjgyfdl';
    const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET || 'lms-form';
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured');
    }

    const formData = new FormData();
    if (base64Data.startsWith('data:')) {
      formData.append('file', base64Data);
    } else {
      formData.append('file', `data:image/jpeg;base64,${base64Data}`);
    }

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

      const wrapper = successToast.querySelector('.toast-icon-wrapper');
      if (wrapper) {
        let iconName = 'check-circle';
        if (typeOrError === 'loading') {
          iconName = 'loader-2';
        } else if (typeOrError === 'error' || typeOrError === true) {
          iconName = 'alert-circle';
        }
        wrapper.innerHTML = `<i data-lucide="${iconName}"></i>`;
        const iconEl = wrapper.querySelector('i');
        if (typeOrError === 'loading' && iconEl) {
          iconEl.classList.add('spin');
        }
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        const svgEl = wrapper.querySelector('svg');
        if (svgEl) {
          if (typeOrError === 'loading') {
            svgEl.classList.add('spin');
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

  let compressedAvatarBase64 = '';
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

  inputAvatar.addEventListener('change', (e) => {
    if (isViewingShared()) return;
    const file = e.target.files[0];
    if (file) {
      const maxSize = 1048576;
      if (file.size > maxSize) {
        showToast('File Too Large', 'Student photo must be less than 1MB.', true);
        inputAvatar.value = '';
        resetAvatarPreview();
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        previewAvatar.src = event.target.result;
        previewAvatar.style.display = 'block';
        previewAvatarIcon.style.display = 'none';
        dropzoneAvatar.classList.add('has-file');
        labelFile.textContent = 'Compressing...';
        compressAvatar(event.target.result, (base64) => {
          compressedAvatarBase64 = base64;
          labelFile.textContent = file.name;
        });
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
    compressedAvatarBase64 = '';
    cloudinaryAvatarUrl = '';
  }

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
      inputAvatar.files = dt.files;
      
      const event = new Event('change');
      inputAvatar.dispatchEvent(event);
    }
  });

  let cloudinaryEnrollmentUrl = '';
  let tempEnrollmentBase64 = '';

  if (inputEnrollment && dropzoneEnrollment && labelEnrollmentFile) {
    inputEnrollment.addEventListener('change', (e) => {
      if (isViewingShared()) return;
      const file = e.target.files[0];
      if (file) {
        const maxSize = 1048576; 
        if (file.size > maxSize) {
          showToast('File Too Large', 'Enrollment proof must be less than 1MB.', true);
          inputEnrollment.value = '';
          cloudinaryEnrollmentUrl = '';
          tempEnrollmentBase64 = '';
          dropzoneEnrollment.classList.remove('has-file');
          labelEnrollmentFile.textContent = 'Choose PDF or Image';
          return;
        }
        dropzoneEnrollment.classList.add('has-file');
        labelEnrollmentFile.textContent = 'Document selected';

        const reader = new FileReader();
        reader.onload = (event) => {
          tempEnrollmentBase64 = event.target.result;
          labelEnrollmentFile.textContent = file.name;
        };
        reader.readAsDataURL(file);
      } else {
        cloudinaryEnrollmentUrl = '';
        tempEnrollmentBase64 = '';
        dropzoneEnrollment.classList.remove('has-file');
        labelEnrollmentFile.textContent = 'Choose PDF or Image';
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

    const glowAngle = Math.atan2(y - cardRect.height / 2, x - cardRect.width / 2) * (180 / Math.PI);
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

  const viewerCardPlacement = document.getElementById('viewer-card-placement');
  if (viewerCardPlacement) {
    viewerCardPlacement.addEventListener('mousemove', (e) => handleTiltMove(e, viewerCardPlacement));
    viewerCardPlacement.addEventListener('mouseleave', handleTiltLeave);
  }

  btnReset.addEventListener('click', () => {
    
    setTimeout(() => {
      
      previewName.textContent = DEFAULTS.name;
      previewEmail.textContent = DEFAULTS.email;
      previewPhone.textContent = DEFAULTS.phone;
      previewTier.textContent = DEFAULTS.tier;

      previewLimit.textContent = `${DEFAULTS.limit} BOOK${DEFAULTS.limit > 1 ? 'S' : ''}`;
      labelLimitValue.textContent = DEFAULTS.limit;
      updateSliderTicks(DEFAULTS.limit);
      updateSliderProgress(inputBorrowLimit);

      previewTerm.textContent = DEFAULTS.term;

      labelColorHex.textContent = DEFAULTS.theme;
      libraryCard.style.setProperty('--user-card-theme', DEFAULTS.theme);
      document.documentElement.style.setProperty('--accent-primary', DEFAULTS.theme);

      resetAvatarPreview();
      generateCardKey();

      const controls = form.querySelectorAll('.input-control');
      controls.forEach(control => {
        control.style.borderColor = '';
        control.style.boxShadow = '';
      });

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
      tempEnrollmentBase64 = '';

      previewTier.className = 'card-type tier-standard';
      previewTier.innerHTML = `<i data-lucide="shield"></i><span>Standard</span>`;
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      if (dobPicker) dobPicker.reset();
      if (startDatePicker) startDatePicker.reset();
      if (expiryDatePicker) expiryDatePicker.reset();
    }, 50);
  });

  form.addEventListener('submit', (e) => {
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

    setTimeout(async () => {
      if (compressedAvatarBase64) {
        try {
          cloudinaryAvatarUrl = await uploadToCloudinary(compressedAvatarBase64);
        } catch (err) {
          console.error(err);
        }
      }
      if (tempEnrollmentBase64) {
        try {
          cloudinaryEnrollmentUrl = await uploadToCloudinary(tempEnrollmentBase64);
        } catch (err) {
          console.error(err);
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

      const payload = getSharePayload();

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
        av: cloudinaryAvatarUrl || compressedAvatarBase64,
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

      DB.saveMember(memberRecord);

      const successModal = document.getElementById('success-modal');
      if (successModal) {
        successModal.classList.add('open');
      }

      triggerConfetti();

      const btnSuccessView = document.getElementById('btn-success-view');
      if (btnSuccessView) {
        btnSuccessView.onclick = () => {
          successModal.classList.remove('open');
          
          window.location.hash = `share=${payload}`;

          btnReset.click();
        };
      }

      const btnSuccessClose = document.getElementById('btn-success-close');
      if (btnSuccessClose) {
        btnSuccessClose.onclick = () => {
          successModal.classList.remove('open');
          
          btnReset.click();
        };
      }
    }, 1600);
  });

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
      if (isViewingShared()) return;
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
      if (isViewingShared()) return;
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
      if (isViewingShared()) return;
      const el = document.getElementById('preview-batch');
      if (el) el.textContent = e.target.value.trim().toUpperCase() || 'BATCH N/A';
    });
  }

  const inputSemester = document.getElementById('semester');
  if (inputSemester) {
    inputSemester.addEventListener('input', (e) => {
      if (isViewingShared()) return;
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
      if (isViewingShared()) return;
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
    logging: false
  };

  const btnDownloadImg = document.getElementById('btn-download-img');
  if (btnDownloadImg) {
    btnDownloadImg.addEventListener('click', async () => {
      const cardEl = document.getElementById('library-id-card');
      if (!cardEl) return;
      const frontSide = cardEl.querySelector('.card-front');
      const backSide = cardEl.querySelector('.card-back');
      if (!frontSide || !backSide) return;

      showToast('Downloading Images', 'Compiling card assets...', 'loading');

      btnDownloadImg.style.opacity = '0.5';
      btnDownloadImg.style.pointerEvents = 'none';

      const containerFront = document.createElement('div');
      containerFront.style.position = 'fixed';
      containerFront.style.left = '-9999px';
      containerFront.style.top = '-9999px';
      containerFront.style.width = getComputedStyle(cardEl).width;
      containerFront.style.height = getComputedStyle(cardEl).height;
      containerFront.style.opacity = '1';
      containerFront.style.visibility = 'visible';

      const containerBack = document.createElement('div');
      containerBack.style.position = 'fixed';
      containerBack.style.left = '-9999px';
      containerBack.style.top = '-9999px';
      containerBack.style.width = getComputedStyle(cardEl).width;
      containerBack.style.height = getComputedStyle(cardEl).height;
      containerBack.style.opacity = '1';
      containerBack.style.visibility = 'visible';

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

      try {
        const [canvasFront, canvasBack] = await Promise.all([
          html2canvas(frontClone, renderOpts),
          html2canvas(backClone, renderOpts)
        ]);

        restoreColorMix(snapsFront);
        restoreCardAfterCapture(frontClone, savedFront);
        restoreColorMix(snapsBack);
        restoreCardAfterCapture(backClone, savedBack);

        document.body.removeChild(containerFront);
        document.body.removeChild(containerBack);

        const zip = new JSZip();

        const [frontBlob, backBlob] = await Promise.all([
          new Promise(resolve => canvasFront.toBlob(resolve, 'image/png')),
          new Promise(resolve => canvasBack.toBlob(resolve, 'image/png'))
        ]);

        zip.file('AETHER-LMS-Card-Front.png', frontBlob);
        zip.file('AETHER-LMS-Card-Back.png', backBlob);

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        triggerDownload(zipBlob, 'AETHER-LMS-Card-Images.zip');

        showToast('Download Complete', 'Your card images ZIP has been saved.', 'success');
      } catch (err) {
        console.error('Image rendering failed:', err);
        if (containerFront.parentNode) {
          document.body.removeChild(containerFront);
        }
        if (containerBack.parentNode) {
          document.body.removeChild(containerBack);
        }
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

      showToast('Downloading PDF', 'Compiling high-quality PDF...', 'loading');

      btnDownloadPdf.style.opacity = '0.5';
      btnDownloadPdf.style.pointerEvents = 'none';

      const containerFront = document.createElement('div');
      containerFront.style.position = 'fixed';
      containerFront.style.left = '-9999px';
      containerFront.style.top = '-9999px';
      containerFront.style.width = getComputedStyle(cardEl).width;
      containerFront.style.height = getComputedStyle(cardEl).height;
      containerFront.style.opacity = '1';
      containerFront.style.visibility = 'visible';

      const containerBack = document.createElement('div');
      containerBack.style.position = 'fixed';
      containerBack.style.left = '-9999px';
      containerBack.style.top = '-9999px';
      containerBack.style.width = getComputedStyle(cardEl).width;
      containerBack.style.height = getComputedStyle(cardEl).height;
      containerBack.style.opacity = '1';
      containerBack.style.visibility = 'visible';

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

      try {
        const [canvasFront, canvasBack] = await Promise.all([
          html2canvas(frontClone, renderOpts),
          html2canvas(backClone, renderOpts)
        ]);

        restoreColorMix(snapsFront);
        restoreCardAfterCapture(frontClone, savedFront);
        restoreColorMix(snapsBack);
        restoreCardAfterCapture(backClone, savedBack);

        document.body.removeChild(containerFront);
        document.body.removeChild(containerBack);

        const frontImg = canvasFront.toDataURL('image/png');
        const backImg = canvasBack.toDataURL('image/png');

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

        pdf.addImage(frontImg, 'PNG', x, y, cardW, cardH);
        pdf.addPage();
        pdf.addImage(backImg, 'PNG', x, y, cardW, cardH);

        const pdfBlob = pdf.output('blob');

        triggerDownload(pdfBlob, 'AETHER-LMS-Card.pdf');

        showToast('Download Complete', 'Your library card PDF has been saved.', 'success');
      } catch (err) {
        console.error('PDF generation failed:', err);
        if (containerFront.parentNode) {
          document.body.removeChild(containerFront);
        }
        if (containerBack.parentNode) {
          document.body.removeChild(containerBack);
        }
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
    if (ogImage && !ogImage.content.startsWith('http')) {
      ogImage.content = baseUrl + ogImage.content;
    }
    if (twImage && !twImage.content.startsWith('http')) {
      twImage.content = baseUrl + twImage.content;
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
    btnShare.addEventListener('click', () => {
      const payload = getSharePayload();
      const currentUrl = window.location.href.split('#')[0];
      const finalShareUrl = `${currentUrl}#share=${payload}`;

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
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        setTimeout(() => {
          btnCopyShareLink.innerHTML = `<i data-lucide="copy" id="copy-icon"></i><span id="copy-btn-text">Copy</span>`;
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

  function checkSharedLink() {
    const rawHash = window.location.hash;
    const hash = rawHash ? decodeURIComponent(rawHash) : '';
    const appWrapper = document.querySelector('.app-wrapper');
    const sharedViewerMode = document.getElementById('shared-viewer-mode');
    const adminPanelMode = document.getElementById('admin-panel-mode');
    const adminLoginMode = document.getElementById('admin-login-mode');
    const adminLoginError = document.getElementById('admin-login-error');

    if (sharedViewerMode) sharedViewerMode.style.display = 'none';
    if (adminPanelMode) adminPanelMode.style.display = 'none';
    if (adminLoginMode) adminLoginMode.style.display = 'none';
    if (appWrapper) appWrapper.style.display = '';
    if (mainNavbar) mainNavbar.style.display = '';
    if (beamContainer) beamContainer.style.display = '';
    skelRails.forEach(rail => rail.style.display = '');

    if (adminLoginError) adminLoginError.style.display = 'none';

    if (hash && hash.startsWith('#share=')) {
      const sharePayload = hash.replace('#share=', '');
      try {
        let decodedData = {};
        
        let normalizedPayload = sharePayload.replace(/-/g, '+').replace(/_/g, '/');
        while (normalizedPayload.length % 4) {
          normalizedPayload += '=';
        }
        const decodedString = decodeURIComponent(escape(atob(normalizedPayload)));

        if (decodedString.includes('\u001f')) {
          const parsed = decodedString.split('\u001f');
          
          const tierMap = { 'S': 'Standard', 'P': 'Premium', 'V': 'VIP' };
          const semRevMap = {
            '1': '1st Sem', '2': '2nd Sem', '3': '3rd Sem', '4': '4th Sem', '5': '5th Sem',
            '6': '6th Sem', '7': '7th Sem', '8': '8th Sem', '9': '9th Sem', '10': '10th Sem'
          };

          const rawLimit = parsed[6];
          const limitText = rawLimit ? `${rawLimit} BOOK${rawLimit > 1 ? 'S' : ''}` : `${DEFAULTS.limit} BOOKS`;

          decodedData = {
            n: parsed[0] || DEFAULTS.name,
            d: parsed[1] || 'DEPT N/A',
            b: parsed[2] ? `Batch ${parsed[2]}` : 'BATCH N/A',
            s: parsed[3] ? (semRevMap[parsed[3]] || parsed[3]) : 'SEMESTER N/A',
            e: parsed[4] || DEFAULTS.email,
            p: parsed[5] || DEFAULTS.phone,
            l: limitText,
            t: parsed[7] || DEFAULTS.term,
            k: parsed[8] ? (parsed[8].startsWith('LMS-') ? parsed[8] : `LMS-${parsed[8]}`) : '',
            th: parsed[9] ? (parsed[9].startsWith('#') ? parsed[9] : `#${parsed[9]}`) : DEFAULTS.theme,
            a: parsed[10] || 'No specific special clearances or address declared.',
            tr: tierMap[parsed[11]] || parsed[11] || DEFAULTS.tier,
            av: parsed[12] || ''
          };
        } else {
          const parsed = JSON.parse(decodedString);
          if (Array.isArray(parsed)) {
            decodedData = {
              n: parsed[0] || DEFAULTS.name,
              d: parsed[1] || 'DEPT N/A',
              b: parsed[2] || 'BATCH N/A',
              s: parsed[3] || 'SEMESTER N/A',
              e: parsed[4] || DEFAULTS.email,
              p: parsed[5] || DEFAULTS.phone,
               l: parsed[6] || `${DEFAULTS.limit} BOOK${DEFAULTS.limit > 1 ? 'S' : ''}`,
              t: parsed[7] || DEFAULTS.term,
              k: parsed[8],
              th: parsed[9] || DEFAULTS.theme,
              a: parsed[10] || 'No specific special clearances or address declared.',
              tr: parsed[11] || DEFAULTS.tier
            };
          } else {
            decodedData = {
              n: parsed.n || DEFAULTS.name,
              d: parsed.d || 'DEPT N/A',
              b: parsed.b || 'BATCH N/A',
              s: parsed.s || 'SEMESTER N/A',
              e: parsed.e || DEFAULTS.email,
              p: parsed.p || DEFAULTS.phone,
               l: parsed.l || `${DEFAULTS.limit} BOOK${DEFAULTS.limit > 1 ? 'S' : ''}`,
              t: parsed.t || DEFAULTS.term,
              k: parsed.k,
              th: parsed.th || DEFAULTS.theme,
              a: parsed.a || 'No specific special clearances or address declared.',
              tr: parsed.tr || DEFAULTS.tier
            };
          }
        }

        if (previewName) previewName.textContent = decodedData.n;
        if (document.getElementById('preview-dept')) document.getElementById('preview-dept').textContent = decodedData.d;
        if (document.getElementById('preview-batch')) document.getElementById('preview-batch').textContent = decodedData.b.toUpperCase();
        if (document.getElementById('preview-semester')) document.getElementById('preview-semester').textContent = decodedData.s.toUpperCase();
        if (previewEmail) previewEmail.textContent = decodedData.e;
        if (previewPhone) previewPhone.textContent = decodedData.p;
        if (previewLimit) previewLimit.textContent = decodedData.l;
        if (previewTerm) previewTerm.textContent = decodedData.t;
        if (previewCardKey) previewCardKey.textContent = decodedData.k;

        if (decodedData.av) {
          if (previewAvatar) {
            console.log("checkSharedLink: Raw avatar data from payload =", decodedData.av);
            let avatarSrc = decodedData.av;
            
            if (avatarSrc.startsWith('c:')) {
              
              const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
              avatarSrc = `https://res.cloudinary.com/${cloudName}/image/upload/${avatarSrc.substring(2)}`;
            } else if (avatarSrc.startsWith('http://') || avatarSrc.startsWith('https://')) {
              
            } else if (avatarSrc.includes('lms_avatars/') || avatarSrc.includes('lms-avatars/')) {
              
              const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
              avatarSrc = `https://res.cloudinary.com/${cloudName}/image/upload/${avatarSrc}`;
            } else {
              
              avatarSrc = 'data:image/jpeg;base64,' + avatarSrc;
            }
            console.log("checkSharedLink: Final constructed avatar URL =", avatarSrc);
            previewAvatar.src = avatarSrc;
            previewAvatar.style.display = 'block';
          }
          if (previewAvatarIcon) {
            previewAvatarIcon.style.display = 'none';
          }
        } else {
          if (previewAvatar) {
            previewAvatar.src = '';
            previewAvatar.style.display = 'none';
          }
          if (previewAvatarIcon) {
            previewAvatarIcon.style.display = 'block';
          }
        }

        const previewAddr = document.getElementById('preview-address');
        if (previewAddr) previewAddr.textContent = decodedData.a || 'No specific special clearances or address declared.';

        if (previewTier) {
          previewTier.className = 'card-type'; 
          const tierVal = decodedData.tr || 'Standard';
          let iconName = 'shield';
          let tierClass = 'tier-standard';
          if (tierVal === 'Premium') {
            iconName = 'zap';
            tierClass = 'tier-premium';
          } else if (tierVal === 'VIP') {
            iconName = 'crown';
            tierClass = 'tier-vip';
          }
          previewTier.classList.add(tierClass);
          previewTier.innerHTML = `<i data-lucide="${iconName}"></i><span>${tierVal}</span>`;
        }

        if (libraryCard) {
          libraryCard.style.setProperty('--user-card-theme', decodedData.th);
        }
        document.documentElement.style.setProperty('--accent-primary', decodedData.th);

        const qrImage = document.getElementById('preview-qr');
        if (qrImage) {
          qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(decodedData.k)}&color=ffffff&bgcolor=12131a`;
        }

        if (libraryCard && libraryCard.classList.contains('flipped')) {
          libraryCard.classList.remove('flipped');
          libraryCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
        }

        const viewerCardPlacement = document.getElementById('viewer-card-placement');
        if (viewerCardPlacement && libraryCard) {
          viewerCardPlacement.appendChild(libraryCard);
        }

        if (appWrapper) appWrapper.style.display = 'none';
        if (mainNavbar) mainNavbar.style.display = 'none';
        if (beamContainer) beamContainer.style.display = 'none';
        skelRails.forEach(rail => rail.style.display = 'none');
        if (sharedViewerMode) sharedViewerMode.style.display = 'flex';

        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      } catch (err) {
        console.error('Failed to parse shared preview link:', err);
      }
    } else if (hash === '#admin') {
      if (appWrapper) appWrapper.style.display = 'none';
      if (mainNavbar) mainNavbar.style.display = 'none';
      if (beamContainer) beamContainer.style.display = 'none';
      skelRails.forEach(rail => rail.style.display = 'none');
      
      if (isAdminAuthenticated) {
        if (adminPanelMode) adminPanelMode.style.display = 'flex';
        renderAdminDirectory();
      } else {
        if (adminLoginMode) adminLoginMode.style.display = 'flex';
        
        setTimeout(() => {
          const uInput = document.getElementById('admin-username');
          if (uInput) uInput.focus();
        }, 50);
      }
    } else {
      
      if (sharedViewerMode) sharedViewerMode.style.display = 'none';
      if (adminPanelMode) adminPanelMode.style.display = 'none';
      if (appWrapper) appWrapper.style.display = '';
      if (mainNavbar) mainNavbar.style.display = '';
      if (beamContainer) beamContainer.style.display = '';
      skelRails.forEach(rail => rail.style.display = '');

      generateCardKey();

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

      if (compressedAvatarBase64) {
        if (previewAvatar) {
          previewAvatar.src = 'data:image/jpeg;base64,' + compressedAvatarBase64;
          previewAvatar.style.display = 'block';
        }
        if (previewAvatarIcon) {
          previewAvatarIcon.style.display = 'none';
        }
      } else {
        if (previewAvatar) {
          previewAvatar.src = '';
          previewAvatar.style.display = 'none';
        }
        if (previewAvatarIcon) {
          previewAvatarIcon.style.display = 'block';
        }
      }

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }

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

  if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth()) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        isAdminAuthenticated = true;
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        if (window.location.hash === '#admin') {
          const adminPanelMode = document.getElementById('admin-panel-mode');
          if (adminPanelMode && adminPanelMode.style.display !== 'flex') {
            const adminLoginMode = document.getElementById('admin-login-mode');
            const appWrapper = document.querySelector('.app-wrapper');
            const mainNavbar = document.getElementById('main-navbar');
            const beamContainer = document.querySelector('.beam-container');
            const skelRails = document.querySelectorAll('.skel-rail');

            if (appWrapper) appWrapper.style.display = 'none';
            if (mainNavbar) mainNavbar.style.display = 'none';
            if (beamContainer) beamContainer.style.display = 'none';
            skelRails.forEach(rail => rail.style.display = 'none');
            if (adminLoginMode) adminLoginMode.style.display = 'none';
            adminPanelMode.style.display = 'flex';

            renderAdminDirectory();
          } else if (adminPanelMode && adminPanelMode.style.display === 'flex') {
            
            renderAdminDirectory();
          }
        }
      } else {
        if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
          isAdminAuthenticated = false;
          sessionStorage.removeItem('isAdminAuthenticated');
          if (window.location.hash === '#admin') {
            checkSharedLink();
          }
        }
      }
    });
  }

  const DB = {
    getFirebaseUrl() {
      return (window.ENV && window.ENV.FIREBASE_URL) ? window.ENV.FIREBASE_URL.replace(/\/$/, '') : null;
    },

    async saveMember(member) {
      
      if (firestoreDb) {
        try {
          await firestoreDb.collection('members').doc(member.k).set(member);
          console.log("Member saved to Firestore:", member.k);
          return member;
        } catch (err) {
          console.warn('Firestore set failed, attempting fallback:', err);
        }
      }

      const firebaseUrl = this.getFirebaseUrl();
      if (firebaseUrl) {
        try {
          const response = await fetch(`${firebaseUrl}/members/${member.k}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
          });
          if (!response.ok) throw new Error('Firebase REST save failed');
          return await response.json();
        } catch (err) {
          console.warn('Firebase REST save failed, falling back to LocalStorage:', err);
        }
      }

      const members = this.getLocalMembers();
      members[member.k] = member;
      localStorage.setItem('aether_lms_members', JSON.stringify(members));
      return member;
    },

    async deleteMember(key) {
      
      if (firestoreDb) {
        try {
          await firestoreDb.collection('members').doc(key).delete();
          console.log("Member deleted from Firestore:", key);
        } catch (err) {
          console.warn('Firestore delete failed, attempting fallback:', err);
        }
      }

      const firebaseUrl = this.getFirebaseUrl();
      if (firebaseUrl) {
        try {
          const response = await fetch(`${firebaseUrl}/members/${key}.json`, {
            method: 'DELETE'
          });
          if (!response.ok) throw new Error('Firebase REST delete failed');
        } catch (err) {
          console.warn('Firebase REST delete failed, removing locally:', err);
        }
      }

      const members = this.getLocalMembers();
      delete members[key];
      localStorage.setItem('aether_lms_members', JSON.stringify(members));
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

  function serializeMemberToPayload(m) {
    const semMap = {
      '1st Sem': '1', '2nd Sem': '2', '3rd Sem': '3', '4th Sem': '4', '5th Sem': '5',
      '6th Sem': '6', '7th Sem': '7', '8th Sem': '8', '9th Sem': '9', '10th Sem': '10'
    };
    const tierMap = { 'Standard': 'S', 'Premium': 'P', 'VIP': 'V' };

    const nameVal = m.n === DEFAULTS.name ? "" : m.n;
    const deptVal = (m.d === 'DEPT' || m.d === 'Select Department' || !m.d) ? "" : m.d;
    const batchVal = m.b === 'Batch 60' ? "" : m.b.replace(/Batch\s+/i, '');
    const semVal = (!m.s || m.s === 'SEMESTER' || m.s === 'Select Semester') ? "" : (semMap[m.s] || m.s);
    const emailVal = m.e === DEFAULTS.email ? "" : m.e;
    const phoneVal = m.p === DEFAULTS.phone ? "" : m.p;

    const limitDigits = m.l.match(/\d+/);
    const limitVal = (limitDigits && limitDigits[0] === String(DEFAULTS.limit)) ? "" : (limitDigits ? limitDigits[0] : "");
    const termVal = m.t === DEFAULTS.term ? "" : m.t;
    const keyVal = m.k.startsWith('LMS-') ? m.k.replace('LMS-', '') : m.k;
    const themeVal = m.th === DEFAULTS.theme ? "" : m.th.replace('#', '');
    const addrVal = (m.a === '' || m.a === 'No specific special clearances or address declared.') ? "" : m.a;
    const tierVal = m.tr === DEFAULTS.tier ? "" : (tierMap[m.tr] || m.tr);

    const cardDataArray = [
      nameVal,
      deptVal,
      batchVal,
      semVal,
      emailVal,
      phoneVal,
      limitVal,
      termVal,
      keyVal,
      themeVal,
      addrVal,
      tierVal,
      m.av ? (m.av.startsWith('http') ? getCloudinaryPath(m.av) : m.av) : ""
    ];

    const rawString = cardDataArray.join('\u001f');
    return btoa(unescape(encodeURIComponent(rawString))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  let isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
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
        adminLoginError.style.display = 'none';
        adminLoginForm.reset();

        const adminLoginMode = document.getElementById('admin-login-mode');
        const adminPanelMode = document.getElementById('admin-panel-mode');
        if (adminLoginMode) adminLoginMode.style.display = 'none';
        if (adminPanelMode) adminPanelMode.style.display = 'flex';
        renderAdminDirectory();
      }

      function handleFailedLogin() {
        adminLoginError.style.display = 'block';
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
            handleFailedLogin();
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
    btnLoginCancel.addEventListener('click', () => {
      window.location.hash = '';
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

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  const detailsModal = document.getElementById('admin-details-modal');
  const btnCloseDetailsModal = document.getElementById('btn-close-details-modal');
  const btnCloseDetailsFooter = document.getElementById('btn-close-details-footer');

  function closeDetailsModal() {
    if (detailsModal) {
      detailsModal.style.display = 'none';
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

      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const filtered = Object.values(members).filter(m => {
        if (!m) return false;
        const name = (m.n || '').toLowerCase();
        const key = (m.k || '').toLowerCase();
        const email = (m.e || '').toLowerCase();
        const dept = (m.d || '').toLowerCase();
        return name.includes(query) ||
               key.includes(query) ||
               email.includes(query) ||
               dept.includes(query);
      });

      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
              <i data-lucide="info" style="width: 2rem; height: 2rem; margin-bottom: 0.5rem; color: var(--accent-secondary); display: inline-block;"></i>
              <p style="margin: 0; font-size: 0.85rem;">No members found in database.</p>
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
            <div style="color: var(--text-main); font-weight: 500;">${m.d || 'N/A'}</div>
            <div style="font-size: 0.7rem;">${m.b || 'N/A'}</div>
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

  const btnAdminPanel = document.querySelector('.admin-panel-btn');
  if (btnAdminPanel) {
    btnAdminPanel.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'admin';
    });
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
      window.location.hash = '';
    });
  }

  const adminSearchInput = document.getElementById('admin-search-input');
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', () => {
      renderAdminDirectory();
    });
  }

  const btnViewerCreate = document.getElementById('btn-viewer-create');
  if (btnViewerCreate) {
    btnViewerCreate.addEventListener('click', (e) => {
      e.preventDefault();
      
      history.replaceState(null, '', window.location.pathname);
      checkSharedLink();
    });
  }

  window.addEventListener('hashchange', checkSharedLink);
  checkSharedLink();
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
