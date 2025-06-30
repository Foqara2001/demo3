// Admin Functions
async function loadAdminPage() {
  try {
    const user = auth.currentUser;
    if (!user) {
      showPage('home');
      return;
    }
    
    // Verify admin status
    const userData = await database.ref(`users/${user.uid}`).once('value');
    if (!userData.exists() || !userData.val().isAdmin) {
      showPage('home');
      return;
    }
    
    // Create admin page content
    const adminPage = document.getElementById('admin-page');
    if (!adminPage) return;
    
    adminPage.innerHTML = `
      <div class="admin-content">
        <h2>لوحة التحكم الإدارية</h2>
        
        <div class="admin-section">
          <h3>متابعة تقدم المستخدمين</h3>
          <div class="progress-controls">
            <select id="progress-filter" class="form-input">
              <option value="all">جميع المستخدمين</option>
              <option value="active">النشطون فقط</option>
              <option value="inactive">غير النشطين</option>
            </select>
            <button onclick="loadUserProgress()" class="primary-btn">تحديث</button>
          </div>
          <div id="user-progress-container"></div>
        </div>
        
        <div class="admin-section">
          <h3>إحصائيات عامة</h3>
          <div id="global-stats" class="stats-grid"></div>
        </div>
        
        <div class="admin-section">
          <h3>إدارة الموارد</h3>
          <div class="admin-form">
            <select id="resource-type" class="form-input">
              <option value="prayers">أذكار وأدعية</option>
              <option value="quran">تلاوات قرآنية</option>
              <option value="lessons">دروس ومحاضرات</option>
            </select>
            <input type="text" id="resource-title" placeholder="عنوان المورد" class="form-input">
            <input type="text" id="resource-url" placeholder="رابط المورد" class="form-input">
            <button onclick="addResource()" class="primary-btn">إضافة مورد</button>
            <div id="resource-message" class="message"></div>
          </div>
        </div>
        
        <div class="admin-section">
          <h3>إدارة المستخدمين</h3>
          <div class="admin-form">
            <input type="text" id="user-search" placeholder="ابحث بالاسم أو البريد" class="form-input">
            <button onclick="searchUsers()" class="primary-btn">بحث</button>
          </div>
          <div id="users-list"></div>
        </div>
        
        <div class="admin-section">
          <h3>تصدير/استيراد البيانات</h3>
          <button onclick="exportData()" class="secondary-btn">تصدير البيانات</button>
          <input type="file" id="import-file" accept=".json" style="display: none;">
          <button onclick="document.getElementById('import-file').click()" class="secondary-btn">استيراد البيانات</button>
        </div>
      </div>
    `;
    
    // Load initial data
    await loadUserProgress();
    await loadGlobalStats();
    
    // Setup event listeners
    const progressFilter = document.getElementById('progress-filter');
    if (progressFilter) {
      progressFilter.addEventListener('change', loadUserProgress);
    }
    
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
      userSearch.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') searchUsers();
      });
    }
    
    const importFile = document.getElementById('import-file');
    if (importFile) {
      importFile.addEventListener('change', importData);
    }
    
  } catch (error) {
    console.error('Error loading admin page:', error);
    showMessage('حدث خطأ في تحميل لوحة التحكم', 'error');
  }
}

