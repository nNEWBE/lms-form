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

  // Helper to check if viewing a shared card link
  function isViewingShared() {
    const hash = window.location.hash;
    return hash && decodeURIComponent(hash).startsWith('#share=');
  }

  // Helper to compress and generate the share payload
  function getSharePayload() {
    const deptValText = document.getElementById('custom-select-value-dept') ? document.getElementById('custom-select-value-dept').textContent : 'DEPT';
    const semValText = document.getElementById('custom-select-value-semester') ? document.getElementById('custom-select-value-semester').textContent : 'SEMESTER';

    const semMap = {
      '1st Sem': '1', '2nd Sem': '2', '3rd Sem': '3', '4th Sem': '4', '5th Sem': '5',
      '6th Sem': '6', '7th Sem': '7', '8th Sem': '8', '9th Sem': '9', '10th Sem': '10'
    };
    const tierMap = { 'Standard': 'S', 'Premium': 'P', 'VIP': 'V' };

    // Compress URL payload by omitting defaults/placeholders and using a joined control-character separator
    const nameVal = previewName.textContent === DEFAULTS.name ? "" : previewName.textContent;
    const deptVal = (deptValText === 'DEPT' || deptValText === 'Select Department') ? "" : deptValText;
    const batchValText = inputBatch ? inputBatch.value : 'Batch 60';
    const batchVal = batchValText === 'Batch 60' ? "" : batchValText.replace(/Batch\s+/i, '');
    const semVal = (semValText === 'SEMESTER' || semValText === 'Select Semester') ? "" : (semMap[semValText] || semValText);
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

    // Join with ASCII Unit Separator control character (impossible to be input by users)
    const rawString = cardDataArray.join('\u001f');
    return btoa(unescape(encodeURIComponent(rawString))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Canvas-based Confetti celebration animation
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

    const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#eab308', '#22c55e', '#3b82f6'];
    const particles = [];

    // Shoot from bottom corners
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
  const inputBatch = document.getElementById('batch');

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

      // Prevent clicking the search box from propagating and closing dropdown
      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Filter options on text input
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
        wrapper.classList.add('open');
        if (searchInput) {
          searchInput.value = '';
          options.forEach(o => o.style.display = '');
          setTimeout(() => searchInput.focus(), 50);
        }
      }
    });

    // Listen to changes on the hidden select to update the custom UI dynamically
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
      });
    });

    // Trigger initial sync
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
    name: 'Shuvo Chandra Debnath',
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

    // Also update QR Code!
    const qrImage = document.getElementById('preview-qr');
    if (qrImage) {
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(key)}&color=ffffff&bgcolor=12131a`;
    }
  }
  generateCardKey();

  // Live Syncing Input Handlers
  inputName.addEventListener('input', (e) => {
    if (isViewingShared()) return;
    previewName.textContent = e.target.value.trim() || DEFAULTS.name;
  });

  inputEmail.addEventListener('input', (e) => {
    if (isViewingShared()) return;
    previewEmail.textContent = e.target.value.trim() || DEFAULTS.email;
  });

  inputPhone.addEventListener('input', (e) => {
    if (isViewingShared()) return;
    previewPhone.textContent = e.target.value.trim() || DEFAULTS.phone;
  });

  // Sync Membership Tier Radio Input
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
    if (isViewingShared()) return;
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
    if (isViewingShared()) return;
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

  // Helper to compute SHA-1 hash for Cloudinary signed upload
  async function sha1(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // Helper to upload base64 image to Cloudinary using signed or unsigned upload
  async function uploadToCloudinary(base64Data) {
    const env = window.ENV || {};
    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured in env.js');
    }

    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64Data}`);

    if (uploadPreset) {
      // Unsigned Upload (Safe for public GitHub Pages)
      formData.append('upload_preset', uploadPreset);
    } else {
      // Signed Upload (Fallback local development)
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

  // Extract path of a Cloudinary secure URL (including version prefix) to minimize URL footprint while ensuring reliable CDN delivery
  function getCloudinaryPath(url) {
    if (!url) return '';
    const match = url.match(/\/image\/upload\/(.+)$/);
    return match ? match[1] : url;
  }

  // Custom Toast helper
  function showToast(titleText, descText, isError = false) {
    if (successToast && toastMessage) {
      const titleEl = successToast.querySelector('.toast-title');
      if (titleEl) titleEl.textContent = titleText;
      toastMessage.textContent = descText;
      
      const iconEl = successToast.querySelector('i');
      if (iconEl) {
        if (isError) {
          iconEl.setAttribute('data-lucide', 'alert-circle');
          successToast.style.borderColor = 'var(--accent-error)';
        } else {
          iconEl.setAttribute('data-lucide', 'check-circle');
          successToast.style.borderColor = '';
        }
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
      
      successToast.classList.add('show');
      setTimeout(() => {
        successToast.classList.remove('show');
      }, 4000);
    }
  }

  // Helper to compress avatar image (with square crop and optimal sizing)
  let compressedAvatarBase64 = '';
  let cloudinaryAvatarUrl = '';

  function compressAvatar(dataUrl, callback) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 100; // Optimal 1:1 dimension for preview avatar
      
      // Center crop to 1:1 aspect ratio
      const size = Math.min(img.width, img.height);
      const sourceX = (img.width - size) / 2;
      const sourceY = (img.height - size) / 2;

      canvas.width = maxDim;
      canvas.height = maxDim;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw cropped square region to target canvas
      ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, maxDim, maxDim);

      const compressedUrl = canvas.toDataURL('image/jpeg', 0.6);
      const base64Data = compressedUrl.split(',')[1];
      callback(base64Data);
    };
    img.src = dataUrl;
  }

  // Avatar Upload Handler with Cloudinary Cloud Host Integration
  inputAvatar.addEventListener('change', (e) => {
    if (isViewingShared()) return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Render local preview instantly for visual feedback
        previewAvatar.src = event.target.result;
        previewAvatar.style.display = 'block';
        previewAvatarIcon.style.display = 'none';

        dropzoneAvatar.classList.add('has-file');
        labelFile.textContent = 'Compressing image...';

        // Temporarily disable form submission during cloud upload
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.style.opacity = '0.6';
          btnSubmit.innerHTML = `<span>Uploading avatar...</span>`;
        }

        compressAvatar(event.target.result, async (base64) => {
          compressedAvatarBase64 = base64;
          labelFile.textContent = 'Uploading to Cloudinary...';

          try {
            const hostedUrl = await uploadToCloudinary(base64);
            cloudinaryAvatarUrl = hostedUrl;
            
            // Render the hosted version directly on the card to ensure CORS/rendering is verified
            previewAvatar.src = hostedUrl;
            
            labelFile.textContent = file.name;
            showToast('Avatar Hosted', 'Image successfully uploaded to Cloudinary.');
          } catch (error) {
            console.error('Cloudinary upload failed:', error);
            cloudinaryAvatarUrl = '';
            labelFile.textContent = 'Using local preview fallback';
            showToast('Cloudinary Offline', 'Upload failed. Sharing payload will fall back to local compression.', true);
          } finally {
            if (btnSubmit) {
              btnSubmit.disabled = false;
              btnSubmit.style.opacity = '';
              btnSubmit.innerHTML = `<i data-lucide="check-circle-2" class="btn-icon"></i><span>Generate Card & Register</span>`;
              if (typeof lucide !== 'undefined') {
                lucide.createIcons();
              }
            }
          }
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
  let isFlipping = false;

  const handleTiltMove = (e, container) => {
    if (isFlipping) return;

    // Remove transition delay during tracking for instant 3D responsiveness
    libraryCard.style.transition = 'none';

    const cardRect = container.getBoundingClientRect();

    // Mouse coords relative to card
    const x = e.clientX - cardRect.left;
    const y = e.clientY - cardRect.top;

    // Centering calculations (-0.5 to 0.5 range)
    const px = (x / cardRect.width) - 0.5;
    const py = (y / cardRect.height) - 0.5;

    // Rotational angles (maximum 20deg tilt)
    const rotateY = px * 20;
    const rotateX = -py * 20;

    const isFlipped = libraryCard.classList.contains('flipped');
    const baseRotationY = isFlipped ? 180 : 0;

    libraryCard.style.transform = `rotateX(${rotateX}deg) rotateY(${baseRotationY + rotateY}deg)`;

    // Holographic shine translation
    const glowAngle = Math.atan2(y - cardRect.height / 2, x - cardRect.width / 2) * (180 / Math.PI);
    libraryCard.style.setProperty('--hologram-pos', `${x / cardRect.width * 100}% ${y / cardRect.height * 100}%`);

    // Modify shine overlay dynamically
    const shineOverlays = libraryCard.querySelectorAll('.library-card-glow');
    shineOverlays.forEach(overlay => {
      overlay.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`;
    });
  };

  const handleTiltLeave = () => {
    if (isFlipping) return;

    // Restore transition for smooth reset rotation back to center
    libraryCard.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

    // Reset rotations smoothly
    const isFlipped = libraryCard.classList.contains('flipped');
    libraryCard.style.transform = `rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg)`;
    const shineOverlays = libraryCard.querySelectorAll('.library-card-glow');
    shineOverlays.forEach(overlay => {
      overlay.style.background = `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)`;
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


      // Reset custom selects
      if (deptSelect) deptSelect.reset();
      if (semesterSelect) semesterSelect.reset();

      // Clear select trigger error borders if any
      const deptTrigger = document.getElementById('custom-select-trigger-dept');
      if (deptTrigger) deptTrigger.style.borderColor = '';
      const semesterTrigger = document.getElementById('custom-select-trigger-semester');
      if (semesterTrigger) semesterTrigger.style.borderColor = '';

      // Reset preview card texts for selects
      const previewDeptEl = document.getElementById('preview-dept');
      if (previewDeptEl) previewDeptEl.textContent = 'DEPT';
      const previewSemEl = document.getElementById('preview-semester');
      if (previewSemEl) previewSemEl.textContent = 'SEMESTER';

      // Reset batch input
      if (inputBatch) {
        inputBatch.value = 'Batch 60';
      }
      const previewBatchEl = document.getElementById('preview-batch');
      if (previewBatchEl) previewBatchEl.textContent = 'BATCH 60';

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

      const nameVal = inputName.value.trim() || 'Member';
      const tierVal = document.querySelector('input[name="tier"]:checked')?.value || 'Standard';
      const keyVal = previewCardKey.textContent;

      // Update success modal summary fields
      document.getElementById('success-summary-name').textContent = nameVal;
      document.getElementById('success-summary-tier').textContent = tierVal;
      document.getElementById('success-summary-key').textContent = keyVal;

      // Keep a reference to the payload before resetting form
      const payload = getSharePayload();

      // Save member record to the database
      const deptValText = document.getElementById('custom-select-value-dept') ? document.getElementById('custom-select-value-dept').textContent : 'DEPT';
      const semValText = document.getElementById('custom-select-value-semester') ? document.getElementById('custom-select-value-semester').textContent : 'SEMESTER';
      const limitValText = previewLimit.textContent;
      const themeValText = libraryCard.style.getPropertyValue('--user-card-theme') || DEFAULTS.theme;
      const addrText = document.getElementById('preview-address') ? document.getElementById('preview-address').textContent : '';

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
        av: cloudinaryAvatarUrl ? getCloudinaryPath(cloudinaryAvatarUrl) : compressedAvatarBase64
      };

      DB.saveMember(memberRecord);

      // Trigger success modal
      const successModal = document.getElementById('success-modal');
      if (successModal) {
        successModal.classList.add('open');
      }

      // Trigger confetti animation!
      triggerConfetti();

      // View Card click handler inside success modal
      const btnSuccessView = document.getElementById('btn-success-view');
      if (btnSuccessView) {
        btnSuccessView.onclick = () => {
          successModal.classList.remove('open');
          // Update URL hash to view the card in shared viewer mode
          window.location.hash = `share=${payload}`;

          // Reset form fields
          btnReset.click();
        };
      }

      // Close / Dismiss click handler inside success modal
      const btnSuccessClose = document.getElementById('btn-success-close');
      if (btnSuccessClose) {
        btnSuccessClose.onclick = () => {
          successModal.classList.remove('open');
          // Reset form fields
          btnReset.click();
        };
      }
    }, 1600);
  });

  // Validation helper styling functions
  function highlightInputError(input, hasError) {
    let target = input;
    if (input.tagName === 'SELECT') {
      target = input.closest('.custom-select-wrapper') ? input.closest('.custom-select-wrapper').querySelector('.custom-select-trigger') : input;
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
    defaultValue: '',
    placeholderText: 'Select Department',
    hasSearch: true,
    searchPlaceholder: 'Search department...',
    onChange: (val) => {
      if (isViewingShared()) return;
      const el = document.getElementById('preview-dept');
      if (el) el.textContent = val || 'DEPT';
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
      if (el) el.textContent = val ? val.toUpperCase() : 'SEMESTER';
    }
  });

  // Sync Batch normal text input
  if (inputBatch) {
    inputBatch.addEventListener('input', (e) => {
      if (isViewingShared()) return;
      const el = document.getElementById('preview-batch');
      if (el) el.textContent = e.target.value.trim().toUpperCase() || 'BATCH 60';
    });
  }

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
      // Prevent immediate closure when clicking associated labels
      const label = wrapper.parentElement ? wrapper.parentElement.querySelector('label') : null;
      if (label && label.contains(e.target)) {
        return;
      }
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
      }
    });
  });

  // ---- Dynamic Back-card Address / Clearance Notes Sync ----
  if (inputAddress) {
    inputAddress.addEventListener('input', (e) => {
      if (isViewingShared()) return;
      const el = document.getElementById('preview-address');
      if (el) el.textContent = e.target.value.trim() || 'No specific special clearances or address declared.';
    });
  }

  // ---- 3D Card Flipping Event Listeners ----
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

  // ---- Shared helper: temporarily strip 3D transforms so html2canvas can render both sides ----
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

  function triggerBlobDownload(canvas, filename) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      }, 'image/png');
    });
  }

  const renderOpts = {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false
  };

  // ---- PNG Image Export handler ----
  const btnDownloadImg = document.getElementById('btn-download-img');
  if (btnDownloadImg) {
    btnDownloadImg.addEventListener('click', async () => {
      const cardEl = document.getElementById('library-id-card');
      const frontSide = document.querySelector('.card-front');
      const backSide = document.querySelector('.card-back');
      if (!frontSide || !backSide) return;

      btnDownloadImg.style.opacity = '0.5';
      btnDownloadImg.style.pointerEvents = 'none';

      // Save parent card 3D context
      const savedCard = { transformStyle: cardEl.style.transformStyle, transform: cardEl.style.transform };
      cardEl.style.transformStyle = 'flat';
      cardEl.style.transform = 'none';

      try {
        // Render front
        const savedFront = prepareCardForCapture(frontSide);
        const savedBackHide = { display: backSide.style.display };
        backSide.style.display = 'none';
        const canvasFront = await html2canvas(frontSide, renderOpts);
        restoreCardAfterCapture(frontSide, savedFront);
        backSide.style.display = savedBackHide.display;

        // Render back
        const savedBack = prepareCardForCapture(backSide);
        const savedFrontHide = { display: frontSide.style.display };
        frontSide.style.display = 'none';
        const canvasBack = await html2canvas(backSide, renderOpts);
        restoreCardAfterCapture(backSide, savedBack);
        frontSide.style.display = savedFrontHide.display;

        // Restore parent card
        cardEl.style.transformStyle = savedCard.transformStyle;
        cardEl.style.transform = savedCard.transform;

        // Download both images
        await triggerBlobDownload(canvasFront, 'AETHER-LMS-Card-Front.png');
        await new Promise(r => setTimeout(r, 200));
        await triggerBlobDownload(canvasBack, 'AETHER-LMS-Card-Back.png');
      } catch (err) {
        console.error('Image rendering failed:', err);
        // Restore parent card on error
        cardEl.style.transformStyle = savedCard.transformStyle;
        cardEl.style.transform = savedCard.transform;
      }
      btnDownloadImg.style.opacity = '';
      btnDownloadImg.style.pointerEvents = '';
    });
  }

  // ---- PDF Document Export handler ----
  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', async () => {
      const cardEl = document.getElementById('library-id-card');
      const frontSide = document.querySelector('.card-front');
      const backSide = document.querySelector('.card-back');
      if (!frontSide || !backSide) return;

      btnDownloadPdf.style.opacity = '0.5';
      btnDownloadPdf.style.pointerEvents = 'none';

      // Save parent card 3D context
      const savedCard = { transformStyle: cardEl.style.transformStyle, transform: cardEl.style.transform };
      cardEl.style.transformStyle = 'flat';
      cardEl.style.transform = 'none';

      try {
        // Render front
        const savedFront = prepareCardForCapture(frontSide);
        const savedBackHide = { display: backSide.style.display };
        backSide.style.display = 'none';
        const canvasFront = await html2canvas(frontSide, renderOpts);
        restoreCardAfterCapture(frontSide, savedFront);
        backSide.style.display = savedBackHide.display;

        // Render back
        const savedBack = prepareCardForCapture(backSide);
        const savedFrontHide = { display: frontSide.style.display };
        frontSide.style.display = 'none';
        const canvasBack = await html2canvas(backSide, renderOpts);
        restoreCardAfterCapture(backSide, savedBack);
        frontSide.style.display = savedFrontHide.display;

        // Restore parent card
        cardEl.style.transformStyle = savedCard.transformStyle;
        cardEl.style.transform = savedCard.transform;

        // Generate PDF
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

        pdf.save('AETHER-LMS-Card.pdf');
      } catch (err) {
        console.error('PDF generation failed:', err);
        cardEl.style.transformStyle = savedCard.transformStyle;
        cardEl.style.transform = savedCard.transform;
      }
      btnDownloadPdf.style.opacity = '';
      btnDownloadPdf.style.pointerEvents = '';
    });
  }

  // ---- Link Sharing Modal & Social Media Share generator ----
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

  // Fix OG image meta tags to use absolute URL at runtime (needed for GitHub Pages)
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

  // Helper to update all social share URLs with only the direct link
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

      // Build initial social URLs with only the link (no caption)
      updateSocialShareUrls(finalShareUrl);

      // Open Modal
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
      // Copy only the link text (no caption)
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
        // Show Success Toast Notification for copy confirmation
        if (successToast && toastMessage) {
          toastMessage.textContent = "Share link copied! Opening Discord...";
          successToast.classList.add('show');
          setTimeout(() => {
            successToast.classList.remove('show');
          }, 4000);
        }

        // Open Discord channels page in a new window/tab after copying
        setTimeout(() => {
          window.open('https://discord.com/channels/@me', '_blank');
        }, 800);
      }).catch(err => {
        console.error('Failed to copy text for Discord:', err);
        window.open('https://discord.com/channels/@me', '_blank');
      });
    });
  }

  // ---- Hashed URL Parser for Shared Card View / Admin Mode ----
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

    // Reset visibility states
    if (sharedViewerMode) sharedViewerMode.style.display = 'none';
    if (adminPanelMode) adminPanelMode.style.display = 'none';
    if (appWrapper) appWrapper.style.display = '';
    if (mainNavbar) mainNavbar.style.display = '';
    if (beamContainer) beamContainer.style.display = '';
    skelRails.forEach(rail => rail.style.display = '');

    if (hash && hash.startsWith('#share=')) {
      const sharePayload = hash.replace('#share=', '');
      try {
        let decodedData = {};
        // Support URL-safe base64 decoding safely by restoring characters and padding
        let normalizedPayload = sharePayload.replace(/-/g, '+').replace(/_/g, '/');
        while (normalizedPayload.length % 4) {
          normalizedPayload += '=';
        }
        const decodedString = decodeURIComponent(escape(atob(normalizedPayload)));

        if (decodedString.includes('\u001f')) {
          const parsed = decodedString.split('\u001f');
          // Map compressed array format to object format with default fallbacks
          const tierMap = { 'S': 'Standard', 'P': 'Premium', 'V': 'VIP' };
          const semRevMap = {
            '1': '1st Sem', '2': '2nd Sem', '3': '3rd Sem', '4': '4th Sem', '5': '5th Sem',
            '6': '6th Sem', '7': '7th Sem', '8': '8th Sem', '9': '9th Sem', '10': '10th Sem'
          };

          const rawLimit = parsed[6];
          const limitText = rawLimit ? `${rawLimit} BOOK${rawLimit > 1 ? 'S' : ''}` : `${DEFAULTS.limit} BOOKS`;

          decodedData = {
            n: parsed[0] || DEFAULTS.name,
            d: parsed[1] || 'DEPT',
            b: parsed[2] ? `Batch ${parsed[2]}` : 'Batch 60',
            s: parsed[3] ? (semRevMap[parsed[3]] || parsed[3]) : 'SEMESTER',
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
          // Old JSON format (array or object)
          const parsed = JSON.parse(decodedString);
          if (Array.isArray(parsed)) {
            decodedData = {
              n: parsed[0] || DEFAULTS.name,
              d: parsed[1] || 'DEPT',
              b: parsed[2] || 'Batch 60',
              s: parsed[3] || 'SEMESTER',
              e: parsed[4] || DEFAULTS.email,
              p: parsed[5] || DEFAULTS.phone,
              l: parsed[6] || `${DEFAULTS.limit} BOOKS`,
              t: parsed[7] || DEFAULTS.term,
              k: parsed[8],
              th: parsed[9] || DEFAULTS.theme,
              a: parsed[10] || 'No specific special clearances or address declared.',
              tr: parsed[11] || DEFAULTS.tier
            };
          } else {
            decodedData = {
              n: parsed.n || DEFAULTS.name,
              d: parsed.d || 'DEPT',
              b: parsed.b || 'Batch 60',
              s: parsed.s || 'SEMESTER',
              e: parsed.e || DEFAULTS.email,
              p: parsed.p || DEFAULTS.phone,
              l: parsed.l || `${DEFAULTS.limit} BOOKS`,
              t: parsed.t || DEFAULTS.term,
              k: parsed.k,
              th: parsed.th || DEFAULTS.theme,
              a: parsed.a || 'No specific special clearances or address declared.',
              tr: parsed.tr || DEFAULTS.tier
            };
          }
        }

        // Populate front card values
        if (previewName) previewName.textContent = decodedData.n;
        if (document.getElementById('preview-dept')) document.getElementById('preview-dept').textContent = decodedData.d;
        if (document.getElementById('preview-batch')) document.getElementById('preview-batch').textContent = decodedData.b.toUpperCase();
        if (document.getElementById('preview-semester')) document.getElementById('preview-semester').textContent = decodedData.s.toUpperCase();
        if (previewEmail) previewEmail.textContent = decodedData.e;
        if (previewPhone) previewPhone.textContent = decodedData.p;
        if (previewLimit) previewLimit.textContent = decodedData.l;
        if (previewTerm) previewTerm.textContent = decodedData.t;
        if (previewCardKey) previewCardKey.textContent = decodedData.k;

        // Populate avatar
        if (decodedData.av) {
          if (previewAvatar) {
            let avatarSrc = decodedData.av;
            // Decode backward compatible raw base64 or construct secure Cloudinary CDN url
            if (!avatarSrc.startsWith('http://') && !avatarSrc.startsWith('https://') && !avatarSrc.includes('lms_avatars/') && !avatarSrc.includes('lms-avatars/')) {
              avatarSrc = 'data:image/jpeg;base64,' + avatarSrc;
            } else if (!avatarSrc.startsWith('http://') && !avatarSrc.startsWith('https://')) {
              const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
              avatarSrc = `https://res.cloudinary.com/${cloudName}/image/upload/${avatarSrc}`;
            }
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

        // Populate address on back
        const previewAddr = document.getElementById('preview-address');
        if (previewAddr) previewAddr.textContent = decodedData.a || 'No specific special clearances or address declared.';

        // Populate tier badge with icon
        if (previewTier) {
          previewTier.className = 'card-type'; // reset
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

        // Apply theme color
        if (libraryCard) {
          libraryCard.style.setProperty('--user-card-theme', decodedData.th);
        }
        document.documentElement.style.setProperty('--accent-primary', decodedData.th);

        // Update QR code on back
        const qrImage = document.getElementById('preview-qr');
        if (qrImage) {
          qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(decodedData.k)}&color=ffffff&bgcolor=12131a`;
        }

        // Reset card to front side before showing
        if (libraryCard && libraryCard.classList.contains('flipped')) {
          libraryCard.classList.remove('flipped');
          libraryCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
        }

        // Move the card to shared viewer placement
        const viewerCardPlacement = document.getElementById('viewer-card-placement');
        if (viewerCardPlacement && libraryCard) {
          viewerCardPlacement.appendChild(libraryCard);
        }

        // Hide registration form panel, navbar, and background elements - show viewer panel
        if (appWrapper) appWrapper.style.display = 'none';
        if (mainNavbar) mainNavbar.style.display = 'none';
        if (beamContainer) beamContainer.style.display = 'none';
        skelRails.forEach(rail => rail.style.display = 'none');
        if (sharedViewerMode) sharedViewerMode.style.display = 'flex';

        // Reinitialize icons in newly loaded card elements
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
      if (adminPanelMode) {
        adminPanelMode.style.display = 'flex';
      }
      renderAdminDirectory();
    } else {
      // Restore page back to registration form state when hash is cleared
      if (sharedViewerMode) sharedViewerMode.style.display = 'none';
      if (adminPanelMode) adminPanelMode.style.display = 'none';
      if (appWrapper) appWrapper.style.display = '';
      if (mainNavbar) mainNavbar.style.display = '';
      if (beamContainer) beamContainer.style.display = '';
      skelRails.forEach(rail => rail.style.display = '');

      // Move card back to form preview placement if it is currently inside the viewer
      if (formCardPlacement && libraryCard && libraryCard.parentElement !== formCardPlacement) {
        formCardPlacement.appendChild(libraryCard);

        // Reset card to front side
        if (libraryCard.classList.contains('flipped')) {
          libraryCard.classList.remove('flipped');
          libraryCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
        }
      }

      // Re-trigger visual sync from input fields to card preview
      if (inputName) inputName.dispatchEvent(new Event('input'));
      if (inputEmail) inputEmail.dispatchEvent(new Event('input'));
      if (inputPhone) inputPhone.dispatchEvent(new Event('input'));
      if (inputBatch) inputBatch.dispatchEvent(new Event('input'));
      if (inputAddress) inputAddress.dispatchEvent(new Event('input'));
      if (inputBorrowLimit) inputBorrowLimit.dispatchEvent(new Event('input'));
      if (inputMembershipExpiry) inputMembershipExpiry.dispatchEvent(new Event('input'));

      // Sync theme color
      if (inputCardTheme) {
        inputCardTheme.dispatchEvent(new Event('input'));
      }

      // Sync tier
      const activeRadio = document.querySelector('input[name="tier"]:checked');
      if (activeRadio) {
        activeRadio.dispatchEvent(new Event('change'));
      }

      // Sync avatar preview
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

      // Reinitialize icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }

  // Unified Minimal Database Helper (LocalStorage with Cloud Firebase REST API fallback)
  const DB = {
    getFirebaseUrl() {
      return (window.ENV && window.ENV.FIREBASE_URL) ? window.ENV.FIREBASE_URL.replace(/\/$/, '') : null;
    },

    async saveMember(member) {
      const firebaseUrl = this.getFirebaseUrl();
      if (firebaseUrl) {
        try {
          const response = await fetch(`${firebaseUrl}/members/${member.k}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
          });
          if (!response.ok) throw new Error('Firebase save failed');
          return await response.json();
        } catch (err) {
          console.warn('Firebase save failed, falling back to local storage:', err);
        }
      }
      
      // LocalStorage fallback
      const members = this.getLocalMembers();
      members[member.k] = member;
      localStorage.setItem('aether_lms_members', JSON.stringify(members));
    },

    async deleteMember(key) {
      const firebaseUrl = this.getFirebaseUrl();
      if (firebaseUrl) {
        try {
          const response = await fetch(`${firebaseUrl}/members/${key}.json`, {
            method: 'DELETE'
          });
          if (!response.ok) throw new Error('Firebase delete failed');
        } catch (err) {
          console.warn('Firebase delete failed, removing locally:', err);
        }
      }
      
      const members = this.getLocalMembers();
      delete members[key];
      localStorage.setItem('aether_lms_members', JSON.stringify(members));
    },

    async getAllMembers() {
      const firebaseUrl = this.getFirebaseUrl();
      if (firebaseUrl) {
        try {
          const response = await fetch(`${firebaseUrl}/members.json`);
          if (!response.ok) throw new Error('Firebase fetch failed');
          const data = await response.json();
          return data || {};
        } catch (err) {
          console.warn('Firebase fetch failed, reading local storage:', err);
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

  // Serialize member database object back into share payload format
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
      m.av || ""
    ];

    const rawString = cardDataArray.join('\u001f');
    return btoa(unescape(encodeURIComponent(rawString))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Render Admin Dashboard directory cards dynamically
  async function renderAdminDirectory() {
    const grid = document.getElementById('admin-members-grid');
    const searchInput = document.getElementById('admin-search-input');
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem 1rem;"><div style="display:inline-block; width:1.5rem; height:1.5rem; border:2px solid currentColor; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:0.5rem;"></div><p style="margin:0; font-size:0.85rem;">Loading directory...</p></div>';
    
    try {
      const members = await DB.getAllMembers();
      grid.innerHTML = '';
      
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const filtered = Object.values(members).filter(m => {
        return m.n.toLowerCase().includes(query) || 
               m.k.toLowerCase().includes(query) || 
               (m.e && m.e.toLowerCase().includes(query)) ||
               (m.d && m.d.toLowerCase().includes(query));
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
            <i data-lucide="info" style="width: 2rem; height: 2rem; margin-bottom: 0.5rem; color: var(--accent-secondary); display: block; margin-left: auto; margin-right: auto;"></i>
            <p style="margin: 0; font-size: 0.85rem;">No members found in database.</p>
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }

      filtered.forEach(m => {
        const card = document.createElement('div');
        card.className = 'member-directory-card';
        card.style.setProperty('--member-theme', m.th || 'var(--accent-primary)');

        // Construct preview avatar
        let avatarHtml = `<i data-lucide="user" class="card-avatar-placeholder" style="color: var(--text-muted); font-size: 1.1rem;"></i>`;
        if (m.av) {
          let src = m.av;
          if (!src.startsWith('http://') && !src.startsWith('https://') && !src.includes('lms_avatars/') && !src.includes('lms-avatars/')) {
            src = 'data:image/jpeg;base64,' + src;
          } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
            const cloudName = (window.ENV && window.ENV.CLOUDINARY_CLOUD_NAME) || 'dorjgyfdl';
            src = `https://res.cloudinary.com/${cloudName}/image/upload/${src}`;
          }
          avatarHtml = `<img src="${src}" alt="${m.n}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }

        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 42px; height: 42px; border-radius: 50%; overflow: hidden; border: 1.5px solid var(--member-theme); background: rgba(255, 255, 255, 0.03); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${avatarHtml}
            </div>
            <div style="min-width: 0; flex: 1;">
              <h4 style="font-size: 0.85rem; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;">${m.n}</h4>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: var(--member-theme); font-weight: 600;">LMS-${m.k.replace('LMS-', '')}</span>
            </div>
          </div>
          
          <div style="font-size: 0.7rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.2rem; margin-top: 0.1rem;">
            <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><strong>Email:</strong> ${m.e || 'N/A'}</div>
            <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><strong>Dept:</strong> ${m.d || 'N/A'} • ${m.b || 'N/A'}</div>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: auto; border-top: 1px solid rgba(255, 255, 255, 0.04); padding-top: 0.5rem; z-index: 2;">
            <button class="btn btn-primary view-btn" style="flex: 1; padding: 0.35rem 0.5rem; font-size: 0.7rem; justify-content: center; height: 30px;">
              <i data-lucide="eye" style="width: 0.8rem; height: 0.8rem; margin-right: 0.25rem;"></i> View
            </button>
            <button class="btn btn-secondary delete-btn" style="padding: 0.35rem 0.5rem; font-size: 0.7rem; color: var(--accent-error); border-color: rgba(244, 63, 94, 0.15); background: rgba(244, 63, 94, 0.02); justify-content: center; height: 30px; width: 32px; flex-shrink: 0;">
              <i data-lucide="trash-2" style="width: 0.8rem; height: 0.8rem;"></i>
            </button>
          </div>
        `;

        card.querySelector('.view-btn').addEventListener('click', () => {
          const payload = serializeMemberToPayload(m);
          window.location.hash = `share=${payload}`;
        });

        card.querySelector('.delete-btn').addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete ${m.n}'s record?`)) {
            await DB.deleteMember(m.k);
            renderAdminDirectory();
            showToast('Record Deleted', `${m.n} has been deleted from database.`);
          }
        });

        grid.appendChild(card);
      });

      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--accent-error); padding: 2rem 1rem;"><i data-lucide="alert-circle" style="width: 2rem; height: 2rem; margin-bottom: 0.5rem;"></i><p style="margin: 0; font-size: 0.85rem;">Failed to load directory cards.</p></div>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  // Bind Admin navigation controls
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
      window.location.hash = '';
    });
  }

  const adminSearchInput = document.getElementById('admin-search-input');
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', () => {
      renderAdminDirectory();
    });
  }

  // Handle "Create Your Own Card" button — clean URL hash navigation
  const btnViewerCreate = document.getElementById('btn-viewer-create');
  if (btnViewerCreate) {
    btnViewerCreate.addEventListener('click', (e) => {
      e.preventDefault();
      // Remove hash cleanly without adding a history entry
      history.replaceState(null, '', window.location.pathname);
      checkSharedLink();
    });
  }

  // Bind hashchange listener to support dynamic hash navigation without reload
  window.addEventListener('hashchange', checkSharedLink);
  checkSharedLink();
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
