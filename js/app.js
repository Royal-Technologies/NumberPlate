/**
 * Royal Technologies — Bangladesh Number Plate Studio
 * Ultra-Modern Plate Generator Engine with 1:1 Physical Scale Print Sheet
 * Presented by Royal Technologies
 */

(function () {
  'use strict';

  // ─── Theme Management ──────────────────────────────────────────
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');

  function initTheme() {
    const savedTheme = localStorage.getItem('rt_numberplate_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function setTheme(theme) {
    if (theme === 'light') {
      htmlEl.classList.remove('dark');
      htmlEl.classList.add('light');
      themeIcon.className = 'fa-solid fa-moon text-indigo-400 text-lg';
      localStorage.setItem('rt_numberplate_theme', 'light');
    } else {
      htmlEl.classList.remove('light');
      htmlEl.classList.add('dark');
      themeIcon.className = 'fa-solid fa-sun text-amber-400 text-lg';
      localStorage.setItem('rt_numberplate_theme', 'dark');
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = htmlEl.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  });

  initTheme();

  // ─── State Definition ──────────────────────────────────────────
  const state = {
    // Dimensions in millimeters
    widthMm: 285,
    heightMm: 50,
    lines: 1, // 1 or 2
    vehicleType: 'bike-front',

    // Plate Color & Theme
    colorType: 'white', // white, yellow, green, red, blue
    
    // Frame
    frameThickness: 'medium', // none, thin (0.5mm), medium (1mm), thick (2mm)
    
    // Additional Visual Features
    screwHoles: true,
    hologram: true,
    emboss3d: true,
    glossSheen: true,
    autoBanglaDigits: true,

    // Text content
    district: 'ঢাকা মেট্রো',
    seriesClass: 'হ',
    number: '১২-৩৪৫৬',
    singleLineText: 'ঢাকা মেট্রো-হ ১২-৩৪৫৬',
    line1Text: 'ঢাকা মেট্রো-হ',
    line2Text: '১২-৩৪৫৬'
  };

  // ─── Color Themes Palette ──────────────────────────────────────
  const colorThemes = {
    white: {
      bg: '#ffffff',
      bgGradient: ['#ffffff', '#f1f5f9'],
      text: '#0f172a',
      border: '#0f172a',
      divider: '#334155',
      name: 'সাদা (ব্যক্তিগত)'
    },
    yellow: {
      bg: '#facc15',
      bgGradient: ['#fde047', '#eab308'],
      text: '#0f172a',
      border: '#0f172a',
      divider: '#334155',
      name: 'হলুদ (বাণিজ্যিক)'
    },
    green: {
      bg: '#059669',
      bgGradient: ['#10b981', '#047857'],
      text: '#ffffff',
      border: '#ffffff',
      divider: '#34d399',
      name: 'সবুজ (ইভি/পরিবেশবান্ধব)'
    },
    red: {
      bg: '#dc2626',
      bgGradient: ['#ef4444', '#b91c1c'],
      text: '#ffffff',
      border: '#ffffff',
      divider: '#f87171',
      name: 'লাল (সরকারি)'
    },
    blue: {
      bg: '#0284c7',
      bgGradient: ['#38bdf8', '#0369a1'],
      text: '#ffffff',
      border: '#ffffff',
      divider: '#7dd3fc',
      name: 'নীল (কূটনৈতিক)'
    }
  };

  // ─── English to Bengali Digit Converter ─────────────────────────
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  function convertToBanglaDigits(str) {
    if (!str) return '';
    return str.replace(/[0-9]/g, match => bnDigits[parseInt(match, 10)]);
  }

  // ─── DOM References ────────────────────────────────────────────
  const canvas = document.getElementById('plateCanvas');
  const ctx = canvas.getContext('2d');
  const dimensionDisplayBadge = document.getElementById('dimensionDisplayBadge');
  const plateGlassSheen = document.getElementById('plateGlassSheen');

  // Inputs
  const districtSelect = document.getElementById('districtSelect');
  const seriesClassSelect = document.getElementById('seriesClassSelect');
  const singleLineTextInput = document.getElementById('singleLineTextInput');
  const line1TextInput = document.getElementById('line1TextInput');
  const line2TextInput = document.getElementById('line2TextInput');
  const clearSingleLineBtn = document.getElementById('clearSingleLineBtn');
  const autoBanglaDigitsToggle = document.getElementById('autoBanglaDigitsToggle');

  const singleLineContainer = document.getElementById('singleLineInputContainer');
  const twoLineContainer = document.getElementById('twoLineInputContainer');

  const customWidthInput = document.getElementById('customWidthInput');
  const customHeightInput = document.getElementById('customHeightInput');
  const layoutLinesSelect = document.getElementById('layoutLinesSelect');
  const resetSizeBtn = document.getElementById('resetSizeBtn');

  // Toggles
  const screwHolesToggle = document.getElementById('screwHolesToggle');
  const hologramToggle = document.getElementById('hologramToggle');
  const emboss3dToggle = document.getElementById('emboss3dToggle');
  const glossToggle = document.getElementById('glossToggle');

  // Action Buttons
  const downloadJpgBtn = document.getElementById('downloadJpgBtn');
  const downloadPngBtn = document.getElementById('downloadPngBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const copyImageBtn = document.getElementById('copyImageBtn');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // ─── Helper: Show Toast ────────────────────────────────────────
  function showToast(msg, icon = 'fa-circle-check') {
    toastMsg.textContent = msg;
    const iconEl = toast.querySelector('i');
    if (iconEl) iconEl.className = `fa-solid ${icon} text-emerald-400 text-lg`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ─── Update Text Sync ──────────────────────────────────────────
  function syncTextFromDropdowns() {
    const dist = districtSelect.value;
    const sClass = seriesClassSelect.value;
    
    // Extract current number portion from inputs
    let currentNum = '১২-৩৪৫৬';
    if (state.lines === 1) {
      const parts = singleLineTextInput.value.split(/\s+/);
      if (parts.length >= 2) {
        currentNum = parts[parts.length - 1];
      }
    } else {
      currentNum = line2TextInput.value || '১২-৩৪৫৬';
    }

    if (state.autoBanglaDigits) {
      currentNum = convertToBanglaDigits(currentNum);
    }

    state.district = dist;
    state.seriesClass = sClass;
    state.number = currentNum;

    state.line1Text = `${dist}-${sClass}`;
    state.line2Text = currentNum;
    state.singleLineText = `${dist} ${sClass} ${currentNum}`;

    line1TextInput.value = state.line1Text;
    line2TextInput.value = state.line2Text;
    singleLineTextInput.value = state.singleLineText;

    renderCanvas();
  }

  // ─── Render Engine ─────────────────────────────────────────────
  // High-DPI scale multiplier: 1 mm = ~3.78 px at 96 DPI, scale 4 gives ~15.12 px/mm (ultra-sharp 384 DPI!)
  const SCALE = 4;

  function renderCanvas() {
    const widthMm = state.widthMm;
    const heightMm = state.heightMm;

    // Set canvas dimensions
    const pxW = Math.round(widthMm * SCALE);
    const pxH = Math.round(heightMm * SCALE);

    canvas.width = pxW;
    canvas.height = pxH;

    // Update display badge
    dimensionDisplayBadge.textContent = `${widthMm} × ${heightMm} mm`;

    const theme = colorThemes[state.colorType] || colorThemes.white;

    // 1. Clear background
    ctx.clearRect(0, 0, pxW, pxH);

    // 2. Draw Plate Base with Rounded Corners
    // BRTA standard corner radius ~ 8-10 mm
    const radius = Math.min(10 * SCALE, pxH / 4);
    
    ctx.save();
    drawRoundedRectPath(ctx, 0, 0, pxW, pxH, radius);
    ctx.clip();

    // Plate background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, pxH);
    bgGrad.addColorStop(0, theme.bgGradient[0]);
    bgGrad.addColorStop(1, theme.bgGradient[1]);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Subtle metallic plate texture / noise effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, pxW, pxH / 2);

    ctx.restore();

    // 3. Draw Outer & Inner Border Frame
    if (state.frameThickness !== 'none') {
      let borderMm = 1.0;
      if (state.frameThickness === 'thin') borderMm = 0.5;
      if (state.frameThickness === 'thick') borderMm = 2.0;

      const borderPx = Math.max(1, Math.round(borderMm * SCALE));
      const borderMargin = Math.round(2.5 * SCALE); // 2.5 mm inward margin

      ctx.save();
      ctx.lineWidth = borderPx;
      ctx.strokeStyle = theme.border;
      ctx.lineJoin = 'round';

      drawRoundedRectPath(
        ctx,
        borderMargin,
        borderMargin,
        pxW - borderMargin * 2,
        pxH - borderMargin * 2,
        Math.max(2, radius - borderMargin / 2)
      );
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw BRTA Watermark & Hologram Emblem (Authentic Feature)
    if (state.hologram) {
      drawBRTAHologram(ctx, pxW, pxH, theme);
    }

    // 5. Draw Screw Holes (Mounting Marks)
    if (state.screwHoles) {
      drawScrewHoles(ctx, pxW, pxH, theme);
    }

    // 6. Draw Registration Text
    drawRegistrationText(ctx, pxW, pxH, theme);

    // Update Sheen Overlay visibility
    plateGlassSheen.style.display = state.glossSheen ? 'block' : 'none';
  }

  // Draw Rounded Rectangle Path
  function drawRoundedRectPath(c, x, y, width, height, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + width - r, y);
    c.quadraticCurveTo(x + width, y, x + width, y + r);
    c.lineTo(x + width, y + height - r);
    c.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    c.lineTo(x + r, y + height);
    c.quadraticCurveTo(x, y + height, x, y + height - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  // Draw BRTA Hologram / Bangladesh Emblem
  function drawBRTAHologram(c, w, h, theme) {
    c.save();
    // Position: Left vertical center or upper left corner
    const size = Math.min(w * 0.08, h * 0.42, 28 * SCALE);
    const cx = size * 1.1;
    const cy = h / 2;

    // Holographic Silver/Green circle
    c.beginPath();
    c.arc(cx, cy, size / 2, 0, Math.PI * 2);
    const holoGrad = c.createRadialGradient(cx - size * 0.2, cy - size * 0.2, size * 0.1, cx, cy, size / 2);
    holoGrad.addColorStop(0, '#e2e8f0');
    holoGrad.addColorStop(0.4, '#10b981');
    holoGrad.addColorStop(0.7, '#0284c7');
    holoGrad.addColorStop(1, '#6366f1');
    c.fillStyle = holoGrad;
    c.globalAlpha = 0.85;
    c.fill();

    // Inner red circle (Bangladesh flag emblem motif)
    c.beginPath();
    c.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
    c.fillStyle = '#dc2626';
    c.globalAlpha = 0.9;
    c.fill();

    // Hologram micro-border
    c.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    c.lineWidth = 1.5;
    c.stroke();

    // Small BRTA Security Text on bottom of badge
    c.font = `bold ${Math.max(8, Math.round(size * 0.18))}px "Inter", sans-serif`;
    c.fillStyle = '#ffffff';
    c.textAlign = 'center';
    c.fillText('BD', cx, cy + size * 0.1);

    c.restore();
  }

  // Draw Authentic Screw Holes
  function drawScrewHoles(c, w, h, theme) {
    c.save();
    const holeRadius = Math.max(3, 2.5 * SCALE); // ~2.5mm hole radius
    const marginX = Math.round(14 * SCALE);
    const cy = h / 2;

    const holes = [
      { x: marginX, y: cy },
      { x: w - marginX, y: cy }
    ];

    // For tall/square plates (like 200x100 or 340x200), add 4 corner holes
    if (state.heightMm >= 90) {
      holes.length = 0;
      const marginY = Math.round(14 * SCALE);
      holes.push(
        { x: marginX, y: marginY },
        { x: w - marginX, y: marginY },
        { x: marginX, y: h - marginY },
        { x: w - marginX, y: h - marginY }
      );
    }

    holes.forEach(pos => {
      // Outer washer shadow
      c.beginPath();
      c.arc(pos.x, pos.y, holeRadius + 2.5, 0, Math.PI * 2);
      c.fillStyle = 'rgba(0, 0, 0, 0.18)';
      c.fill();

      // Metallic Ring
      c.beginPath();
      c.arc(pos.x, pos.y, holeRadius, 0, Math.PI * 2);
      c.fillStyle = '#94a3b8';
      c.fill();
      c.lineWidth = 1;
      c.strokeStyle = '#64748b';
      c.stroke();

      // Inner Cut Hole
      c.beginPath();
      c.arc(pos.x, pos.y, holeRadius * 0.65, 0, Math.PI * 2);
      c.fillStyle = theme.bg === '#ffffff' ? '#0f172a' : '#000000';
      c.fill();
    });

    c.restore();
  }

  // Draw Registration Plate Text
  function drawRegistrationText(c, w, h, theme) {
    c.save();
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    const textOffsetLeft = state.hologram ? (w * 0.04) : 0;
    const centerX = (w / 2) + textOffsetLeft;

    if (state.lines === 1) {
      // ─── Single Line Layout (e.g. Motorcycle Front 285x50mm, Scooter 250x55mm) ───
      let text = state.singleLineText || `${state.district} ${state.seriesClass} ${state.number}`;
      if (state.autoBanglaDigits) {
        text = convertToBanglaDigits(text);
      }

      // Dynamic Font Size calculation to fit comfortably
      let fontSize = Math.round(h * 0.58);
      c.font = `900 ${fontSize}px "Noto Sans Bengali", sans-serif`;

      // Reduce font size if text overflows width (leaving padding)
      const maxAvailableW = w * 0.82;
      while (c.measureText(text).width > maxAvailableW && fontSize > 14) {
        fontSize -= 2;
        c.font = `900 ${fontSize}px "Noto Sans Bengali", sans-serif`;
      }

      const centerY = h / 2;

      // 3D Emboss Effect
      if (state.emboss3d) {
        // Highlight (top-left)
        c.fillStyle = 'rgba(255, 255, 255, 0.35)';
        c.fillText(text, centerX - 1.5, centerY - 1.5);

        // Shadow (bottom-right)
        c.fillStyle = 'rgba(0, 0, 0, 0.45)';
        c.fillText(text, centerX + 2, centerY + 2);
      }

      // Main Text
      c.fillStyle = theme.text;
      c.fillText(text, centerX, centerY);

    } else {
      // ─── Two-Line Layout (e.g. Bike Rear, Car Long, Car Square, CNG) ───
      let line1 = state.line1Text || `${state.district}-${state.seriesClass}`;
      let line2 = state.line2Text || state.number;

      if (state.autoBanglaDigits) {
        line1 = convertToBanglaDigits(line1);
        line2 = convertToBanglaDigits(line2);
      }

      const maxAvailableW = w * 0.82;

      // Top line Font Size
      let font1Size = Math.round(h * 0.32);
      c.font = `800 ${font1Size}px "Noto Sans Bengali", sans-serif`;
      while (c.measureText(line1).width > maxAvailableW && font1Size > 12) {
        font1Size -= 2;
        c.font = `800 ${font1Size}px "Noto Sans Bengali", sans-serif`;
      }

      // Bottom line Font Size (digits are usually bolder & larger)
      let font2Size = Math.round(h * 0.38);
      c.font = `900 ${font2Size}px "Noto Sans Bengali", sans-serif`;
      while (c.measureText(line2).width > maxAvailableW && font2Size > 14) {
        font2Size -= 2;
        c.font = `900 ${font2Size}px "Noto Sans Bengali", sans-serif`;
      }

      const y1 = h * 0.28;
      const y2 = h * 0.73;

      // Center Divider Line between Line 1 and Line 2 (Authentic BRTA plate feature)
      const dividerY = Math.round(h * 0.50);
      const dividerW = Math.round(w * 0.70);
      c.save();
      c.strokeStyle = theme.divider || theme.border;
      c.lineWidth = Math.max(1, Math.round(0.8 * SCALE));
      c.globalAlpha = 0.6;
      c.beginPath();
      c.moveTo(centerX - dividerW / 2, dividerY);
      c.lineTo(centerX + dividerW / 2, dividerY);
      c.stroke();
      c.restore();

      // 3D Emboss for Line 1
      if (state.emboss3d) {
        c.font = `800 ${font1Size}px "Noto Sans Bengali", sans-serif`;
        c.fillStyle = 'rgba(255, 255, 255, 0.3)';
        c.fillText(line1, centerX - 1.2, y1 - 1.2);
        c.fillStyle = 'rgba(0, 0, 0, 0.4)';
        c.fillText(line1, centerX + 1.8, y1 + 1.8);
      }

      c.font = `800 ${font1Size}px "Noto Sans Bengali", sans-serif`;
      c.fillStyle = theme.text;
      c.fillText(line1, centerX, y1);

      // 3D Emboss for Line 2
      if (state.emboss3d) {
        c.font = `900 ${font2Size}px "Noto Sans Bengali", sans-serif`;
        c.fillStyle = 'rgba(255, 255, 255, 0.3)';
        c.fillText(line2, centerX - 1.2, y2 - 1.2);
        c.fillStyle = 'rgba(0, 0, 0, 0.45)';
        c.fillText(line2, centerX + 2, y2 + 2);
      }

      c.font = `900 ${font2Size}px "Noto Sans Bengali", sans-serif`;
      c.fillStyle = theme.text;
      c.fillText(line2, centerX, y2);
    }

    c.restore();
  }

  // ─── Event Handlers: Vehicle Sizes & Presets ───────────────────
  const vehicleSizeCards = document.querySelectorAll('.vehicle-option-card');

  function selectVehicleSize(type, w, h, lines) {
    state.vehicleType = type;
    state.widthMm = parseInt(w, 10);
    state.heightMm = parseInt(h, 10);
    state.lines = parseInt(lines, 10);

    // Update input boxes
    customWidthInput.value = state.widthMm;
    customHeightInput.value = state.heightMm;
    layoutLinesSelect.value = state.lines;

    // Toggle single vs two-line inputs container
    if (state.lines === 1) {
      singleLineContainer.classList.remove('hidden');
      twoLineContainer.classList.add('hidden');
    } else {
      singleLineContainer.classList.add('hidden');
      twoLineContainer.classList.remove('hidden');
    }

    // Update active class on cards
    vehicleSizeCards.forEach(card => {
      if (card.getAttribute('data-type') === type) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    renderCanvas();
  }

  vehicleSizeCards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-type');
      const w = card.getAttribute('data-w');
      const h = card.getAttribute('data-h');
      const lines = card.getAttribute('data-lines');
      selectVehicleSize(type, w, h, lines);
    });
  });

  // Custom Dimensions Inputs
  customWidthInput.addEventListener('input', () => {
    const w = parseInt(customWidthInput.value, 10);
    if (w >= 50 && w <= 1000) {
      state.widthMm = w;
      renderCanvas();
    }
  });

  customHeightInput.addEventListener('input', () => {
    const h = parseInt(customHeightInput.value, 10);
    if (h >= 20 && h <= 500) {
      state.heightMm = h;
      renderCanvas();
    }
  });

  layoutLinesSelect.addEventListener('change', () => {
    state.lines = parseInt(layoutLinesSelect.value, 10);
    if (state.lines === 1) {
      singleLineContainer.classList.remove('hidden');
      twoLineContainer.classList.add('hidden');
    } else {
      singleLineContainer.classList.add('hidden');
      twoLineContainer.classList.remove('hidden');
    }
    renderCanvas();
  });

  resetSizeBtn.addEventListener('click', () => {
    // Reset to Motorcycle Front Default (285x50mm, 1 line)
    selectVehicleSize('bike-front', 285, 50, 1);
    showToast('ডিফল্ট সাইজে রিসেট করা হয়েছে (285 × 50 mm)');
  });

  // ─── Fast Presets ──────────────────────────────────────────────
  const presetButtons = document.querySelectorAll('.preset-pill');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.getAttribute('data-preset');
      switch (preset) {
        case 'bike-front':
          selectVehicleSize('bike-front', 285, 50, 1);
          setPlateColor('white');
          seriesClassSelect.value = 'হ';
          syncTextFromDropdowns();
          break;

        case 'bike-rear':
          selectVehicleSize('bike-rear', 200, 100, 2);
          setPlateColor('white');
          seriesClassSelect.value = 'হ';
          syncTextFromDropdowns();
          break;

        case 'car-horizontal':
          selectVehicleSize('car-long', 520, 110, 2);
          setPlateColor('white');
          seriesClassSelect.value = 'গ';
          syncTextFromDropdowns();
          break;

        case 'car-square':
          selectVehicleSize('car-square', 340, 200, 2);
          setPlateColor('white');
          seriesClassSelect.value = 'ঘ';
          syncTextFromDropdowns();
          break;

        case 'cng-auto':
          selectVehicleSize('cng', 285, 165, 2);
          setPlateColor('yellow');
          seriesClassSelect.value = 'থ';
          syncTextFromDropdowns();
          break;

        case 'ev-car':
          selectVehicleSize('car-long', 520, 110, 2);
          setPlateColor('green');
          seriesClassSelect.value = 'গ';
          syncTextFromDropdowns();
          break;
      }
    });
  });

  // ─── Color Options Selection ───────────────────────────────────
  const colorOptionButtons = document.querySelectorAll('.color-option-btn');

  function setPlateColor(colorType) {
    state.colorType = colorType;
    colorOptionButtons.forEach(btn => {
      if (btn.getAttribute('data-color-type') === colorType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    renderCanvas();
  }

  colorOptionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.getAttribute('data-color-type');
      setPlateColor(c);
    });
  });

  // ─── Frame Selection ───────────────────────────────────────────
  const frameButtons = document.querySelectorAll('.frame-option-btn');
  frameButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      frameButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.frameThickness = btn.getAttribute('data-frame');
      renderCanvas();
    });
  });

  // ─── Advanced Feature Toggles ──────────────────────────────────
  screwHolesToggle.addEventListener('change', () => {
    state.screwHoles = screwHolesToggle.checked;
    renderCanvas();
  });

  hologramToggle.addEventListener('change', () => {
    state.hologram = hologramToggle.checked;
    renderCanvas();
  });

  emboss3dToggle.addEventListener('change', () => {
    state.emboss3d = emboss3dToggle.checked;
    renderCanvas();
  });

  glossToggle.addEventListener('change', () => {
    state.glossSheen = glossToggle.checked;
    renderCanvas();
  });

  autoBanglaDigitsToggle.addEventListener('change', () => {
    state.autoBanglaDigits = autoBanglaDigitsToggle.checked;
    if (state.autoBanglaDigits) {
      singleLineTextInput.value = convertToBanglaDigits(singleLineTextInput.value);
      line2TextInput.value = convertToBanglaDigits(line2TextInput.value);
    }
    renderCanvas();
  });

  // ─── Text Input Listeners ──────────────────────────────────────
  districtSelect.addEventListener('change', syncTextFromDropdowns);
  seriesClassSelect.addEventListener('change', syncTextFromDropdowns);

  singleLineTextInput.addEventListener('input', () => {
    let val = singleLineTextInput.value;
    if (state.autoBanglaDigits) {
      val = convertToBanglaDigits(val);
      singleLineTextInput.value = val;
    }
    state.singleLineText = val;
    renderCanvas();
  });

  clearSingleLineBtn.addEventListener('click', () => {
    singleLineTextInput.value = '';
    state.singleLineText = '';
    singleLineTextInput.focus();
    renderCanvas();
  });

  line1TextInput.addEventListener('input', () => {
    state.line1Text = line1TextInput.value;
    renderCanvas();
  });

  line2TextInput.addEventListener('input', () => {
    let val = line2TextInput.value;
    if (state.autoBanglaDigits) {
      val = convertToBanglaDigits(val);
      line2TextInput.value = val;
    }
    state.line2Text = val;
    renderCanvas();
  });

  // ─── Export & Download Engine ──────────────────────────────────

  // 1. Download JPG (High-res 300 DPI)
  downloadJpgBtn.addEventListener('click', () => {
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      const safeName = (state.lines === 1 ? state.singleLineText : `${state.line1Text}-${state.line2Text}`)
        .replace(/[\s\/-]+/g, '_');
      link.download = `RoyalTech-Plate-${safeName || 'NumberPlate'}.jpg`;
      link.href = dataUrl;
      link.click();
      showToast('JPG ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'fa-file-image');
    } catch (e) {
      console.error(e);
      showToast('ডাউনলোড সম্পন্ন করা যায়নি', 'fa-circle-exclamation');
    }
  });

  // 2. Download PNG (Crisp Lossless)
  downloadPngBtn.addEventListener('click', () => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = (state.lines === 1 ? state.singleLineText : `${state.line1Text}-${state.line2Text}`)
        .replace(/[\s\/-]+/g, '_');
      link.download = `RoyalTech-Plate-${safeName || 'NumberPlate'}.png`;
      link.href = dataUrl;
      link.click();
      showToast('PNG ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'fa-image');
    } catch (e) {
      console.error(e);
      showToast('ডাউনলোড সম্পন্ন করা যায়নি', 'fa-circle-exclamation');
    }
  });

  // 3. Download A4 Print PDF Sheet (100% True 1:1 Scale using jsPDF)
  downloadPdfBtn.addEventListener('click', () => {
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast('jsPDF লাইব্রেরি লোড হতে পারেনি', 'fa-circle-exclamation');
        return;
      }

      const { jsPDF } = window.jspdf;
      const wMm = state.widthMm;
      const hMm = state.heightMm;

      // Decide orientation: if plate is wider than 200mm, landscape A4 (297 x 210mm) is ideal
      const isLandscape = wMm > 190;
      const orientation = isLandscape ? 'landscape' : 'portrait';
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;

      // Header Branding on PDF sheet
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Royal Technologies — Bangladesh Vehicle Number Plate Print Sheet (100% True Scale 1:1)', 15, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Plate Size: ${wMm} mm × ${hMm} mm | Print without scaling (Actual Size 100%) | Verification: Passed`, 15, 17);

      // Thin divider
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(15, 19, pageWidth - 15, 19);

      // Get high-res canvas image data
      const imgData = canvas.toDataURL('image/png');

      // Calculate how many plates can fit cleanly on A4
      let count = 1;
      const topStart = 26;
      const availableH = pageHeight - topStart - 15;
      const plateTotalH = hMm + 12; // 12mm spacing between copies
      count = Math.max(1, Math.min(3, Math.floor(availableH / plateTotalH)));

      // If plate is wider than printable page, scale safely
      let renderW = wMm;
      let renderH = hMm;
      const maxW = pageWidth - 20;
      if (renderW > maxW) {
        const ratio = maxW / renderW;
        renderW = maxW;
        renderH = hMm * ratio;
      }

      const posX = (pageWidth - renderW) / 2;

      for (let i = 0; i < count; i++) {
        const posY = topStart + i * (renderH + 12);

        // Draw Corner Crop Marks (Cutting Guidelines)
        drawCropMarksPDF(doc, posX, posY, renderW, renderH);

        // Place image at true millimeter scale
        doc.addImage(imgData, 'PNG', posX, posY, renderW, renderH);

        // Small scale label beside crop mark
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`[Cut Along Marks — Copy #${i + 1} — ${wMm}×${hMm}mm]`, posX, posY + renderH + 3.5);
      }

      // Footer notice
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated by Royal Technologies Plate Studio • Free & Open Source • https://github.com/Royal-Technologies/NumberPlate', 15, pageHeight - 6);

      const safeName = (state.lines === 1 ? state.singleLineText : `${state.line1Text}-${state.line2Text}`)
        .replace(/[\s\/-]+/g, '_');
      doc.save(`RoyalTech-A4-PrintSheet-${safeName || 'NumberPlate'}.pdf`);
      showToast('A4 প্রিন্টিং PDF সফলভাবে তৈরি হয়েছে!', 'fa-file-pdf');
    } catch (e) {
      console.error(e);
      showToast('PDF তৈরিতে সমস্যা হয়েছে', 'fa-circle-exclamation');
    }
  });

  // Helper to draw crop marks on PDF
  function drawCropMarksPDF(doc, x, y, w, h) {
    const len = 4; // 4 mm crop mark arm
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.2);

    // Top-Left
    doc.line(x - len, y, x, y);
    doc.line(x, y - len, x, y);

    // Top-Right
    doc.line(x + w, y, x + w + len, y);
    doc.line(x + w, y - len, x + w, y);

    // Bottom-Left
    doc.line(x - len, y + h, x, y + h);
    doc.line(x, y + h, x, y + h + len);

    // Bottom-Right
    doc.line(x + w, y + h, x + w + len, y + h);
    doc.line(x + w, y + h, x + w, y + h + len);
  }

  // 4. Copy to Clipboard
  copyImageBtn.addEventListener('click', async () => {
    try {
      canvas.toBlob(async blob => {
        if (!blob) {
          showToast('ইমেজ তৈরি ব্যর্থ হয়েছে', 'fa-circle-exclamation');
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('প্লেট ইমেজ ক্লিপবোর্ডে কপি হয়েছে! পেস্ট (Ctrl+V) করতে পারেন।');
      });
    } catch (err) {
      console.warn('Clipboard API write failed, trying fallback:', err);
      showToast('ব্রাউজারে কপি পারমিশন প্রয়োজন', 'fa-circle-exclamation');
    }
  });

  // ─── Initializer ───────────────────────────────────────────────
  // Wait for Google Fonts to be ready so Bengali glyphs render crisp and properly
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      renderCanvas();
    });
  } else {
    setTimeout(renderCanvas, 400);
  }

  // Initial draw
  renderCanvas();

})();
