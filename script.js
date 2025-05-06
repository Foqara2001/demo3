  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyAu_GIcdkekULGpgdi3PJU05e8LdaLC2JM",
    authDomain: "prayertracker-db2f2.firebaseapp.com",
    databaseURL: "https://prayertracker-db2f2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "prayertracker-db2f2",
    storageBucket: "prayertracker-db2f2.appspot.com",
    messagingSenderId: "152895762913",
    appId: "1:152895762913:web:61abae5e6d687b411262a0",
    measurementId: "G-1T0ZZDPLQ1"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const database = firebase.database();
  
  // DOM Elements
  const calendar = document.getElementById("calendar");
  const trackerContainer = document.getElementById("tracker-container");
  const trackerTitle = document.getElementById("tracker-title");
  const trackerContent = document.getElementById("tracker-content");
  const dayProgressBar = document.getElementById("day-progress-bar");
  const navbar = document.querySelector(".navbar");
  
  // Initialize the app
  async function initializeApp() {
    try {
      // 1. Set current year in footer
      const yearElement = document.getElementById('current-year');
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }
      
      // 2. Set Ramadan date
      setRamadanDate();
      
      // 3. Load initial resources
      loadResources();
      
      // 4. Initialize Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      // 5. Check auth status and load user data
      await checkAuthStatus();
      
      // 6. Load initial page based on auth status
      const initialPage = auth.currentUser ? 'profile' : 'home';
      showPage(initialPage);
      
      // 7. Add scroll event for navbar
      window.addEventListener('scroll', handleScroll);
      
      // 8. Hamburger menu toggle
      const hamburger = document.querySelector('.hamburger');
      if (hamburger) {
        hamburger.addEventListener('click', () => {
          const navLinks = document.querySelector('.nav-links');
          navLinks.classList.toggle('active');
        });
      }
      
      // 9. Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.hamburger')) {
          navLinks.classList.remove('active');
        }
      });
      
      // 10. Load admin page if user is admin
      if (auth.currentUser) {
        const userData = await database.ref(`users/${auth.currentUser.uid}`).once('value');
        if (userData.exists() && userData.val().isAdmin) {
          document.getElementById('admin-link').style.display = 'block';
        }
      }
      if (auth.currentUser) {
        await loadUserProgress(); // تأكد من وجود هذه الدالة لتحميل البيانات
        generateCalendar(); // إنشاء التقويم مع الألوان
      }
      
      console.log('Application initialized successfully');
      
    } catch (error) {
      console.error('Error initializing app:', error);
      showMessage('حدث خطأ في تهيئة التطبيق', 'error');
    }

  }
  
  // Make sure DOM is loaded before initializing
  document.addEventListener('DOMContentLoaded', initializeApp);
  
  // Handle scroll for navbar effect
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  
  // Set Ramadan date display
  function setRamadanDate() {
    const ramadanDateElement = document.getElementById('ramadan-date');
    if (!ramadanDateElement) return;
  
    const ramadanStart = new Date();
    
    ramadanStart.setMonth(2); // March (0-indexed)
    ramadanStart.setDate(30); // Example start date
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const endDate = new Date(ramadanStart);
    endDate.setDate(ramadanStart.getDate() + 30);
    
    const dateStr = `${ramadanStart.toLocaleDateString('ar-EG', options)} - ${endDate.toLocaleDateString('ar-EG', options)}`;
    ramadanDateElement.textContent = dateStr;
  }
  
  // Page Navigation
  function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('[id$="-page"]').forEach(page => {
      if (page) page.style.display = 'none';
    });
    
    // Hide tracker modal if open
    if (trackerContainer) trackerContainer.style.display = "none";
    
    // Close mobile menu if open
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.remove('active');
    
    // Show requested page
    const page = document.getElementById(`${pageId}-page`);
    if (page) {
      page.style.display = 'block';
      window.scrollTo(0, 0);
    }
    
    // Special page handling
    if (pageId === 'tracker') {
      generateCalendar();
    } else if (pageId === 'profile') {
      loadProfilePage();
    } else if (pageId === 'resources') {
      loadResources();
    } else if (pageId === 'admin') {
      loadAdminPage();
    }
  }
  
  // Calendar and Tracker Functions
  function generateCalendar() {
    if (!calendar) return;
    
    calendar.innerHTML = '';
    const daysInMonth = 30;
    const currentDay = getCurrentRamadanDay();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div");
      dayElement.className = "day";
      dayElement.setAttribute("data-day", day);
      dayElement.innerHTML = `
        <div class="day-number">${day}</div>
        <div class="day-label">اليوم</div>
      `;
      
      if (day === currentDay) {
        dayElement.classList.add("current-day");
      }
      
      dayElement.addEventListener('click', () => openTracker(day));
      calendar.appendChild(dayElement);
      
      // ✅ تحديث النمط فور إنشاء اليوم
      updateDayStyle(dayElement, day);
    }
  }
  
  function getCurrentRamadanDay() {
    return 10; // Example day
  }
  
  async function loadBasicTasks(day) {
    const user = auth.currentUser;
    if (!user) return;
  
    // تحميل المهام الأساسية (الصلوات، الأذكار، etc)
    const tasksSnapshot = await database.ref(`users/${user.uid}/basicTasks`).once('value');
    const basicTasks = tasksSnapshot.val() || {};
    
    // عرض المهام في الواجهة
    Object.entries(basicTasks).forEach(([taskId, task]) => {
        const group = document.getElementById(`${task.section}-group`);
        if (group) {
            const taskElement = document.createElement('label');
            taskElement.className = 'checkbox-item';
            taskElement.innerHTML = `
                <span>${task.name}</span>
                <input type="checkbox" data-task="${taskId}">
            `;
            group.appendChild(taskElement);
        }
    });
  }
  async function loadDayCustomTasks(day) {
    const user = auth.currentUser;
    if (!user) return;
  
    const snapshot = await database.ref(`users/${user.uid}/dayTasks/${day}`).once('value');
    const tasks = snapshot.val() || {};
    
    Object.entries(tasks).forEach(([taskId, task]) => {
        const group = document.getElementById(`${task.category}-group`);
        if (group) {
            const taskElement = document.createElement('label');
            taskElement.className = 'checkbox-item';
            taskElement.innerHTML = `
                <span>${task.name}</span>
                <input type="checkbox" data-task="${taskId}" ${task.completed ? 'checked' : ''}>
            `;
            group.appendChild(taskElement);
        }
    });
  }
  
  async function loadSavedTasks(day) {
    const user = auth.currentUser;
    if (!user) return;
  
    const snapshot = await database.ref(`users/${user.uid}/tracker/day${day}`).once('value');
    const dayData = snapshot.val() || {};
    
    document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        const taskId = checkbox.getAttribute("data-task");
        checkbox.checked = dayData[taskId] || false;
        
        checkbox.onchange = () => {
            const updates = {};
            updates[`users/${user.uid}/tracker/day${day}/${taskId}`] = checkbox.checked;
            database.ref().update(updates);
        };
    });
  }
  async function loadDayCustomCategories(day) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('User not logged in');
        return;
      }
  
      const trackerContainer = document.getElementById('tracker-container');
      if (!trackerContainer || trackerContainer.style.display !== 'block') {
        console.warn("نافذة المتابعة غير مفتوحة!");
        return;
      }
  
      const container = trackerContainer.querySelector('#custom-categories-container');
      if (!container) {
        console.error("العنصر 'custom-categories-container' غير موجود في DOM!");
        return;
      }
  
      // مسح المحتوى الحالي
      container.innerHTML = '';
  
      // تحميل الفئات من قاعدة البيانات
      const snapshot = await database.ref(`users/${user.uid}/dayCategories/${day}`).once('value');
      const categories = snapshot.val() || {};
  
      // إضافة الفئات إلى الواجهة
      Object.entries(categories).forEach(([categoryId, category]) => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'custom-category';
        categoryElement.setAttribute('data-category-id', categoryId);
  
        categoryElement.innerHTML = `
          <div class="custom-category-header" onclick="toggleCategoryContent(this)">
            <i class="fas ${category.icon}"></i>
            <h4>${category.name}</h4>
            <button class="delete-category-btn" onclick="event.stopPropagation(); deleteCustomCategory('${day}', '${categoryId}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          <div class="custom-category-content" style="display:none">
            <div class="tasks-group" id="${categoryId}-day${day}-group"></div>
            <button class="add-task-btn" onclick="addCustomTaskToDay('${category.name.replace(/'/g, "\\'")}', '${categoryId}', ${day})">
              <i class="fas fa-plus"></i> إضافة نشاط
            </button>
          </div>
        `;
        
        container.appendChild(categoryElement);
        loadCategoryTasksForDay(categoryId, day);
      });
  
      // إضافة زر "إضافة فئة" مرة واحدة فقط
      if (!container.querySelector('.add-category-btn')) {
        const addCategoryBtn = document.createElement('button');
        addCategoryBtn.className = 'add-category-btn';
        addCategoryBtn.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة فئة جديدة';
        addCategoryBtn.onclick = () => showAddCategoryModal(day);
        container.appendChild(addCategoryBtn);
      }
  
    } catch (error) {
      console.error('Error loading custom categories:', error);
      showMessage('حدث خطأ في تحميل الفئات المخصصة', 'error');
    }
  }
  
  
  async function openTracker(day) {
    const user = auth.currentUser;
    if (!user) {
      alert('الرجاء تسجيل الدخول لتسجيل متابعتك');
      toggleAuthModal();
      return;
    }
  
    // تعيين عنوان اليوم
    if (trackerTitle) trackerTitle.innerText = `اليوم ${day}`;
  
    // تحميل القالب الأساسي
    const template = document.getElementById("template-content");
    if (template && trackerContent) {
      trackerContent.innerHTML = template.innerHTML;
      
      // ✅ نضيف تأخيرًا بسيطًا حتى يتم إدخال العناصر إلى الـ DOM
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  
    // إظهار نافذة المتابعة
    if (trackerContainer) {
      trackerContainer.style.display = "block";
    }
  
    // تحميل البيانات
    try {
      await Promise.all([
        loadBasicTasks(day),
        loadCustomTasks(day)
      ]);
  
      // ✅ نحمّل الفئات بعد التأكد من وجود العنصر في الـ DOM
      await loadDayCustomCategories(day);
  
      await loadSavedTasks(day);
      updateDayProgressBar(day);
    } catch (error) {
      console.error('Error loading tracker data:', error);
      showMessage('حدث خطأ في تحميل بيانات اليوم', 'error');
    }
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.setAttribute("data-day", day); // إضافة سمة اليوم
      checkbox.addEventListener('change', () => {
        updateDayProgressBar(day);
        saveTaskState(day, checkbox);
        updateDayStyle(document.querySelector(`.day[data-day="${day}"]`), day);
      });
    });
    
    updateDayProgressBar(day); // تحديث أولي عند الفتح
  }
  async function saveTaskState(day, checkbox) {
    const user = auth.currentUser;
    const taskId = checkbox.dataset.task;
    const updates = {};
    updates[`users/${user.uid}/tracker/day${day}/${taskId}`] = checkbox.checked;
    await database.ref().update(updates);
  }
  
  
  
  
  
  
  async function addCustomTaskToDay(categoryName, categoryId, day) {
    const taskName = prompt(`أدخل اسم النشاط الجديد لـ ${categoryName}:`);
    if (!taskName) return;
  
    const taskId = `task_${Date.now()}`;
    const user = auth.currentUser;
    
    try {
      await database.ref(`users/${user.uid}/dayTasks/${day}/${categoryId}/${taskId}`).set({
        name: taskName,
        completed: false,
        createdAt: new Date().toISOString()
      });
  
      // إضافة المهمة إلى الواجهة
      const group = document.getElementById(`${categoryId}-day${day}-group`);
      if (group) {
        const taskElement = document.createElement('div');
        taskElement.className = 'custom-task-container';
        taskElement.innerHTML = `
          <div class="task-content">
            <label class="checkbox-item">
              <span>${taskName}</span>
              <input type="checkbox" data-task="${taskId}" data-category="${categoryId}">
            </label>
          </div>
          <button class="delete-task-btn" onclick="removeDayTask('${day}', '${categoryId}', '${taskId}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        group.appendChild(taskElement);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      showMessage('حدث خطأ أثناء إضافة النشاط', 'error');
    }
  }
  async function updateDayProgressBar(day) {
    const user = auth.currentUser;
    if (!user || !dayProgressBar) return;
    
    // احصل على جميع checkboxes في اليوم الحالي
    const checkboxes = document.querySelectorAll(`#tracker-container input[type="checkbox"]`);
    const totalTasks = checkboxes.length;
    
    if (totalTasks === 0) {
      dayProgressBar.style.width = '0%';
      document.querySelector('.progress-text').textContent = '0% مكتمل (لا توجد مهام)';
      return;
    }
  
    // احسب المهام المكتملة
    let completedTasks = 0;
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) completedTasks++;
    });
  
    // احسب النسبة المئوية
    const progress = Math.round((completedTasks / totalTasks) * 100);
    dayProgressBar.style.width = `${progress}%`;
    
    // تحديث النص
    document.querySelector('.progress-text').textContent = 
      `${progress}% مكتمل (${completedTasks}/${totalTasks} مهام)`;
  }
  
  async function updateDayStyle(dayElement, day) {
    const user = auth.currentUser;
    if (!user || !dayElement) return;
  
    // جلب بيانات اليوم من Firebase
    const snapshot = await database.ref(`users/${user.uid}/tracker/day${day}`).once('value');
    const dayData = snapshot.val() || {};
    
    // حساب المهام المكتملة
    const tasks = Object.keys(dayData).filter(task => dayData[task] === true);
    const totalTasks = Object.keys(dayData).length;
    const progress = totalTasks > 0 ? (tasks.length / totalTasks) * 100 : 0;
  
    // إعادة تعيين الأنماط أولاً
    dayElement.style.backgroundColor = "";
    dayElement.style.color = "";
    dayElement.classList.remove("completed");
  
    // تحديد اللون حسب النسبة (بتدرجات أقل كثافة)
    if (progress === 0) {
      dayElement.style.backgroundColor = "#fef2f2";  // أحمر فاتح
      dayElement.style.color = "#b91c1c";
    } else if (progress < 30) {
      dayElement.style.backgroundColor = "#fffbeb";  // أصفر فاتح
      dayElement.style.color = "#b45309";
    } else if (progress < 60) {
      dayElement.style.backgroundColor = "#fef3c7";  // أصفر ذهبي
      dayElement.style.color = "#92400e";
    } else if (progress < 100) {
      dayElement.style.backgroundColor = "#ecfdf5";  // أخضر فاتح جداً
      dayElement.style.color = "#065f46";
    } else {
      dayElement.style.backgroundColor = "#d1fae5";  // أخضر فاتح (بدلاً من الغامق)
      dayElement.style.color = "#047857";
      dayElement.classList.add("completed");
    }
  }
  
  function goBack() {
    if (trackerContainer) trackerContainer.style.display = "none";
  }
  
  // Resources Functions
  function loadResources() {
    // Load from Firebase
    database.ref('resources').once('value').then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        displayResources(data.prayers, 'prayers-resources');
        displayResources(data.quran, 'quran-resources');
        displayResources(data.lessons, 'lessons-resources');
      } else {
        // If no data in Firebase, load default resources
        loadDefaultResources();
      }
    }).catch((error) => {
      console.error("Error loading resources:", error);
      loadDefaultResources();
    });
  }
  
  function displayResources(resources, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!resources) return;
    
    Object.values(resources).forEach(resource => {
      if (resource && resource.url && resource.title) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${resource.url}" target="_blank">${resource.title}</a>`;
        container.appendChild(li);
      }
    });
  }
  
  function loadDefaultResources() {
    const defaultResources = {
      prayers: {
        1: { title: "الأذكار الموسمية", url: "https://d1.islamhouse.com/data/ar/ih_books/single/ar_athkar_almushafiah.pdf" },
        2: { title: "أدعية رمضان", url: "https://ar.islamway.net/collection/4746/%D8%A3%D8%AF%D8%B9%D9%8A%D8%A9-%D8%B1%D9%85%D8%B6%D8%A7%D9%86" }
      },
      quran: {
        1: { title: "القرآن الكريم بقراءات متعددة", url: "https://quran.ksu.edu.sa/" },
        2: { title: "تلاوات للقراء المشهورين", url: "https://server.mp3quran.net/" }
      },
      lessons: {
        1: { title: "دروس رمضانية", url: "https://ar.islamway.net/lessons?month=9" },
        2: { title: "سلسلة دروس رمضان", url: "https://www.youtube.com/playlist?list=PLxI8Ct9zH7e8jQ1uFQJiV1J3T1T1Z1Z1Z" }
      }
    };
    
    displayResources(defaultResources.prayers, 'prayers-resources');
    displayResources(defaultResources.quran, 'quran-resources');
    displayResources(defaultResources.lessons, 'lessons-resources');
  }
  
  // Tab functionality for resources
  function openTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Show selected tab content
    const tabContent = document.getElementById(tabId);
    if (tabContent) tabContent.classList.add('active');
    
    // Activate selected tab button
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      if (btn.getAttribute('onclick').includes(tabId)) {
        btn.classList.add('active');
      }
    });
  }
  
  // Authentication Functions
  async function checkAuthStatus() {
    return new Promise((resolve) => {
      auth.onAuthStateChanged(async (user) => {
        try {
          const authLink = document.getElementById('auth-link');
          const profileLink = document.getElementById('profile-link');
          const adminLink = document.getElementById('admin-link');
          const trackerLink = document.getElementById('tracker-link');
          
          if (user) {
            // 1. تحديث واجهة المستخدم للمستخدم المسجل
            if (authLink) {
              authLink.textContent = 'تسجيل الخروج';
              authLink.onclick = logout;
            }
            
            if (profileLink) profileLink.style.display = 'block';
            if (trackerLink) trackerLink.style.display = 'block';
  
            // 2. تحميل بيانات المستخدم
            const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
            const userData = userSnapshot.val() || {};
  
            // 3. تحديث الصورة الرمزية
            updateUserAvatar(user, userData);
  
            // 4. التحقق من صلاحيات المشرف
            if (adminLink) {
              adminLink.style.display = userData.isAdmin ? 'block' : 'none';
            }
  
            // 5. تحميل البيانات الإضافية
            await Promise.all([
              loadCustomCategories(),
              loadUserProgress(),
              loadGlobalStats()
            ]);
  
            // 6. تحديث حالة اليوم الحالي
            updateCurrentDayStatus();
  
          } else {
            // حالة الزائر غير المسجل
            if (authLink) {
              authLink.textContent = 'تسجيل الدخول';
              authLink.onclick = toggleAuthModal;
            }
            
            if (profileLink) profileLink.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
            if (trackerLink) trackerLink.style.display = 'none';
          }
  
          resolve();
        } catch (error) {
          console.error('Error in auth state change:', error);
          showMessage('حدث خطأ في تحميل بيانات المستخدم', 'error');
          resolve();
        }
      });
    });
  }
  
  // الدوال المساعدة
  
  // ✅ دالة تحميل الفئات العامة (placeholder)
  async function loadCustomCategories() {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const snapshot = await database.ref(`users/${user.uid}/customCategories`).once('value');
      const categories = snapshot.val() || {};
      window.console.log("Custom categories loaded:", categories);
    } catch (error) {
      window.console.error("Error loading custom categories:", error);
    }
  }
  
  
  function updateUserAvatar(user, userData) {
    const avatar = document.getElementById('profile-avatar');
    const largeAvatar = document.getElementById('profile-avatar-large');
    const avatarText = userData.username 
      ? userData.username.charAt(0).toUpperCase() 
      : user.email.charAt(0).toUpperCase();
  
    if (avatar) avatar.textContent = avatarText;
    if (largeAvatar) largeAvatar.textContent = avatarText;
  }
  
  async function updateCurrentDayStatus() {
    const currentDayElement = document.getElementById('current-day');
    if (currentDayElement) {
      const currentDay = getCurrentRamadanDay();
      currentDayElement.textContent = `اليوم ${currentDay}`;
    }
  }
  
  function toggleAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    
    if (modal.style.display === 'block') {
      modal.style.display = 'none';
    } else {
      modal.style.display = 'block';
      showLoginForm();
    }
  }
  
  function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const emailField = document.getElementById('email');
    
    if (!loginForm || !registerForm) return;
    
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    
    if (emailField) emailField.focus();
  }
  
  function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const usernameField = document.getElementById('reg-username');
    
    if (!loginForm || !registerForm) return;
    
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    
    if (usernameField) usernameField.focus();
  }
  
  function closeModal() {
    const authModal = document.getElementById('auth-modal');
    const resetModal = document.getElementById('reset-modal');
    
    if (authModal) authModal.style.display = 'none';
    if (resetModal) resetModal.style.display = 'none';
  }
  
  function register() {
    const username = document.getElementById('reg-username')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    const confirmPassword = document.getElementById('reg-confirm-password')?.value;
    const message = document.getElementById('register-message');
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      if (message) {
        message.textContent = 'الرجاء ملء جميع الحقول';
        message.className = 'message error';
      }
      return;
    }
    
    if (password !== confirmPassword) {
      if (message) {
        message.textContent = 'كلمة المرور غير متطابقة';
        message.className = 'message error';
      }
      return;
    }
    
    if (password.length < 6) {
      if (message) {
        message.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        message.className = 'message error';
      }
      return;
    }
    
    // Create user with email and password
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        
        // Save additional user data to database
        return database.ref(`users/${user.uid}`).set({
          username: username,
          email: email,
          joinDate: new Date().toLocaleDateString('ar-EG'),
          isAdmin: false
        });
      })
      .then(() => {
        if (message) {
          message.textContent = 'تم إنشاء الحساب بنجاح!';
          message.className = 'message success';
        }
        
        setTimeout(() => {
          closeModal();
          checkAuthStatus();
          showPage('profile');
        }, 1000);
      })
      .catch((error) => {
        if (message) {
          const errorCode = error.code;
          let errorMessage = error.message;
          
          if (errorCode === 'auth/email-already-in-use') {
            errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
          } else if (errorCode === 'auth/invalid-email') {
            errorMessage = 'البريد الإلكتروني غير صالح';
          } else if (errorCode === 'auth/weak-password') {
            errorMessage = 'كلمة المرور ضعيفة';
          }
          
          message.textContent = errorMessage;
          message.className = 'message error';
        }
      });
  }
  
  function login() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const message = document.getElementById('login-message');
    
    if (!emailField || !passwordField || !message) {
      console.error("Login form missing required fields");
      return;
    }
  
    const email = emailField.value.trim();
    const password = passwordField.value;
    
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        message.textContent = 'تم تسجيل الدخول بنجاح!';
        message.className = 'message success';
        
        setTimeout(() => {
          closeModal();
          checkAuthStatus();
          
          database.ref(`users/${userCredential.user.uid}/isAdmin`).once('value').then((snapshot) => {
            if (snapshot.exists() && snapshot.val()) {
              showPage('admin');
            } else {
              showPage('profile');
            }
          });
        }, 1000);
      })
      .catch((error) => {
        const errorCode = error.code;
        let errorMessage = error.message;
        
        if (errorCode === 'auth/user-not-found') {
          errorMessage = 'المستخدم غير موجود';
        } else if (errorCode === 'auth/wrong-password') {
          errorMessage = 'كلمة المرور غير صحيحة';
        } else if (errorCode === 'auth/invalid-email') {
          errorMessage = 'البريد الإلكتروني غير صالح';
        }
        
        message.textContent = errorMessage;
        message.className = 'message error';
      });
  }
  
  function logout() {
    auth.signOut()
      .then(() => {
        checkAuthStatus();
        showPage('home');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  }
  
  // Profile Page Functions
  async function loadProfilePage() {
    const user = auth.currentUser;
    if (!user) {
      showPage('home');
      return;
    }
  
    // تحميل بيانات المستخدم
    const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
    const userData = userSnapshot.val() || {};
  
    // تعبئة البيانات الأساسية
    document.getElementById('profile-username').textContent = userData.username || user.email;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-join-date').textContent = userData.joinDate || 'غير معروف';
  
    // تحديث الصورة الرمزية
    const avatar = document.getElementById('profile-avatar-large');
    if (avatar) {
      avatar.textContent = (userData.username || user.email).charAt(0).toUpperCase();
    }
  
    // حساب وعرض الإحصائيات
    const stats = await calculateUserStats(user.uid);
    document.getElementById('completed-days').textContent = `${stats.completedDays}/30`;
    document.getElementById('full-prayer-days').textContent = `${stats.fullPrayerDays}/30`;
    document.getElementById('completion-rate').textContent = `${stats.completionRate}%`;
  
    // توليد التقويم
    generateProfileCalendar(user.uid);
  }
  
  async function calculateUserStats(userId) {
    const snapshot = await database.ref(`users/${userId}/tracker`).once('value');
    const trackerData = snapshot.val() || {};
    
    let stats = {
      completedDays: 0,       // أيام أكملت كل المهام
      fullPrayerDays: 0,      // أيام صليت فيها كل الصلوات
      totalPrayers: 0,        // إجمالي الصلوات
      completionRate: 0       // نسبة الإنجاز
    };
  
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
    for (let day = 1; day <= 30; day++) {
      const dayData = trackerData[`day${day}`] || {};
      let dayCompleted = true;
      let prayersCompleted = 0;
  
      // حساب الصلوات
      prayers.forEach(prayer => {
        if (dayData[prayer]) {
          stats.totalPrayers++;
          prayersCompleted++;
        } else {
          dayCompleted = false;
        }
      });
  
  
      // تحديث الإحصائيات
      if (dayCompleted) stats.completedDays++;
      if (prayersCompleted === 5) stats.fullPrayerDays++;
    }
  
    stats.completionRate = Math.round((stats.completedDays / 30) * 100);
    return stats;
  }
  
  function generateProfileCalendar(userId) {
    const calendar = document.getElementById('profile-calendar');
    if (!calendar) return;
  
    calendar.innerHTML = '';
  
    database.ref(`users/${userId}/tracker`).once('value').then(snapshot => {
      const trackerData = snapshot.val() || {};
  
      for (let day = 1; day <= 30; day++) {
        const dayData = trackerData[`day${day}`] || {};
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
  
        // تحديد حالة اليوم (بدون تأثير على الأقسام الأخرى)
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const prayersCompleted = prayers.filter(p => dayData[p]).length;
        const isJuzCompleted = dayData.juz;
  
        if (prayersCompleted === 5 && isJuzCompleted) {
          dayElement.classList.add('full');
        } else if (prayersCompleted > 0 || isJuzCompleted) {
          dayElement.classList.add('partial');
        }
  
        calendar.appendChild(dayElement);
      }
    });
  }
  
  function showResetConfirm() {
    const resetModal = document.getElementById('reset-modal');
    if (resetModal) resetModal.style.display = 'block';
  }
  
  function resetUserData() {
    const user = auth.currentUser;
    if (!user) return;
    
    // Delete all user tracker data
    database.ref(`users/${user.uid}/tracker`).remove()
      .then(() => {
        closeModal();
        alert('تم إعادة تعيين بياناتك بنجاح');
        loadProfilePage();
        generateCalendar();
      })
      .catch((error) => {
        console.error("Error resetting user data:", error);
        alert('حدث خطأ أثناء إعادة تعيين البيانات');
      });
  }
  
  // Custom Tasks Functions
  async function addCustomTask(sectionName, sectionId) {
    const taskName = prompt(`أدخل اسم العبادة الجديدة لقسم ${sectionName}:`);
    if (!taskName) return;
  
    const taskId = `custom_${Date.now()}`;
    
    const group = document.getElementById(`${sectionId}-group`);
    if (!group) return;
  
    const newTask = document.createElement('div');
    newTask.className = 'custom-task-container';
    newTask.innerHTML = `
      <div class="task-content">
        <label class="checkbox-item">
          <span>${taskName}</span>
          <input type="checkbox" data-task="${taskId}">
        </label>
      </div>
      <button class="delete-task-btn" onclick="removeTask(this, '${taskId}')">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    
    group.appendChild(newTask);
    
    const user = auth.currentUser;
    if (user) {
      await database.ref(`users/${user.uid}/customTasks/${taskId}`).set({
        name: taskName,
        section: sectionId,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  
  function showAddCategoryModal(day) {
    const modal = document.getElementById('category-modal');
    if (!modal) return;
  
    // تخزين اليوم في الزر إنشاء
    const createBtn = modal.querySelector('.primary-btn');
    if (createBtn) {
      createBtn.onclick = function() {
        createNewCategory(day);
      };
    }
  
    modal.style.display = 'flex';
    document.getElementById('category-name').focus();
  }
  
  function closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) modal.style.display = 'none';
  }
  
  
  async function createNewCategory(day) {
    const name = document.getElementById('category-name').value.trim();
    const icon = document.getElementById('category-icon').value;
    const messageEl = document.getElementById('category-message');
    const user = auth.currentUser;
  
    if (!name) {
      showMessage('الرجاء إدخال اسم الفئة', 'error', messageEl);
      return;
    }
  
    try {
      // إزالة أي مستمع أحداث سابق
      document.getElementById('create-category-btn').onclick = null;
      
      const categoryId = `cat_${Date.now()}`;
      await database.ref(`users/${user.uid}/dayCategories/${day}/${categoryId}`).set({
        name,
        icon,
        createdAt: new Date().toISOString()
      });
  
      showMessage('تم إنشاء الفئة بنجاح', 'success', messageEl);
      
      // إغلاق النافذة وإعادة تحميل الفئات
      closeCategoryModal();
      await loadDayCustomCategories(day);
      
    } catch (error) {
      console.error('Error creating category:', error);
      showMessage('حدث خطأ أثناء إنشاء الفئة', 'error', messageEl);
    }
  }
  function toggleCategoryContent(header) {
    // إيقاف انتشار الحدث لمنع التداخل مع الأزرار الأخرى
    event.stopPropagation();
    
    const content = header.nextElementSibling;
    if (content) {
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }
  }
  
  async function loadCustomTasks(day) {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      // 1. تحميل العبادات المخصصة الأساسية
      const snapshot = await database.ref(`users/${user.uid}/customTasks`).once('value');
      const customTasks = snapshot.val() || {};
      
      Object.entries(customTasks).forEach(([taskId, task]) => {
        const group = document.getElementById(`${task.section}-group`);
        if (group) {
          const exists = group.querySelector(`input[data-task="${taskId}"]`);
          if (!exists) {
            const newTask = document.createElement('div');
            newTask.className = 'custom-task-container';
            newTask.innerHTML = `
              <div class="task-content">
                <label class="checkbox-item">
                  <span>${task.name}</span>
                  <input type="checkbox" data-task="${taskId}">
                </label>
              </div>
              <button class="delete-task-btn" onclick="removeTask(this, '${taskId}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            `;
            group.appendChild(newTask);
          }
        }
      });
  
      // 2. تحميل مهام الفئات المخصصة
      const categoriesSnapshot = await database.ref(`users/${user.uid}/customCategories`).once('value');
      const categories = categoriesSnapshot.val() || {};
      
      Object.entries(categories).forEach(([categoryId, category]) => {
        const group = document.getElementById(`${categoryId}-group`);
        if (group) {
          // تحميل المهام الخاصة بهذه الفئة
          database.ref(`users/${user.uid}/categoryTasks/${categoryId}`).once('value').then((tasksSnapshot) => {
            const tasks = tasksSnapshot.val() || {};
            
            Object.entries(tasks).forEach(([taskId, task]) => {
              const exists = group.querySelector(`input[data-task="${taskId}"]`);
              if (!exists) {
                const newTask = document.createElement('div');
                newTask.className = 'custom-task-container';
                newTask.innerHTML = `
                  <div class="task-content">
                    <label class="checkbox-item">
                      <span>${task.name}</span>
                      <input type="checkbox" data-task="${taskId}">
                    </label>
                  </div>
                  <button class="delete-task-btn" onclick="removeCategoryTask('${categoryId}', '${taskId}')">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                `;
                group.appendChild(newTask);
              }
            });
          });
        }
      });
  
      // 3. تحميل حالة المهام لهذا اليوم
      const daySnapshot = await database.ref(`users/${user.uid}/tracker/day${day}`).once('value');
      const dayData = daySnapshot.val() || {};
      
      // تحديث جميع صناديق الاختيار (العبادات الأساسية والفئات المخصصة)
      document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        const task = checkbox.getAttribute("data-task");
        checkbox.checked = dayData[task] || false;
        
        checkbox.onchange = () => {
          const updates = {};
          updates[`users/${user.uid}/tracker/day${day}/${task}`] = checkbox.checked;
          database.ref().update(updates)
            .then(() => {
              const dayElement = document.querySelector(`.day:nth-child(${day})`);
              if (dayElement) updateDayStyle(dayElement, day);
              updateDayProgressBar(day);
            });
        };
      });
      
    } catch (error) {
      console.error("حدث خطأ أثناء تحميل العبادات المخصصة:", error);
      showMessage('حدث خطأ في تحميل المهام', 'error');
    }
  }
  
  
  // دالة مساعدة لحذف مهام الفئات المخصصة
  async function removeCategoryTask(categoryId, taskId) {
    if (!confirm('هل أنت متأكد من حذف هذه العبادة؟')) return;
    
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      await database.ref(`users/${user.uid}/categoryTasks/${categoryId}/${taskId}`).remove();
      
      // إزالة العنصر من الواجهة
      const checkbox = document.querySelector(`input[data-task="${taskId}"]`);
      if (checkbox) {
        checkbox.closest('.custom-task-container').remove();
      }
      
      showMessage('تم حذف العبادة بنجاح', 'success');
    } catch (error) {
      console.error("حدث خطأ أثناء حذف العبادة:", error);
      showMessage('حدث خطأ أثناء حذف العبادة', 'error');
    }
  }
  
  function removeTask(button, taskId) {
    if (!confirm('هل أنت متأكد من حذف هذه العبادة؟')) return;
    
    const taskItem = button.parentElement;
    taskItem.remove();
    
    if (taskId.startsWith('custom_')) {
      const user = auth.currentUser;
      if (user) {
        database.ref(`users/${user.uid}/customTasks/${taskId}`).remove()
          .then(() => {
            console.log("تم حذف العبادة بنجاح");
          })
          .catch((error) => {
            console.error("حدث خطأ أثناء حذف العبادة:", error);
          });
      }
    }
  }
  async function loadCategoryTasksForDay(categoryId, day) {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const snapshot = await database.ref(`users/${user.uid}/dayTasks/${day}/${categoryId}`).once('value');
      const tasks = snapshot.val() || {};
      
      const group = document.getElementById(`${categoryId}-day${day}-group`);
      if (!group) return;
  
      group.innerHTML = ''; // مسح المهام الحالية
  
      Object.entries(tasks).forEach(([taskId, task]) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'custom-task-container';
        taskElement.innerHTML = `
          <div class="task-content">
            <label class="checkbox-item">
              <span>${task.name}</span>
              <input type="checkbox" data-task="${taskId}" data-category="${categoryId}" ${task.completed ? 'checked' : ''}>
            </label>
          </div>
          <button class="delete-task-btn" onclick="removeDayTask('${day}', '${categoryId}', '${taskId}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        group.appendChild(taskElement);
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
      showMessage('حدث خطأ في تحميل المهام', 'error');
    }
  }
  
  async function removeDayTask(day, categoryId, taskId) {
    if (!confirm('هل أنت متأكد من حذف هذا النشاط؟')) return;
    
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      // حذف المهمة من قاعدة البيانات
      await database.ref(`users/${user.uid}/dayTasks/${day}/${categoryId}/${taskId}`).remove();
      
      // إزالة العنصر من الواجهة بسلاسة
      const taskElement = document.querySelector(`input[data-task="${taskId}"]`)?.closest('.custom-task-container');
      if (taskElement) {
        taskElement.style.transition = 'all 0.3s ease';
        taskElement.style.opacity = '0';
        taskElement.style.height = '0';
        taskElement.style.margin = '0';
        taskElement.style.padding = '0';
        taskElement.style.overflow = 'hidden';
        
        setTimeout(() => {
          taskElement.remove();
        }, 300);
      }
      
      showMessage('تم حذف النشاط بنجاح', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      showMessage('حدث خطأ أثناء حذف النشاط', 'error');
    }
  }
  
  
  
  // دالة جديدة لإنشاء فئة ليوم معين
  document.getElementById('create-category-btn').addEventListener('click', async () => {
    const nameInput = document.getElementById('category-name');
    const iconSelect = document.getElementById('category-icon');
    const message = document.getElementById('category-message');
  
    const name = nameInput.value.trim();
    const icon = iconSelect.value;
  
    if (!name) {
      message.textContent = 'يرجى إدخال اسم الفئة';
      message.className = 'message error';
      message.style.display = 'block';
      return;
    }
  
    const user = auth.currentUser;
    if (!user) {
      message.textContent = 'يجب تسجيل الدخول';
      message.className = 'message error';
      message.style.display = 'block';
      return;
    }
  
    const day = getCurrentDayFromTracker(); // تحديد اليوم الحالي من المتتبع
    const categoryId = `cat_${Date.now()}`;
  
    try {
      await database.ref(`users/${user.uid}/dayCategories/${day}/${categoryId}`).set({
        name,
        icon,
        createdAt: new Date().toISOString()
      });
  
      message.textContent = 'تم إنشاء الفئة بنجاح';
      message.className = 'message success';
      message.style.display = 'block';
  
      nameInput.value = '';
      iconSelect.value = 'fa-book';
  
      // ✅ تحميل الفئات من جديد لتظهر مباشرة
      
      await loadDayCustomCategories(day);
  
      // ✅ إغلاق النافذة
      closeCategoryModal();
  
    } catch (error) {
      console.error('Error creating category:', error);
      message.textContent = 'حدث خطأ أثناء إنشاء الفئة';
      message.className = 'message error';
      message.style.display = 'block';
    }
  });



  
  
  
  // دالة محسنة لعرض النافذة
  function showAddCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (!modal) return;
  
    // إعادة تعيين الحقول
    document.getElementById('category-name').value = '';
    document.getElementById('category-message').style.display = 'none';
    
    // عرض النافذة
    modal.style.display = 'flex';
    document.getElementById('category-name').focus();
  }
  
  // دالة محسنة لإغلاق النافذة
  function closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) modal.style.display = 'none';
  }
  
  
  
  // دالة مساعدة لعرض الرسائل
  function showMessage(text, type, element) {
    if (!element) return;
    
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
      element.style.display = 'none';
    }, 3000);
  }
  async function deleteCustomCategory(day, categoryId) {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة وجميع المهام المرتبطة بها؟")) return;
  
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const updates = {};
      updates[`users/${user.uid}/dayCategories/${day}/${categoryId}`] = null;
      updates[`users/${user.uid}/dayTasks/${day}/${categoryId}`] = null;
      
      await database.ref().update(updates);
  
      // إزالة العنصر من الواجهة
      const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
      if (categoryElement) {
        categoryElement.style.transition = 'all 0.3s ease';
        categoryElement.style.opacity = '0';
        categoryElement.style.height = '0';
        categoryElement.style.margin = '0';
        categoryElement.style.padding = '0';
        categoryElement.style.overflow = 'hidden';
        
        setTimeout(() => {
          categoryElement.remove();
        }, 300);
      }
  
      showMessage("تم حذف الفئة بنجاح", "success");
    } catch (error) {
      console.error("خطأ أثناء الحذف:", error);
      showMessage("حدث خطأ أثناء حذف الفئة", "error");
    }
  }
  function getCurrentDayFromTracker() {
    // تحقق مما إذا كانت نافذة المتابعة مفتوحة
    const trackerContainer = document.getElementById('tracker-container');
    if (!trackerContainer || trackerContainer.style.display !== 'block') {
      console.warn("نافذة المتابعة غير مفتوحة!");
      return 1; // قيمة افتراضية إذا لم تكن النافذة مفتوحة
    }
  
    // استخراج رقم اليوم من عنوان النافذة
    const trackerTitle = document.getElementById('tracker-title');
    if (trackerTitle) {
      const dayMatch = trackerTitle.textContent.match(/اليوم (\d+)/);
      if (dayMatch && dayMatch[1]) {
        return parseInt(dayMatch[1]);
      }
    }
  
    // إذا لم يتم العثور على اليوم، ارجع يومًا افتراضيًا
    return 1;
  }
  
  
  // Make functions available globally
  window.showPage = showPage;
  window.toggleAuthModal = toggleAuthModal;
  window.showLoginForm = showLoginForm;
  window.showRegisterForm = showRegisterForm;
  window.closeModal = closeModal;
  window.register = register;
  window.login = login;
  window.logout = logout;
  window.goBack = goBack;
  window.showResetConfirm = showResetConfirm;
  window.resetUserData = resetUserData;
  window.addCustomTask = addCustomTask;
  window.removeTask = removeTask;
  window.openTab = openTab;
  window.loadDayCustomCategories = loadDayCustomCategories;
  window.addCustomTaskToDay = addCustomTaskToDay;
  window.showAddCategoryModal = showAddCategoryModal;
  window.createNewCategory = createNewCategory;
  window.closeCategoryModal = closeCategoryModal;
  window.toggleCategoryContent = toggleCategoryContent;
  window.deleteCustomCategory = deleteCustomCategory;
  window.getCurrentDayFromTracker = getCurrentDayFromTracker;
