document.addEventListener('DOMContentLoaded', async function () {
    const user = checkAuth();
    if (!user) return;

    document.getElementById('userDisplay').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('logoutBtn').addEventListener('click', function () {
        api.logout();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const cohortId = urlParams.get('id');
    if (!cohortId) return;

    try {
        const [cohortResponse, modulesResponse] = await Promise.all([
            api.getCohort(cohortId),
            api.getModules(cohortId)
        ]);

        const cohort = cohortResponse.data.cohort;
        const modules = modulesResponse.data.modules;

        
        document.getElementById('cohortHeader').innerHTML = `
            <h1>${cohort.name}</h1>
            <p style="color: var(--text-secondary);">${cohort.description || ''}</p>
            <div style="display: flex; gap: 2rem; margin: 0.5rem 0 1.5rem; color: var(--text-muted); font-size: 0.9rem;">
                <span><strong>Instructor:</strong> ${cohort.instructor_name}</span>
            </div>
        `;

    
        renderModules(modules, cohortId);

        
        await loadDiscussions(cohortId);
        await loadAnnouncements(cohortId);
    } catch (error) {
        console.error('Cohort error:', error);
    }
});

function renderModules(modules, cohortId) {
    const container = document.getElementById('modulesList');
    const emptyMessage = document.getElementById('emptyModulesMessage');
    
    if (!modules || modules.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    container.innerHTML = modules.map(function (module, index) {
        const previousModule = modules[index - 1];
        const isLocked = !module.is_completed && index > 0 && !previousModule.is_completed;

        return `
            <div class="cohort-card" 
                 onclick="window.location.href='/views/module.html?id=${module.id}&cohortId=${cohortId}'" 
                 style="${isLocked ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <div class="cohort-header">
                    <h3>Module ${index + 1}: ${module.title}</h3>
                    <span class="status-badge ${module.is_completed ? 'completed' : 'active'}">
                        ${module.is_completed ? '✓ Done' : 'Pending'}
                    </span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${module.description || ''}</p>
                ${isLocked ? '<p style="color: var(--warning); font-size: 0.8rem;">🔒 Complete previous module first</p>' : ''}
            </div>
        `;
    }).join('');
}

async function loadDiscussions(cohortId) {
    const response = await api.getDiscussions(cohortId);
    const discussions = response.data.discussions || [];
    const container = document.getElementById('discussionsList');
    
    if (discussions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: var(--card); border-radius: 12px; border: 2px dashed var(--border);">
                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 0.5rem;">💬 No Discussions Yet</p>
                <p style="color: var(--text-muted); margin-bottom: 1rem;">Be the first to start a discussion!</p>
                <textarea id="newDiscTitle" placeholder="Discussion title" 
                    style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; background: var(--input); border: 1px solid var(--border); border-radius: 4px; color: var(--text);">
                </textarea>
                <textarea id="newDiscContent" placeholder="Start a discussion..." 
                    style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; background: var(--input); border: 1px solid var(--border); border-radius: 4px; min-height: 80px; color: var(--text);">
                </textarea>
                <button onclick="createDiscussion('${cohortId}')" class="btn-primary">Post Discussion</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <textarea id="newDiscTitle" placeholder="Discussion title" 
                style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; background: var(--input); border: 1px solid var(--border); border-radius: 4px; color: var(--text);">
            </textarea>
            <textarea id="newDiscContent" placeholder="Start a discussion..." 
                style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; background: var(--input); border: 1px solid var(--border); border-radius: 4px; min-height: 80px; color: var(--text);">
            </textarea>
            <button onclick="createDiscussion('${cohortId}')" class="btn-primary">Post Discussion</button>
        </div>
        ${discussions.map(function (discussion) {
            return `
                <div class="cohort-card" style="margin-bottom: 0.5rem;">
                    <strong>${discussion.title}</strong>
                    <p style="color: var(--text-secondary);">${discussion.content}</p>
                    <small style="color: var(--text-muted);">
                        By ${discussion.first_name} • ${discussion.reply_count} replies
                    </small>
                </div>
            `;
        }).join('')}
    `;
}

async function createDiscussion(cohortId) {
    const title = document.getElementById('newDiscTitle').value.trim();
    const content = document.getElementById('newDiscContent').value.trim();

    if (!title || !content) {
        alert('Please fill in both title and content.');
        return;
    }

    await api.createDiscussion(cohortId, { title: title, content: content });
    location.reload();
}

async function loadAnnouncements(cohortId) {
    const response = await api.getAnnouncements(cohortId);
    const announcements = response.data.announcements || [];
    const container = document.getElementById('announcementsList');
    
    if (announcements.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: var(--card); border-radius: 12px; border: 2px dashed var(--border);">
                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 0.5rem;">📢 No Announcements Yet</p>
                <p style="color: var(--text-muted);">Check back later for updates from your instructor.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = announcements.map(function (announcement) {
        return `
            <div class="cohort-card" style="margin-bottom: 0.5rem; border-left: 4px solid ${announcement.is_important ? 'var(--danger)' : 'var(--accent)'};">
                <strong>${announcement.title}</strong>
                <p style="color: var(--text-secondary);">${announcement.content}</p>
                <small style="color: var(--text-muted);">
                    By ${announcement.first_name} • ${new Date(announcement.created_at).toLocaleDateString()}
                </small>
            </div>
        `;
    }).join('');
}

function switchTab(tabName) {
    
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.classList.remove('active');
    });

    
    const tabBtn = document.getElementById(tabName + 'Tab');
    if (tabBtn) tabBtn.classList.add('active');

    
    const modulesList = document.getElementById('modulesList');
    const discussionsList = document.getElementById('discussionsList');
    const announcementsList = document.getElementById('announcementsList');
    
    if (modulesList) modulesList.style.display = (tabName === 'modules') ? 'grid' : 'none';
    if (discussionsList) discussionsList.style.display = (tabName === 'discussions') ? 'block' : 'none';
    if (announcementsList) announcementsList.style.display = (tabName === 'announcements') ? 'block' : 'none';
}