async function loadUserProgress() {
    try {
        const filter = document.getElementById('progress-filter')?.value || 'all';
        const usersSnapshot = await database.ref('users').once('value');
        
        const users = usersSnapshot.val() || {};
        const container = document.getElementById('user-progress-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="progress-header">
                <span>المستخدم</span>
                <span>الأيام المكتملة</span>
                <span>الصلوات</span>
                <span>آخر نشاط</span>
                <span>التفاصيل</span>
            </div>
        `;
        
        for (const [uid, user] of Object.entries(users)) {
            if (user.isAdmin) continue;
            
            let userCompletedDays = 0;
            let userTotalPrayers = 0;
            let lastActiveDate = 'غير نشط';
            
            // حساب الإحصائيات عبر جميع الأشهر
            const trackerSnap = await database.ref(`users/${uid}/tracker`).once('value');
            const trackerData = trackerSnap.val() || {};
            
            for (const year in trackerData) {
                for (const month in trackerData[year]) {
                    const days = trackerData[year][month];
                    
                    for (const dayKey in days) {
                        const dayData = days[dayKey];
                        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
                        
                        // حساب الصلوات
                        const dayPrayers = prayers.filter(p => dayData[p]).length;
                        userTotalPrayers += dayPrayers;
                        
                        // حساب الأيام المكتملة
                        if (prayers.every(p => dayData[p])) {
                            userCompletedDays++;
                            
                            // تحديث آخر تاريخ نشاط
                            const activityDate = new Date(year, month, dayKey.replace('day', ''));
                            lastActiveDate = activityDate.toLocaleDateString('ar-EG');
                        }
                    }
                }
            }
            
            // تطبيق الفلاتر
            if (filter === 'active' && userCompletedDays === 0) continue;
            if (filter === 'inactive' && userCompletedDays > 0) continue;
            
            const progressRow = document.createElement('div');
            progressRow.className = 'progress-row';
            progressRow.innerHTML = `
                <span>${user.username || user.email}</span>
                <span>${userCompletedDays}</span>
                <span>${userTotalPrayers}</span>
                <span>${lastActiveDate}</span>
                <button onclick="viewUserDetails('${uid}')" class="details-btn">عرض</button>
            `;
            container.appendChild(progressRow);
        }
        
    } catch (error) {
        console.error('Error loading user progress:', error);
        showMessage('حدث خطأ في تحميل تقدم المستخدمين', 'error');
    }
}

async function loadGlobalStats() {
    try {
        const usersSnapshot = await database.ref('users').once('value');
        const users = usersSnapshot.val() || {};
        
        let stats = {
            totalUsers: 0,
            activeUsers: 0,
            totalPrayers: 0,
            totalCompletedDays: 0,
            monthlyTrend: []
        };
        
        // حساب إحصائيات جميع المستخدمين
        for (const [uid, user] of Object.entries(users)) {
            if (user.isAdmin) continue;
            
            stats.totalUsers++;
            let isActive = false;
            
            const trackerSnap = await database.ref(`users/${uid}/tracker`).once('value');
            const trackerData = trackerSnap.val() || {};
            
            // حساب الإحصائيات لكل شهر
            for (const year in trackerData) {
                for (const month in trackerData[year]) {
                    const monthKey = `${year}-${month.padStart(2, '0')}`;
                    let monthStats = stats.monthlyTrend.find(m => m.month === monthKey);
                    
                    if (!monthStats) {
                        monthStats = {
                            month: monthKey,
                            name: new Date(year, month, 1).toLocaleString('ar-EG', {month: 'long', year: 'numeric'}),
                            prayers: 0,
                            completedDays: 0,
                            users: 0
                        };
                        stats.monthlyTrend.push(monthStats);
                    }
                    
                    const days = trackerData[year][month];
                    let hasActivity = false;
                    
                    for (const day in days) {
                        const dayData = days[day];
                        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
                        const dayPrayers = prayers.filter(p => dayData[p]).length;
                        
                        stats.totalPrayers += dayPrayers;
                        monthStats.prayers += dayPrayers;
                        
                        if (dayPrayers > 0) hasActivity = true;
                        if (prayers.every(p => dayData[p])) {
                            stats.totalCompletedDays++;
                            monthStats.completedDays++;
                        }
                    }
                    
                    if (hasActivity) {
                        monthStats.users++;
                        isActive = true;
                    }
                }
            }
            
            if (isActive) stats.activeUsers++;
        }
        
        // ترتيب الأشهر وتحديد آخر 6 أشهر
        stats.monthlyTrend.sort((a, b) => b.month.localeCompare(a.month));
        const recentMonths = stats.monthlyTrend.slice(0, 6);
        
        // عرض الإحصائيات
        const globalStats = document.getElementById('global-stats');
        if (globalStats) {
            globalStats.innerHTML = `
                <div class="stat-card">
                    <h4>إجمالي المستخدمين</h4>
                    <p>${stats.totalUsers}</p>
                </div>
                <div class="stat-card">
                    <h4>المستخدمون النشطون</h4>
                    <p>${stats.activeUsers}</p>
                </div>
                <div class="stat-card">
                    <h4>إجمالي الأيام المكتملة</h4>
                    <p>${stats.totalCompletedDays}</p>
                </div>
                <div class="stat-card">
                    <h4>إجمالي الصلوات</h4>
                    <p>${stats.totalPrayers}</p>
                </div>
                <div class="stat-card chart-container">
                    <h4>اتجاه الصلوات</h4>
                    <div class="stats-chart">
                        ${recentMonths.map(m => `
                            <div class="chart-bar" style="height: ${Math.min(100, m.prayers / 100)}%">
                                <span>${m.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading global stats:', error);
        showMessage('حدث خطأ في تحميل الإحصائيات العامة', 'error');
    }
}

async function searchUsers() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');
    
    // التحقق من صلاحيات المشرف
    const adminSnapshot = await database.ref(`users/${user.uid}/isAdmin`).once('value');
    if (!adminSnapshot.exists() || !adminSnapshot.val()) {
      throw new Error('ليس لديك صلاحيات المشرف');
    }

    const query = document.getElementById('user-search').value.toLowerCase();
    if (!query) return;
    
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    const container = document.getElementById('users-list');
    
    container.innerHTML = '';
    
    for (const [uid, userData] of Object.entries(users)) {
      if (userData.isAdmin) continue; // تخطي المشرفين الآخرين
      
      const username = userData.username?.toLowerCase() || '';
      const email = userData.email?.toLowerCase() || '';
      
      if (username.includes(query) || email.includes(query)) {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
          <div class="user-info">
            <h4>${userData.username || userData.email}</h4>
            <p>${userData.email} - ${userData.joinDate || 'غير معروف'}</p>
          </div>
          <button onclick="viewUserDetails('${uid}')" class="primary-btn">التفاصيل</button>
        `;
        container.appendChild(userCard);
      }
    }
    
  } catch (error) {
    console.error('Error searching users:', error);
    showMessage(`حدث خطأ: ${error.message}`, 'error');
  }
}

async function viewUserDetails(userId) {
    try {
        const [userData, trackerData] = await Promise.all([
            database.ref(`users/${userId}`).once('value'),
            database.ref(`users/${userId}/tracker`).once('value')
        ]);
        
        const user = userData.val();
        const tracker = trackerData.val() || {};
        
        // إنشاء محتوى تفاصيل المستخدم
        let calendarContent = '';
        let monthlyStats = '';
        
        // تنظيم البيانات حسب الأشهر
        const monthsData = [];
        for (const year in tracker) {
            for (const month in tracker[year]) {
                const monthKey = `${year}-${month.padStart(2, '0')}`;
                monthsData.push({
                    year,
                    month,
                    days: tracker[year][month],
                    monthKey
                });
            }
        }
        
        // ترتيب الأشهر من الأحدث للأقدم
        monthsData.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
        
        // عرض إحصائيات شهرية
        monthlyStats = '<div class="monthly-stats-container">';
        monthsData.slice(0, 6).forEach(({year, month, days}) => {
            const monthName = new Date(year, month, 1).toLocaleString('ar-EG', {month: 'long'});
            let completedDays = 0;
            let totalPrayers = 0;
            
            for (const day in days) {
                const dayData = days[day];
                const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
                totalPrayers += prayers.filter(p => dayData[p]).length;
                if (prayers.every(p => dayData[p])) completedDays++;
            }
            
            monthlyStats += `
                <div class="month-stat-card">
                    <h4>${monthName} ${year}</h4>
                    <p>الأيام المكتملة: ${completedDays}</p>
                    <p>إجمالي الصلوات: ${totalPrayers}</p>
                </div>
            `;
        });
        monthlyStats += '</div>';
        
        // إنشاء تقويم آخر شهر نشط
        if (monthsData.length > 0) {
            const lastActive = monthsData[0];
            const daysInMonth = new Date(lastActive.year, lastActive.month, 0).getDate();
            
            calendarContent = '<div class="user-calendar-grid">';
            for (let day = 1; day <= daysInMonth; day++) {
                const dayKey = `day${day}`;
                const dayData = lastActive.days[dayKey] || {};
                const isComplete = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].every(p => dayData[p]);
                
                calendarContent += `
                    <div class="user-calendar-day ${isComplete ? 'completed' : ''}">
                        ${day}
                    </div>
                `;
            }
            calendarContent += '</div>';
        }
        
        // عرض النافذة
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="user-details-modal">
                <div class="modal-header">
                    <h2>تفاصيل المستخدم</h2>
                    <button class="close-modal-btn" onclick="closeModal()">&times;</button>
                </div>
                
                <div class="user-profile">
                    <div class="avatar">${(user.username || user.email).charAt(0).toUpperCase()}</div>
                    <div>
                        <h3>${user.username || user.email}</h3>
                        <p>${user.email}</p>
                        <p>تاريخ التسجيل: ${user.joinDate || 'غير معروف'}</p>
                    </div>
                </div>
                
                <div class="user-stats-section">
                    <h3>إحصائيات الشهور الأخيرة</h3>
                    ${monthlyStats}
                </div>
                
                <div class="user-calendar-section">
                    <h3>آخر شهر نشط</h3>
                    ${calendarContent || '<p>لا يوجد بيانات متاحة</p>'}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error viewing user details:', error);
        showMessage('حدث خطأ في تحميل تفاصيل المستخدم', 'error');
    }
}

