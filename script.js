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
  // Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
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
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // عرض التقويم الحالي
  generateCalendar(currentYear, currentMonth);
  
  
  // فتح متابعة اليوم الحالي (اختياري)
   openTracker(currentYear, currentMonth, currentDay);
}
    
    // 12. تهيئة أزرار التنقل بين الأشهر
    setupMonthNavigation();
      console.log('Application initialized successfully');
      
    } catch (error) {
      console.error('Error initializing app:', error);
      showMessage('حدث خطأ في تهيئة التطبيق', 'error');
    }

  }
  
  // Make sure DOM is loaded before initializing
 document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  
});

  
  // Handle scroll for navbar effect
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  // أسماء الأشهر بالعربية
const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

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
        
        // Special page handling
        if (pageId === 'tracker') {
            // Ensure current month and year are set
            currentYear = new Date().getFullYear();
            currentMonth = new Date().getMonth();
            
            // Generate calendar with current month
            generateCalendar(currentYear, currentMonth);
            
            // Update month/year title
            updateMonthYearTitle();
            
            // Setup navigation controls
           
            
        } else if (pageId === 'profile') {
            loadProfilePage();
        } else if (pageId === 'resources') {
            loadResources();
        } else if (pageId === 'admin') {
            loadAdminPage();
        }
    }
}

// Helper function to update month/year title
function updateMonthYearTitle() {
    const monthYearElement = document.getElementById('current-month-year');
    if (monthYearElement) {
        monthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
}
  
  // Calendar and Tracker Functions
  function generateCalendar(year, month) {
    if (!calendar) return;
    
    calendar.innerHTML = '';
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = new Date().getDate();
    
    // إضافة عنوان الشهر
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
                      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const monthHeader = document.createElement('div');
    monthHeader.className = 'month-header';
    monthHeader.innerHTML = `
      
    `;
    calendar.appendChild(monthHeader);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.setAttribute("data-day", day);
        dayElement.setAttribute("data-month", month);
        dayElement.setAttribute("data-year", year);
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="day-label">اليوم</div>
        `;
        
        if (day === currentDay && new Date().getMonth() === month && new Date().getFullYear() === year) {
            dayElement.classList.add("current-day");
        }
        
        dayElement.addEventListener('click', () => {
    const year = parseInt(dayElement.getAttribute('data-year'));
    const month = parseInt(dayElement.getAttribute('data-month'));
    const day = parseInt(dayElement.getAttribute('data-day'));
    openTracker(year, month, day);
});
        calendar.appendChild(dayElement);
        
        updateDayStyle(dayElement, year, month, day);
    }
} 
  
  function getCurrentRamadanDay() {
    return 10; // Example day
  }
  
  async function loadBasicTasks(year, month, day) {
    const user = auth.currentUser;
    if (!user) return;

    const tasksSnapshot = await database.ref(`users/${user.uid}/basicTasks`).once('value');
    const basicTasks = tasksSnapshot.val() || {};
    
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
  
  async function loadSavedTasks(year, month, day) {
    const user = auth.currentUser;
    if (!user) return;

    const snapshot = await database.ref(`users/${user.uid}/tracker/${year}/${month}/day${day}`).once('value');
    const dayData = snapshot.val() || {};
    
    document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        const taskId = checkbox.getAttribute("data-task");
        checkbox.checked = dayData[taskId] || false;
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
        
        // مسح المحتوى الحالي مع الاحتفاظ بزر الإضافة فقط
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
        
        // إضافة زر "إضافة فئة" إذا لم يكن موجوداً
        const addCategoryBtn = document.createElement('button');
        addCategoryBtn.className = 'add-category-btn';
        addCategoryBtn.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة فئة جديدة';
        addCategoryBtn.onclick = () => showAddCategoryModal(day);
        container.appendChild(addCategoryBtn);
        
    } catch (error) {
        console.error('Error loading custom categories:', error);
        showMessage('حدث خطأ في تحميل الفئات المخصصة', 'error');
    }
}
  
  
async function openTracker(year, month, day) {
    const user = auth.currentUser;
    if (!user) {
        alert('الرجاء تسجيل الدخول لتسجيل متابعتك');
        toggleAuthModal();
        return;
    }

    // إعداد واجهة التحميل المؤقت
    trackerContent.innerHTML = `
        <div class="loading-overlay">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>جاري تحميل بيانات اليوم...</p>
            </div>
        </div>
    `;

    // إظهار نافذة المتابعة فوراً
    trackerContainer.style.display = "block";
    trackerTitle.innerText = `المتابعة اليومية - اليوم ${day} - ${monthNames[month]} ${year}`;

    try {
        // تحميل البيانات المتوازي
        const [dayDataSnapshot, customTasksSnapshot, basicTasksSnapshot] = await Promise.all([
            database.ref(`users/${user.uid}/tracker/${year}/${month}/day${day}`).once('value'),
            database.ref(`users/${user.uid}/customTasks`).once('value'),
            database.ref(`users/${user.uid}/basicTasks`).once('value')
        ]);

        // تحميل القالب بعد جلب البيانات
        const template = document.getElementById("template-content");
        trackerContent.innerHTML = template.innerHTML;
        await loadDayCustomCategories(day);
        // معالجة البيانات
        const dayData = dayDataSnapshot.val() || {};
        const customTasks = customTasksSnapshot.val() || {};
        const basicTasks = basicTasksSnapshot.val() || {};

        // تحديث جميع المهام
        updateAllTasks(dayData, customTasks, basicTasks, year, month, day);

        // إعداد مستمعات الأحداث
        setupEventListeners(year, month, day);

        // تحديث التقدم والنمط
        updateDayProgressBar(year, month, day);
        updateCurrentDayStyle(year, month, day);

    } catch (error) {
        console.error('Error loading tracker data:', error);
        trackerContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>حدث خطأ في تحميل البيانات</p>
                <button onclick="openTracker(${year}, ${month}, ${day})" class="retry-btn">
                    <i class="fas fa-redo"></i> إعادة المحاولة
                </button>
            </div>
        `;
    }
}

