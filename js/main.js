document.addEventListener('DOMContentLoaded', function () {
      // Tab Switching
      const tabButtons = document.querySelectorAll('.tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all buttons and contents
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          // Add active class to clicked button and corresponding content
          button.classList.add('active');
          const tabId = button.getAttribute('data-tab');
          document.getElementById(tabId).classList.add('active');
        });
      });

      // Username Generator
      const platformBtns = {
        tiktok: document.getElementById('tiktokBtn'),
        instagram: document.getElementById('instaBtn'),
        twitter: document.getElementById('twitterBtn'),
        youtube: document.getElementById('youtubeBtn'),
        discord: document.getElementById('discordBtn')
      };

      const styleBtns = {
        normal: document.getElementById('normalBtn'),
        epic: document.getElementById('epicBtn'),
        legendary: document.getElementById('legendaryBtn')
      };

      const generateBtn = document.getElementById('generateBtn');
      const lengthSelect = document.getElementById('lengthSelect');
      const countSelect = document.getElementById('countSelect');
      const resultsDiv = document.getElementById('results');
      const copiedMessage = document.getElementById('copiedMessage');
      const loadingDiv = document.getElementById('loading');
      const statsDiv = document.getElementById('stats');

      // State
      let currentPlatform = 'tiktok';
      let currentStyle = 'normal';

      // Platform selection
      function setActivePlatform(platform) {
        currentPlatform = platform;
        Object.values(platformBtns).forEach(btn => btn.classList.remove('active'));
        platformBtns[platform].classList.add('active');
      }

      Object.entries(platformBtns).forEach(([platform, btn]) => {
        btn.addEventListener('click', () => setActivePlatform(platform));
      });

      // Style selection
      function setActiveStyle(style) {
        currentStyle = style;
        Object.values(styleBtns).forEach(btn => btn.classList.remove('active'));
        styleBtns[style].classList.add('active');
      }

      Object.entries(styleBtns).forEach(([style, btn]) => {
        btn.addEventListener('click', () => setActiveStyle(style));
      });

      // Generate usernames
      generateBtn.addEventListener('click', generateUsernames);

      async function generateUsernames() {
        loadingDiv.style.display = 'block';
        resultsDiv.innerHTML = '';
        statsDiv.textContent = '';

        setTimeout(async () => {
          try {
            const usernames = await generateUsernameSet();
            displayResults(usernames, resultsDiv, statsDiv,
              `Generated ${usernames.length} unique ${currentStyle} ${lengthSelect.value}-character usernames for ${currentPlatform}`);
          } catch (error) {
            console.error("Error generating usernames:", error);
            statsDiv.textContent = "Error generating usernames. Please try again.";
          } finally {
            loadingDiv.style.display = 'none';
          }
        }, 50);
      }

      function generateUsernameSet() {
        return new Promise((resolve) => {
          const length = parseInt(lengthSelect.value);
          const count = parseInt(countSelect.value);
          const letters = 'abcdefghijklmnopqrstuvwxyz';
          const numbers = '0123456789';
          const specialChars = '_.';
          const vowels = 'aeiou';
          const consonants = 'bcdfghjklmnpqrstvwxyz';

          let usernames = new Set();
          let attempts = 0;
          const maxAttempts = count * 5;

          while (usernames.size < count && attempts < maxAttempts) {
            attempts++;
            let username = generateUsernameByStyle(length, letters, numbers, specialChars, vowels, consonants);

            // Apply platform-specific constraints
            username = applyPlatformConstraints(username);

            if (username.length === length) {
              usernames.add(username);
            }
          }

          resolve(Array.from(usernames));
        });
      }

      function generateUsernameByStyle(length, letters, numbers, specialChars, vowels, consonants) {
        switch (currentStyle) {
          case 'normal':
            return generateNormalUsername(length, letters, numbers, specialChars);
          case 'epic':
            return generateEpicUsername(length, letters, numbers, specialChars, vowels, consonants);
          case 'legendary':
            return generateLegendaryUsername(length, letters, numbers, specialChars, vowels, consonants);
          case 'hard':
            return generateHardUsername(length, letters, numbers, specialChars);
          default:
            return generateNormalUsername(length, letters, numbers, specialChars);
        }
      }

      function applyPlatformConstraints(username) {
        const platformLimits = {
          tiktok: 24,
          discord: 24,
          instagram: 30,
          twitter: 15,
          youtube: 30
        };

        const limit = platformLimits[currentPlatform] || 30;
        return username.length > limit ? username.substring(0, limit) : username;
      }

      function generateNormalUsername(length, letters, numbers, specialChars) {
        let username = '';
        const pattern = getRandomPattern(length);

        for (let i = 0; i < pattern.length; i++) {
          switch (pattern[i]) {
            case 'L': // Letter
              username += letters.charAt(Math.floor(Math.random() * letters.length));
              break;
            case 'N': // Number
              username += numbers.charAt(Math.floor(Math.random() * numbers.length));
              break;
            case 'S': // Special
              username += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
              break;
          }
        }

        return username;
      }

      function generateEpicUsername(length, letters, numbers, specialChars, vowels, consonants) {
        let username = '';
        const pattern = getRandomPattern(length);

        for (let i = 0; i < pattern.length; i++) {
          switch (pattern[i]) {
            case 'L': // Letter
              if (i === 0 || i === length - 1) {
                // First or last character more likely to be consonant
                username += consonants.charAt(Math.floor(Math.random() * consonants.length));
              } else {
                // Middle characters more likely to be vowels
                username += Math.random() > 0.3 ?
                  vowels.charAt(Math.floor(Math.random() * vowels.length)) :
                  consonants.charAt(Math.floor(Math.random() * consonants.length));
              }
              break;
            case 'N': // Number
              // Prefer numbers that look good (avoid 0 at start)
              if (i === 0) {
                username += numbers.charAt(Math.floor(Math.random() * (numbers.length - 1)) + 1);
              } else {
                username += numbers.charAt(Math.floor(Math.random() * numbers.length));
              }
              break;
            case 'S': // Special
              username += '_'; // Epic usernames prefer underscore
              break;
          }
        }

        // 50% chance to capitalize first letter for epicness
        if (Math.random() > 0.5 && pattern[0] === 'L') {
          username = username.charAt(0).toUpperCase() + username.slice(1);
        }

        return username;
      }

      function generateLegendaryUsername(length, letters, numbers, specialChars, vowels, consonants) {
        let username = '';
        const pattern = getRandomPattern(length);

        // Legendary names have more structure
        for (let i = 0; i < pattern.length; i++) {
          switch (pattern[i]) {
            case 'L': // Letter
              // Alternate consonants and vowels more deliberately
              if (i === 0) {
                // Start with consonant
                username += consonants.charAt(Math.floor(Math.random() * consonants.length));
              } else if (pattern[i - 1] === 'L') {
                // Follow letter with vowel
                username += vowels.charAt(Math.floor(Math.random() * vowels.length));
              } else {
                // Otherwise consonant
                username += consonants.charAt(Math.floor(Math.random() * consonants.length));
              }
              break;
            case 'N': // Number
              // Legendary numbers are often repeating or patterns
              if (i > 0 && pattern[i - 1] === 'N') {
                // Repeat or increment previous number
                const prevNum = parseInt(username.charAt(username.length - 1));
                username += Math.random() > 0.5 ? prevNum : (prevNum + 1) % 10;
              } else {
                // Avoid 0 at start
                username += i === 0 ?
                  numbers.charAt(Math.floor(Math.random() * (numbers.length - 1)) + 1) :
                  numbers.charAt(Math.floor(Math.random() * numbers.length));
              }
              break;
            case 'S': // Special
              username += Math.random() > 0.8 ? '.' : '_'; // Mostly underscores
              break;
          }
        }

        // Capitalize first letter
        if (pattern[0] === 'L') {
          username = username.charAt(0).toUpperCase() + username.slice(1);
        }

        // 30% chance to add x at end if space allows
        if (username.length < length && Math.random() > 0.7) {
          username += 'x'.repeat(length - username.length);
        }

        return username.substring(0, length);
      }

      function getRandomPattern(length) {
        // Define possible patterns for each length
        const patterns = {
          2: ['LN', 'NL', 'LL'],
          3: ['LNL', 'LLN', 'LNN', 'NLL', 'NLN', 'LLL', 'LSN', 'NSL'],
          4: ['LLNN', 'LNLN', 'LLLN', 'LSNL', 'LLSL', 'NLNL', 'LLNN', 'LSSL'],
          5: ['LLLNN', 'LNLNL', 'LLSNL', 'LNSNL', 'LLSSL', 'LLLSL', 'NLLNL', 'LLLNN'],
          6: ['LLLNNN', 'LLSNLL', 'LNLNLN', 'LLSSNL', 'LLLSNN', 'LLLSSL', 'LLNSNL', 'LLLNNN'],
          7: ['LLLSNLL', 'LLLNNLL', 'LLLNLNL', 'LLLSSNL', 'LLLSNNL', 'LLNLLSN'],
          8: ['LLLSNLLN', 'LLLNNLLN', 'LLLNLNLN', 'LLLSSNLL', 'LLLSNNLL', 'LLNLLSNL']
        };

        // Get random pattern for the requested length
        const possiblePatterns = patterns[length] || ['L'.repeat(length)];
        return possiblePatterns[Math.floor(Math.random() * possiblePatterns.length)];
      }

      // Password Generator
      const passStyleBtns = {
        normal: document.getElementById('passNormalBtn'),
        epic: document.getElementById('passEpicBtn'),
        legendary: document.getElementById('passLegendaryBtn')
      };

      const generatePassBtn = document.getElementById('generatePassBtn');
      const passCountSelect = document.getElementById('passCountSelect');
      const passResultsDiv = document.getElementById('passResults');
      const passCopiedMessage = document.getElementById('passCopiedMessage');
      const passLoadingDiv = document.getElementById('passLoading');
      const passStatsDiv = document.getElementById('passStats');

      let currentPassStyle = 'normal';

      // Password style selection
      function setActivePassStyle(style) {
        currentPassStyle = style;
        Object.values(passStyleBtns).forEach(btn => btn.classList.remove('active'));
        passStyleBtns[style].classList.add('active');
      }

      Object.entries(passStyleBtns).forEach(([style, btn]) => {
        btn.addEventListener('click', () => setActivePassStyle(style));
      });

      // Generate passwords
      generatePassBtn.addEventListener('click', generatePasswords);

      async function generatePasswords() {
        passLoadingDiv.style.display = 'block';
        passResultsDiv.innerHTML = '';
        passStatsDiv.textContent = '';

        setTimeout(async () => {
          try {
            const passwords = await generatePasswordSet();
            displayResults(passwords, passResultsDiv, passStatsDiv,
              `Generated ${passwords.length} ${currentPassStyle} strength passwords`);
          } catch (error) {
            console.error("Error generating passwords:", error);
            passStatsDiv.textContent = "Error generating passwords. Please try again.";
          } finally {
            passLoadingDiv.style.display = 'none';
          }
        }, 50);
      }

      function generatePasswordSet() {
        return new Promise((resolve) => {
          const count = parseInt(passCountSelect.value);
          const passwords = [];

          for (let i = 0; i < count; i++) {
            passwords.push(generatePasswordByStyle());
          }

          resolve(passwords);
        });
      }

      function generatePasswordByStyle() {
        if (currentPassStyle === 'hard') {
          return generateHardPassword();
        }
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let length, charSets;

        switch (currentPassStyle) {
          case 'normal':
            length = 14;
            charSets = [
              lowercase,
              uppercase,
              numbers,
              specialChars
            ];
            break;
          case 'epic':
            length = 18;
            charSets = [
              lowercase,
              uppercase,
              numbers,
              specialChars,
              lowercase + uppercase + numbers + specialChars
            ];
            break;
          case 'legendary':
            length = 30;
            charSets = [
              lowercase,
              uppercase,
              numbers,
              specialChars,
              lowercase + uppercase + numbers + specialChars,
              lowercase + uppercase + numbers + specialChars
            ];
            break;
          default:
            length = 14;
            charSets = [
              lowercase,
              uppercase,
              numbers,
              specialChars
            ];
        }

        let password = '';

        // Ensure at least one character from each required set
        charSets.slice(0, 4).forEach(set => {
          password += set.charAt(Math.floor(Math.random() * set.length));
        });

        // Fill the rest with random characters from all sets
        const allChars = charSets.join('');
        while (password.length < length) {
          password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        // Shuffle the password to mix the required characters
        password = password.split('').sort(() => 0.5 - Math.random()).join('');

        return password;
      }

      // --- HARD MODE USERNAME GENERATOR ---
      function generateHardUsername(length, letters, numbers, specialChars) {
        // Always start/end with letter, no repeats, must include upper, lower, number, special
        let tries = 0;
        while (tries++ < 1000) {
          let chars = [];
          let used = new Set();
          // Ensure at least one of each type
          chars.push(randomChar(letters).toUpperCase()); // Upper
          chars.push(randomChar(letters)); // Lower
          chars.push(randomChar(numbers));
          chars.push(randomChar(specialChars));
          // Fill rest randomly, but no repeats, no consecutive type
          let lastType = '';
          while (chars.length < length) {
            let type = ['upper', 'lower', 'number', 'special'][Math.floor(Math.random() * 4)];
            if (type === lastType) continue; // No consecutive type
            let c;
            if (type === 'upper') c = randomChar(letters).toUpperCase();
            if (type === 'lower') c = randomChar(letters);
            if (type === 'number') c = randomChar(numbers);
            if (type === 'special') c = randomChar(specialChars);
            if (used.has(c)) continue; // No repeats
            chars.push(c);
            used.add(c);
            lastType = type;
          }
          // Shuffle, but force first/last to be letter
          chars = shuffle(chars);
          if (!/[a-zA-Z]/.test(chars[0]) || !/[a-zA-Z]/.test(chars[chars.length - 1])) continue;
          let username = chars.join('');
          // Platform constraints
          username = applyPlatformConstraints(username);
          // Must contain all types
          if (
            /[A-Z]/.test(username) &&
            /[a-z]/.test(username) &&
            /\d/.test(username) &&
            /[_.]/.test(username)
          ) {
            return username;
          }
        }
        // fallback
        return generateNormalUsername(length, letters, numbers, specialChars);
      }

      function randomChar(str) {
        return str.charAt(Math.floor(Math.random() * str.length));
      }

      function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }

      // --- HARD MODE PASSWORD GENERATOR ---
      function generateHardPassword() {
        // Very hard passwords: 32 chars, at least 3 of each type, no repeats, no 3-char sequences
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const length = 32;
        let tries = 0;
        while (tries++ < 1000) {
          let chars = [];
          // At least 3 of each type
          for (let i = 0; i < 3; i++) {
            chars.push(randomChar(lowercase));
            chars.push(randomChar(uppercase));
            chars.push(randomChar(numbers));
            chars.push(randomChar(specialChars));
          }
          // Fill rest randomly, no repeats, no sequences
          let allChars = lowercase + uppercase + numbers + specialChars;
          while (chars.length < length) {
            let c = randomChar(allChars);
            if (chars.includes(c)) continue; // No repeats
            // No 3-char sequences (abc, 123, etc)
            if (
              chars.length >= 2 &&
              c.charCodeAt(0) === chars[chars.length - 1].charCodeAt(0) + 1 &&
              c.charCodeAt(0) === chars[chars.length - 2].charCodeAt(0) + 2
            ) continue;
            chars.push(c);
          }
          chars = shuffle(chars);
          let password = chars.join('');
          // Must contain at least 3 of each type
          if (
            (password.match(/[a-z]/g) || []).length >= 3 &&
            (password.match(/[A-Z]/g) || []).length >= 3 &&
            (password.match(/\d/g) || []).length >= 3 &&
            (password.match(/[!@#$%^&*()_\+\-\=\[\]{}|;:,.<>?]/g) || []).length >= 3
          ) {
            return password;
          }
        }
        // fallback
        return generatePasswordByStyleOld();
      }

      function generatePasswordByStyleOld() {
        // fallback to old logic if needed
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';
        const allChars = lowercase + uppercase + numbers + specialChars;
        for (let i = 0; i < 32; i++) {
          password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        return password;
      }

      // Common functions
      function displayResults(items, container, statsElement, statsText) {
        container.innerHTML = '';

        items.forEach(item => {
          const element = document.createElement('div');
          element.className = container.id === 'passResults' ? 'password' : 'username';
          element.textContent = item;
          element.title = `Click to copy: ${item}`;

          element.addEventListener('click', async function () {
            try {
              await navigator.clipboard.writeText(item);
              showCopiedMessage(container.id === 'passResults' ? passCopiedMessage : copiedMessage);
            } catch (err) {
              console.error('Failed to copy:', err);
              // Fallback for browsers that don't support clipboard API
              const textarea = document.createElement('textarea');
              textarea.value = item;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
              showCopiedMessage(container.id === 'passResults' ? passCopiedMessage : copiedMessage);
            }
          });

          container.appendChild(element);
        });

        statsElement.textContent = statsText;
      }

      function showCopiedMessage(element) {
        element.classList.add('show');
        setTimeout(() => {
          element.classList.remove('show');
        }, 2000);
      }

      // Generate initial usernames
      generateUsernames();

      // --- Feedback Button ---
      // Add feedback button to the page
      const feedbackBtn = document.createElement('button');
      feedbackBtn.textContent = '💬 Feedback';
      feedbackBtn.style.position = 'fixed';
      feedbackBtn.style.bottom = '18px';
      feedbackBtn.style.right = '18px';
      feedbackBtn.style.zIndex = '9999';
      feedbackBtn.style.background = '#5865F2';
      feedbackBtn.style.color = '#fff';
      feedbackBtn.style.borderRadius = '50px';
      feedbackBtn.style.padding = '10px 22px';
      feedbackBtn.style.fontWeight = 'bold';
      feedbackBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.13)';
      feedbackBtn.style.border = 'none';
      feedbackBtn.style.cursor = 'pointer';
      document.body.appendChild(feedbackBtn);

      // --- Feedback Tab ---
      // Add a new tab for feedback
      const tabButtonsContainer = document.querySelector('.tab-buttons');
      const feedbackTabBtn = document.createElement('button');
      feedbackTabBtn.className = 'tab-btn';
      feedbackTabBtn.setAttribute('data-tab', 'feedback-tab');
      feedbackTabBtn.textContent = 'Feedback';
      tabButtonsContainer.appendChild(feedbackTabBtn);

      // Add feedback tab content
      const feedbackTabContent = document.createElement('div');
      feedbackTabContent.id = 'feedback-tab';
      feedbackTabContent.className = 'tab-content';
      feedbackTabContent.innerHTML = `
        <h2 style="color:var(--primary-color);margin-bottom:10px;font-size:20px;">Feedback</h2>
        <div id="feedback-form-section" style="margin-bottom:24px;">
          <textarea id="feedback-textarea" style="width:100%;min-height:60px;border-radius:8px;border:1px solid #ddd;padding:8px;font-size:13px;margin-bottom:10px;" placeholder="Type your feedback..."></textarea>
          <br>
          <button id="feedback-send-btn" style="background:#5865F2;color:#fff;">Send Feedback</button>
          <span id="feedback-send-status" style="margin-left:10px;font-size:13px;"></span>
        </div>
        <div id="all-feedback-owner-section" style="display:none;">
          <h3 style="margin-bottom:8px;font-size:16px;">All Feedback</h3>
          <div id="all-feedback-list" style="max-height:220px;overflow:auto;text-align:left;font-size:13px;background:#fafbfc;border-radius:8px;padding:10px;border:1px solid #eee;"></div>
          <button id="clear-all-feedback-btn" style="margin-top:10px;background:#ff0050;color:#fff;border:none;padding:7px 18px;border-radius:8px;font-weight:bold;cursor:pointer;">Clear All</button>
        </div>
      `;
      document.querySelector('.container').appendChild(feedbackTabContent);

      // Tab switching logic (add feedback tab)
      tabButtonsContainer.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
          tabButtonsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
          button.classList.add('active');
          const tabId = button.getAttribute('data-tab');
          document.getElementById(tabId).classList.add('active');
        });
      });

      // Feedback send logic
      function saveFeedback(msg) {
        let arr = [];
        try {
          arr = JSON.parse(localStorage.getItem('all_feedbacks') || '[]');
        } catch { }
        arr.push({ text: msg, date: new Date().toISOString() });
        localStorage.setItem('all_feedbacks', JSON.stringify(arr));
      }
      function getAllFeedback() {
        let arr = [];
        try {
          arr = JSON.parse(localStorage.getItem('all_feedbacks') || '[]');
        } catch { }
        return arr;
      }
      function renderAllFeedback() {
        const listDiv = document.getElementById('all-feedback-list');
        const arr = getAllFeedback();
        if (!listDiv) return;
        if (arr.length === 0) {
          listDiv.innerHTML = '<em>No feedback yet.</em>';
        } else {
          listDiv.innerHTML = arr.map(f =>
            `<div style="margin-bottom:10px;"><b>${new Date(f.date).toLocaleString()}</b><br>${f.text}</div>`
          ).join('');
        }
      }
      // Feedback form events
      feedbackTabContent.querySelector('#feedback-send-btn').onclick = function () {
        const textarea = feedbackTabContent.querySelector('#feedback-textarea');
        const status = feedbackTabContent.querySelector('#feedback-send-status');
        const msg = textarea.value.trim();
        if (msg.length < 3) {
          textarea.style.borderColor = 'red';
          status.textContent = 'Please write more!';
          status.style.color = 'red';
          return;
        }
        saveFeedback(msg);
        textarea.value = '';
        textarea.style.borderColor = '#ddd';
        status.textContent = 'Feedback sent!';
        status.style.color = 'green';
        setTimeout(() => { status.textContent = ''; }, 2000);
      };

      // Feedback floating button opens feedback tab
      feedbackBtn.onclick = function () {
        tabButtonsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        feedbackTabBtn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        feedbackTabContent.classList.add('active');
      };

      // --- Owner-only feedback viewer ---
      window.__showFeedbackAdmin = function () {
        // Only show in feedback tab
        tabButtonsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        feedbackTabBtn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        feedbackTabContent.classList.add('active');
        // Show password prompt UI
        const ownerSection = document.getElementById('all-feedback-owner-section');
        if (!ownerSection) return;
        // If already visible, don't show prompt again
        if (ownerSection.style.display !== 'none') return;

        // Create overlay for password prompt
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.right = 0;
        overlay.style.bottom = 0;
        overlay.style.background = 'rgba(0,0,0,0.25)';
        overlay.style.zIndex = 99999;
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';

        const promptBox = document.createElement('div');
        promptBox.style.background = '#fff';
        promptBox.style.padding = '28px 22px 18px 22px';
        promptBox.style.borderRadius = '12px';
        promptBox.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
        promptBox.style.textAlign = 'center';
        promptBox.innerHTML = `
          <div style="font-size:17px;font-weight:bold;margin-bottom:10px;">Admin Access</div>
          <input type="password" id="admin-pass-input" placeholder="Enter password" style="padding:7px 12px;border-radius:7px;border:1px solid #ccc;font-size:15px;width:180px;">
          <br>
          <button id="admin-pass-btn" style="margin-top:14px;background:#5865F2;color:#fff;border:none;padding:7px 22px;border-radius:7px;font-weight:bold;cursor:pointer;">Show</button>
          <div id="admin-pass-err" style="color:#ff0050;font-size:13px;margin-top:8px;min-height:18px;"></div>
        `;
        overlay.appendChild(promptBox);
        document.body.appendChild(overlay);

        // Secret password (obfuscated, not visible in HTML source)
        const secret = atob('aGl0aGlzYWRtaW4=');

        promptBox.querySelector('#admin-pass-btn').onclick = function () {
          const val = promptBox.querySelector('#admin-pass-input').value;
          if (val === secret) {
            overlay.remove();
            ownerSection.style.display = '';
            renderAllFeedback();
          } else {
            promptBox.querySelector('#admin-pass-err').textContent = 'Wrong password!';
          }
        };
        promptBox.querySelector('#admin-pass-input').onkeydown = function (e) {
          if (e.key === 'Enter') promptBox.querySelector('#admin-pass-btn').click();
        };
      };
      // --- end owner-only feedback viewer ---

      // Hide all feedback section by default
      document.getElementById('all-feedback-owner-section').style.display = 'none';

      // Clear all feedback button logic (only visible to admin)
      document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'clear-all-feedback-btn') {
          if (confirm('Are you sure you want to delete all feedback?')) {
            localStorage.removeItem('all_feedbacks');
            renderAllFeedback();
          }
        }
      });
    });