async function addResource() {
  const type = document.getElementById('resource-type').value;
  const title = document.getElementById('resource-title').value.trim();
  const url = document.getElementById('resource-url').value.trim();
  const messageEl = document.getElementById('resource-message');

  if (!title || !url) return showMessage('الرجاء إدخال العنوان والرابط', 'error', messageEl);
  if (!isValidUrl(url)) return showMessage('الرجاء إدخال رابط صحيح', 'error', messageEl);

  try {
    const newResourceRef = database.ref(`resources/${type}`).push();
    await newResourceRef.set({
      title,
      url,
      createdAt: new Date().toISOString(),
      addedBy: auth.currentUser.uid
    });
    
    showMessage('تمت إضافة المورد بنجاح', 'success', messageEl);
    document.getElementById('resource-title').value = '';
    document.getElementById('resource-url').value = '';
    
  } catch (error) {
    console.error('Error adding resource:', error);
    showMessage('حدث خطأ أثناء إضافة المورد', 'error', messageEl);
  }
}

async function exportData() {
  try {
    const [users, resources, customTasks] = await Promise.all([
      database.ref('users').once('value').then(s => s.val()),
      database.ref('resources').once('value').then(s => s.val()),
      getAllCustomTasks()
    ]);
    
    // Get all user tracker data
    const tracker = {};
    const usersSnapshot = await database.ref('users').once('value');
    for (const uid in usersSnapshot.val()) {
      const trackerSnap = await database.ref(`users/${uid}/tracker`).once('value');
      tracker[uid] = trackerSnap.val() || {};
    }
    
    const data = {
      users,
      tracker,
      resources,
      customTasks,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ramadan-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    showMessage('تم تصدير البيانات بنجاح', 'success');
    
  } catch (error) {
    console.error('Error exporting data:', error);
    showMessage('حدث خطأ أثناء تصدير البيانات', 'error');
  }
}

async function getAllCustomTasks() {
  try {
    const snapshot = await database.ref('users').once('value');
    const users = snapshot.val() || {};
    const allTasks = {};
    
    for (const userId in users) {
      const tasksSnap = await database.ref(`users/${userId}/customTasks`).once('value');
      if (tasksSnap.exists()) {
        allTasks[userId] = tasksSnap.val();
      }
    }
    
    return allTasks;
  } catch (error) {
    console.error('Error getting all custom tasks:', error);
    return {};
  }
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const data = JSON.parse(await file.text());
    
    if (!data.users || !data.tracker || !data.resources) {
      throw new Error('هيكلة الملف غير صالحة');
    }
    
    // Import users
    await database.ref('users').set(data.users || {});
    
    // Import tracker data for each user
    for (const userId in data.tracker) {
      await database.ref(`users/${userId}/tracker`).set(data.tracker[userId] || {});
    }
    
    // Import resources
    await database.ref('resources').set(data.resources || {});
    
    // Import custom tasks
    if (data.customTasks) {
      for (const userId in data.customTasks) {
        await database.ref(`users/${userId}/customTasks`).set(data.customTasks[userId]);
      }
    }
    
    showMessage('تم استيراد البيانات بنجاح', 'success');
    setTimeout(() => location.reload(), 1000);
    
  } catch (error) {
    console.error('Error importing data:', error);
    showMessage(`حدث خطأ أثناء الاستيراد: ${error.message}`, 'error');
  } finally {
    event.target.value = '';
  }
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300); // إعطاء وقت لانتهاء الانتقال قبل الإزالة
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function showMessage(text, type, element = null) {
  const target = element || document.getElementById('resource-message');
  if (!target) return;
  
  target.textContent = text;
  target.className = `message ${type}`;
  setTimeout(() => target.textContent = '', 3000);
}

// Make functions available globally
window.loadAdminPage = loadAdminPage;
window.loadUserProgress = loadUserProgress;
window.searchUsers = searchUsers;
window.viewUserDetails = viewUserDetails;
window.addResource = addResource;
window.exportData = exportData;
window.importData = importData;
window.closeModal = closeModal;