// الدوال المساعدة
function updateAllTasks(dayData, customTasks, basicTasks, year, month, day) {
    // تحديث الصلوات الأساسية
    ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
        const checkbox = document.querySelector(`input[data-task="${prayer}"]`);
        if (checkbox) {
            checkbox.checked = dayData[prayer] || false;
            checkbox.setAttribute('data-year', year);
            checkbox.setAttribute('data-month', month);
            checkbox.setAttribute('data-day', day);
        }
    });

    // تحديث المهام الأساسية
    Object.entries(basicTasks).forEach(([taskId, task]) => {
        const checkbox = document.querySelector(`input[data-task="${taskId}"]`);
        if (checkbox) {
            checkbox.checked = dayData[taskId] || false;
            checkbox.setAttribute('data-year', year);
            checkbox.setAttribute('data-month', month);
            checkbox.setAttribute('data-day', day);
        }
    });

    // تحديث المهام المخصصة
    Object.entries(customTasks).forEach(([taskId, task]) => {
        const group = document.getElementById(`${task.section}-group`);
        if (group) {
            const existingTask = group.querySelector(`input[data-task="${taskId}"]`);
            if (!existingTask) {
                const taskElement = document.createElement('div');
                taskElement.className = 'custom-task-container';
                taskElement.innerHTML = `
                    <div class="task-content">
                        <label class="checkbox-item">
                            <span>${task.name}</span>
                            <input type="checkbox" data-task="${taskId}" 
                                   data-year="${year}" data-month="${month}" data-day="${day}">
                        </label>
                    </div>
                    <button class="delete-task-btn" onclick="removeTask(this, '${taskId}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                group.appendChild(taskElement);
            }
            const checkbox = group.querySelector(`input[data-task="${taskId}"]`);
            if (checkbox) checkbox.checked = dayData[taskId] || false;
        }
    });
}

function setupEventListeners(year, month, day) {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.onchange = async function() {
            this.disabled = true;
            await saveTaskState(
                parseInt(this.getAttribute('data-year')),
                parseInt(this.getAttribute('data-month')), 
                parseInt(this.getAttribute('data-day')),
                this
            );
            this.disabled = false;
        };
    });
}

function updateCurrentDayStyle(year, month, day) {
    const dayElement = document.querySelector(`.day[data-day="${day}"][data-month="${month}"][data-year="${year}"]`);
    if (dayElement) updateDayStyle(dayElement, year, month, day);
}

function updateCheckboxes(dayData, customTasks) {
    // الصلوات الأساسية
    ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
        const checkbox = document.querySelector(`input[data-task="${prayer}"]`);
        if (checkbox) checkbox.checked = dayData[prayer] || false;
    });

    // المهام المخصصة
    Object.keys(customTasks).forEach(taskId => {
        const checkbox = document.querySelector(`input[data-task="${taskId}"]`);
        if (checkbox) checkbox.checked = dayData[taskId] || false;
    });
}
 // مثال على تعديل دالة حفظ المهمة
async function saveTaskState(year, month, day, checkbox) {
    const user = auth.currentUser;
    if (!user) return;

    const taskId = checkbox.dataset.task;
    const isChecked = checkbox.checked;

    // حفظ الحالة فوراً بدون تأخير
    await database.ref(`users/${user.uid}/tracker/${year}/${month}/day${day}/${taskId}`).set(isChecked);

    // تحديث واجهة المستخدم مباشرة
    const dayElement = document.querySelector(`.day[data-day="${day}"][data-month="${month}"][data-year="${year}"]`);
    if (dayElement) {
        updateDayStyle(dayElement, year, month, day);
    }
    updateDayProgressBar(year, month, day);
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
 async function updateDayProgressBar(year, month, day) {
    const user = auth.currentUser;
    if (!user || !dayProgressBar) return;
    
    const checkboxes = document.querySelectorAll(`#tracker-container input[type="checkbox"]`);
    const totalTasks = checkboxes.length;
    
    if (totalTasks === 0) {
        dayProgressBar.style.width = '0%';
        document.querySelector('.progress-text').textContent = '0% مكتمل (لا توجد مهام)';
        return;
    }

    let completedTasks = 0;
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) completedTasks++;
    });

    const progress = Math.round((completedTasks / totalTasks) * 100);
    dayProgressBar.style.width = `${progress}%`;
    
    document.querySelector('.progress-text').textContent = 
        `${progress}% مكتمل (${completedTasks}/${totalTasks} مهام)`;
}
 async function updateDayStyle(dayElement, year, month, day) {
    const user = auth.currentUser;
    if (!user || !dayElement) return;

    // جلب بيانات اليوم
    const snapshot = await database.ref(`users/${user.uid}/tracker/${year}/${month}/day${day}`).once('value');
    const dayData = snapshot.val() || {};

    // حساب المهام الكلية والمكتملة
    const allTasks = [...['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'], ...Object.keys(dayData).filter(k => k.startsWith('custom_'))];
    const completedTasks = allTasks.filter(task => dayData[task]);
    const completionPercentage = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

    // إزالة جميع classes السابقة
    dayElement.classList.remove(
        'no-progress',
        'low-progress',
        'medium-progress',
        'high-progress',
        'complete-day'
    );

    // تحديد لون البطاقة حسب نسبة الإنجاز
    if (completionPercentage === 0) {
        dayElement.classList.add('no-progress');
    } else if (completionPercentage < 30) {
        dayElement.classList.add('low-progress');
    } else if (completionPercentage < 70) {
        dayElement.classList.add('medium-progress');
    } else if (completionPercentage < 100) {
        dayElement.classList.add('high-progress');
    } else {
        dayElement.classList.add('complete-day');
    }

    // إضافة title لتوضيح النسبة عند التحويم
    dayElement.title = `إنجاز ${Math.round(completionPercentage)}% (${completedTasks.length}/${allTasks.length} مهمة)`;
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
  let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function setupMonthNavigation() {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthYear = document.getElementById('current-month-year');

    if (!prevMonthBtn || !nextMonthBtn || !currentMonthYear) return;

    // تحديث عنوان الشهر والسنة
    function updateMonthYearTitle() {
        currentMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // حدث زر الشهر السابق
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentYear, currentMonth);
        updateMonthYearTitle();
    });

    // حدث زر الشهر التالي
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth);
        updateMonthYearTitle();
    });

    // التحميل الأولي
    updateMonthYearTitle();
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
    // 1. إعداد واجهة التحميل
    const loadingOverlay = document.getElementById('profile-loading-overlay');
    const progressBar = loadingOverlay.querySelector('.progress-bar');
    const loadingText = loadingOverlay.querySelector('.loading-text');
    
    try {
        // 2. إظهار شاشة التحميل
        loadingOverlay.style.display = 'flex';
        loadingText.textContent = 'جاري تحميل بيانات الملف...';
        progressBar.style.width = '10%';

        // 3. التحقق من تسجيل الدخول
        const user = auth.currentUser;
        if (!user) {
            showPage('home');
            return;
        }

        // 4. تحميل البيانات مع تحديث التقدم
        progressBar.style.width = '30%';
        loadingText.textContent = 'جاري جلب المعلومات الأساسية...';
        
        const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
        const userData = userSnapshot.val() || {};
        
        progressBar.style.width = '50%';
        loadingText.textContent = 'جاري حساب الإحصائيات...';
        
        const stats = await calculateUserStats(user.uid);
        
        progressBar.style.width = '80%';
        loadingText.textContent = 'جاري تحضير العرض...';

        // 5. تعبئة البيانات
        document.getElementById('profile-username').textContent = userData.username || user.email;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-join-date').textContent = userData.joinDate || 'غير معروف';
        
        // تحديث الصورة الرمزية
        const avatar = document.getElementById('profile-avatar-large');
        if (avatar) {
            avatar.textContent = (userData.username || user.email).charAt(0).toUpperCase();
        }

        // عرض الإحصائيات
        document.getElementById('completed-days').textContent = `${stats.perfectDays} يوم`;
        document.getElementById('full-prayer-days').textContent = `${stats.fullPrayerDays} يوم`;
        document.getElementById('completion-rate').textContent = `${stats.completionRate}%`;

        // توليد التقويم
        progressBar.style.width = '90%';
        loadingText.textContent = 'جاري تحميل التقويم...';
        await generateProfileCalendar(user.uid);

        // 6. إخفاء شاشة التحميل بسلاسة
        progressBar.style.width = '100%';
        loadingText.textContent = 'تم التحميل بنجاح!';
        
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                loadingOverlay.style.opacity = '1';
                progressBar.style.width = '0%';
            }, 500);
        }, 1000);

    } catch (error) {
        // 7. معالجة الأخطاء
        console.error('خطأ في تحميل الصفحة:', error);
        
        loadingOverlay.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>حدث خطأ في التحميل</h3>
                <p>${error.message || 'تعذر تحميل البيانات'}</p>
                <button onclick="loadProfilePage()" class="retry-btn">
                    <i class="fas fa-sync-alt"></i> إعادة المحاولة
                </button>
            </div>
        `;
    }
}

async function calculateUserStats(userId) {
    try {
        const [trackerSnapshot, customTasksSnapshot] = await Promise.all([
            database.ref(`users/${userId}/tracker`).once('value'),
            database.ref(`users/${userId}/customTasks`).once('value')
        ]);

        const trackerData = trackerSnapshot.val() || {};
        const customTasks = customTasksSnapshot.val() || {};
        
        let stats = {
            perfectDays: 0,          // أيام إنجاز 100% (كل المهام)
            fullPrayerDays: 0,       // أيام صلاة كاملة
            completionRate: 0,
            totalTrackedDays: 0,
            totalTasksCompleted: 0,
            totalPossibleTasks: 0
        };

        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const customTaskIds = Object.keys(customTasks);

        // حساب الإحصائيات لجميع الأشهر
        for (const year in trackerData) {
            for (const month in trackerData[year]) {
                const days = trackerData[year][month];
                
                for (const dayKey in days) {
                    const dayData = days[dayKey];
                    stats.totalTrackedDays++;
                    
                    let allTasksCompleted = true;
                    let allPrayersCompleted = true;
                    let dayTasksCompleted = 0;
                    let dayTotalTasks = prayers.length + customTaskIds.length;

                    // حساب الصلوات
                    prayers.forEach(prayer => {
                        if (dayData[prayer]) {
                            dayTasksCompleted++;
                            stats.totalTasksCompleted++;
                        } else {
                            allPrayersCompleted = false;
                            allTasksCompleted = false;
                        }
                    });

                    // حساب المهام المخصصة
                    customTaskIds.forEach(taskId => {
                        if (dayData[taskId]) {
                            dayTasksCompleted++;
                            stats.totalTasksCompleted++;
                        } else {
                            allTasksCompleted = false;
                        }
                    });

                    // تحديث الإحصائيات
                    if (allTasksCompleted) {
                        stats.perfectDays++;
                    }
                    if (allPrayersCompleted) {
                        stats.fullPrayerDays++;
                    }
                    
                    stats.totalPossibleTasks += dayTotalTasks;
                }
            }
        }

        // حساب نسبة الإنجاز الكلية
        if (stats.totalPossibleTasks > 0) {
            stats.completionRate = Math.round((stats.totalTasksCompleted / stats.totalPossibleTasks) * 100);
        }
        
        return stats;
    } catch (error) {
        console.error('Error calculating user stats:', error);
        return {
            perfectDays: 0,
            fullPrayerDays: 0,
            completionRate: 0,
            totalTrackedDays: 0,
            totalTasksCompleted: 0,
            totalPossibleTasks: 0
        };
    }
}
  
async function generateProfileCalendar(userId) {
    const calendarContainer = document.getElementById('profile-calendar');
    if (!calendarContainer) return;

    // إنشاء عناصر التحكم بالشهر والسنة
    calendarContainer.innerHTML = `
        <div class="profile-calendar-controls">
            <select id="profile-month-select" class="form-input">
                ${[...Array(12).keys()].map(m => 
                    `<option value="${m}" ${m === new Date().getMonth() ? 'selected' : ''}>
                        ${monthNames[m]}
                    </option>`
                ).join('')}
            </select>
            <select id="profile-year-select" class="form-input">
                ${[...Array(5).keys()].map(i => {
                    const year = new Date().getFullYear() - 2 + i;
                    return `<option value="${year}" ${year === new Date().getFullYear() ? 'selected' : ''}>
                        ${year}
                    </option>`;
                }).join('')}
            </select>
        </div>
        <div class="profile-calendar-grid"></div>
    `;

    // تحميل البيانات الأولية
    await loadAndDisplayProfileMonth(userId, new Date().getFullYear(), new Date().getMonth());

    // إضافة مستمعات الأحداث
    document.getElementById('profile-month-select').addEventListener('change', async () => {
        const year = parseInt(document.getElementById('profile-year-select').value);
        const month = parseInt(document.getElementById('profile-month-select').value);
        await loadAndDisplayProfileMonth(userId, year, month);
    });

    document.getElementById('profile-year-select').addEventListener('change', async () => {
        const year = parseInt(document.getElementById('profile-year-select').value);
        const month = parseInt(document.getElementById('profile-month-select').value);
        await loadAndDisplayProfileMonth(userId, year, month);
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
  
    // إعادة تعيين الحقول والرسائل
    document.getElementById('category-name').value = '';
    document.getElementById('category-message').style.display = 'none';
    
    // إزالة أي مستمع أحداث سابق
    const createBtn = document.getElementById('create-category-btn');
    createBtn.onclick = null; // إزالة جميع المستمعات السابقة
    
    // إضافة مستمع الأحداث الجديد
    createBtn.onclick = function() {
      createNewCategory(day);
    };
  
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
    
    // تعطيل الزر أثناء المعالجة لمنع النقرات المتعددة
    const createBtn = document.getElementById('create-category-btn');
    createBtn.disabled = true;
    createBtn.textContent = 'جاري الإنشاء...';
    
    try {
        const categoryId = `cat_${Date.now()}`;
        await database.ref(`users/${user.uid}/dayCategories/${day}/${categoryId}`).set({
            name,
            icon,
            createdAt: new Date().toISOString()
        });
        
        showMessage('تم إنشاء الفئة بنجاح', 'success', messageEl);
        
        // إغلاق النافذة بعد تأخير بسيط
        setTimeout(() => {
            closeCategoryModal();
        }, 1000);
        
        // إعادة تحميل الفئات
        await loadDayCustomCategories(day);
        
    } catch (error) {
        console.error('Error creating category:', error);
        showMessage('حدث خطأ أثناء إنشاء الفئة', 'error', messageEl);
    } finally {
        // إعادة تمكين الزر
        createBtn.disabled = false;
        createBtn.textContent = 'إنشاء الفئة';
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
  function showAddCategoryModal(day) {
    const modal = document.getElementById('category-modal');
    if (!modal) return;
    
    // إعادة تعيين الحقول والرسائل
    document.getElementById('category-name').value = '';
    document.getElementById('category-message').textContent = '';
    document.getElementById('category-message').className = 'message';
    document.getElementById('category-message').style.display = 'none';
    
    // إزالة أي مستمع أحداث سابق لمنع التكرار
    const createBtn = document.getElementById('create-category-btn');
    createBtn.replaceWith(createBtn.cloneNode(true)); // هذا يزيل جميع المستمعات السابقة
    
    // الحصول على الزر الجديد بعد الاستبدال
    const newCreateBtn = document.getElementById('create-category-btn');
    
    // إضافة مستمع الأحداث الجديد مرة واحدة فقط
    newCreateBtn.onclick = async () => {
        await createNewCategory(day);
    };
    
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
  
      // إعادة تحميل الفئات بعد الحذف
      await loadDayCustomCategories(day);
  
      showMessage("تم حذف الفئة بنجاح", "success");
    } catch (error) {
      console.error("خطأ أثناء الحذف:", error);
      showMessage("حدث خطأ أثناء حذف الفئة", "error");
    }
  }
  function getCurrentDayFromTracker() {
    const trackerTitle = document.getElementById('tracker-title');
    if (trackerTitle) {
        const match = trackerTitle.textContent.match(/اليوم (\d+)/);
        if (match && match[1]) {
            return parseInt(match[1]);
        }
    }
    return new Date().getDate(); // افتراضيًا يرجع اليوم الحالي
}
  async function loadAndDisplayProfileMonth(userId, year, month) {
    try {
        const calendarGrid = document.querySelector('.profile-calendar-grid');
        if (!calendarGrid) return;

        // جلب بيانات المستخدم لهذا الشهر
        const snapshot = await database.ref(`users/${userId}/tracker/${year}/${month}`).once('value');
        const monthData = snapshot.val() || {};

        // إنشاء تقويم الملف الشخصي
        calendarGrid.innerHTML = '';
        
        // الحصول على عدد أيام الشهر
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // الحصول على يوم الأسبوع الأول من الشهر (0-6 حيث 0 هو الأحد)
        const firstDayOfWeek = new Date(year, month, 1).getDay();
        
        // إضافة أيام فارغة لبدء التقويم من اليوم الصحيح
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'profile-calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayKey = `day${day}`;
            const dayData = monthData[dayKey] || {};
            
            // حساب نسبة الإنجاز لهذا اليوم
            const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
            const completedPrayers = prayers.filter(p => dayData[p]).length;
            const progress = (completedPrayers / prayers.length) * 100;
            
            const dayElement = document.createElement('div');
            dayElement.className = 'profile-calendar-day';
            dayElement.innerHTML = day;
            
            // تحديد حالة اليوم
            if (progress === 100) {
                dayElement.classList.add('completed');
            } else if (progress >= 50) {
                dayElement.classList.add('partial');
            } else if (progress > 0) {
                dayElement.classList.add('some-progress');
            }
            
            // إضافة عنوان يظهر عند التحويم
            dayElement.title = `اليوم ${day}: ${progress.toFixed(0)}% مكتمل`;
            
            calendarGrid.appendChild(dayElement);
        }
    } catch (error) {
        console.error('Error loading profile month:', error);
        showMessage('حدث خطأ في تحميل بيانات الشهر', 'error');
    }
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
