document.addEventListener('DOMContentLoaded', async function () {
    const user = checkAuth();
    if (!user) return;

    document.getElementById('userDisplay').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('logoutBtn').addEventListener('click', function () {
        api.logout();
    });

    try {
        const response = await api.getProfile();
        const profile = response.data.user;

        
        const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

        document.getElementById('profileContent').innerHTML = `
            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--accent-light); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent); font-weight: 600; flex-shrink: 0;">
                    ${initials}
                </div>
                <div>
                    <h2 style="margin-bottom: 0.25rem;">${profile.firstName} ${profile.lastName}</h2>
                    <p style="color: var(--text-secondary);">${profile.email} • ${profile.role}</p>
                </div>
            </div>
            
            <form id="profileForm">
                <div class="form-group">
                    <label for="bio">Bio</label>
                    <textarea id="bio" style="min-height: 80px; width: 100%; padding: 0.6rem; background: var(--input); border: 1px solid var(--border); border-radius: 4px; color: var(--text);">${profile.bio || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="phone">Phone</label>
                    <input type="text" id="phone" value="${profile.phone || ''}" style="width: 100%; padding: 0.6rem; background: var(--input); border: 1px solid var(--border); border-radius: 4px; color: var(--text);">
                </div>
                <div class="form-group">
                    <label for="githubUrl">GitHub URL</label>
                    <input type="text" id="githubUrl" value="${profile.githubUrl || ''}" style="width: 100%; padding: 0.6rem; background: var(--input); border: 1px solid var(--border); border-radius: 4px; color: var(--text);">
                </div>
                <div class="form-group">
                    <label for="linkedinUrl">LinkedIn URL</label>
                    <input type="text" id="linkedinUrl" value="${profile.linkedinUrl || ''}" style="width: 100%; padding: 0.6rem; background: var(--input); border: 1px solid var(--border); border-radius: 4px; color: var(--text);">
                </div>
                <div class="form-group">
                    <label for="website">Website</label>
                    <input type="text" id="website" value="${profile.website || ''}" style="width: 100%; padding: 0.6rem; background: var(--input); border: 1px solid var(--border); border-radius: 4px; color: var(--text);">
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" class="btn-primary" style="width: auto;">Save Profile</button>
                    <button type="button" onclick="window.location.href='/views/dashboard.html'" class="btn-secondary" style="width: auto;">Cancel</button>
                </div>
                <div id="profileMessage" style="margin-top: 1rem; display: none;"></div>
            </form>
        `;

        document.getElementById('profileForm').addEventListener('submit', async function (event) {
            event.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const profileData = {
                bio: document.getElementById('bio').value,
                phone: document.getElementById('phone').value,
                githubUrl: document.getElementById('githubUrl').value,
                linkedinUrl: document.getElementById('linkedinUrl').value,
                website: document.getElementById('website').value
            };

            try {
                await api.updateProfile(profileData);
                showMessage('✅ Profile updated successfully!', 'success');
            } catch (error) {
                showMessage('❌ Failed to update profile: ' + error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        document.getElementById('profileContent').innerHTML = `
            <div class="error-message">Failed to load profile: ${error.message}</div>
        `;
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('profileMessage');
    messageDiv.style.display = 'block';
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 4000);
}