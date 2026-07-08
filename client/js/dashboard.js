document.addEventListener('DOMContentLoaded', async function () {
    const user = checkAuth();
    if (!user) return;

    document.getElementById('userDisplay').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('logoutBtn').addEventListener('click', function () {
        api.logout();
    });

    try {
        const [statsResponse, cohortsResponse] = await Promise.all([
            api.getUserStats(),
            api.getMyCohorts()
        ]);

        const stats = statsResponse.data.stats;
        const cohorts = cohortsResponse.data.cohorts;
    
        const isNewUser = cohorts.length === 0 && stats.completed_modules === 0;
  
        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName) {
            welcomeName.textContent = user.firstName;
        }

        const headingArea = document.querySelector('.dashboard-container div:first-child');
        if (headingArea) {
            if (isNewUser) {
                headingArea.innerHTML = `
                    <h1>Welcome, <span id="welcomeName">${user.firstName}</span>! 🎉</h1>
                    <p style="color: var(--text-secondary);">Your learning journey starts here. Enroll in a course to begin.</p>
                `;
            } else {
                headingArea.innerHTML = `
                    <h1>Welcome back, <span id="welcomeName">${user.firstName}</span>! 👋</h1>
                    <p style="color: var(--text-secondary);">Track your learning progress and continue where you left off.</p>
                `;
            }
        }

        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card">
                <h4>Active Cohorts</h4>
                <div class="stat-value">${stats.active_cohorts || 0}</div>
            </div>
            <div class="stat-card">
                <h4>Completed</h4>
                <div class="stat-value">${stats.completed_cohorts || 0}</div>
            </div>
            <div class="stat-card">
                <h4>Modules Done</h4>
                <div class="stat-value">${stats.completed_modules || 0}</div>
            </div>
            <div class="stat-card">
                <h4>Certificates</h4>
                <div class="stat-value">${stats.certificates_earned || 0}</div>
            </div>
            <div class="stat-card">
                <h4>🔥 Streak</h4>
                <div class="stat-value">${stats.streak || 0} days</div>
            </div>
        `;

        const container = document.getElementById('cohortsList');

        if (cohorts.length > 0) {
            const discoverSection = document.getElementById('discoverSection');
            if (discoverSection) discoverSection.style.display = 'none';
            
            container.innerHTML = cohorts.map(function (cohort) {
                return `
                    <div class="cohort-card" onclick="window.location.href='/views/cohort.html?id=${cohort.id}'">
                        <div class="cohort-header">
                            <h3>${cohort.name}</h3>
                            <span class="status-badge ${cohort.enrollment_status}">${cohort.enrollment_status}</span>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Instructor: ${cohort.instructor_name}
                        </p>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${cohort.progress || 0}%"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: var(--accent);">
                                ${Math.round(cohort.progress || 0)}% Complete
                            </span>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">
                                ${new Date(cohort.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            const discoverSection = document.getElementById('discoverSection');
            if (discoverSection) discoverSection.style.display = 'block';
            
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--card); border-radius: 12px; border: 2px dashed var(--border);">
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        You are not enrolled in any cohorts yet.
                    </p>
                    <a href="/views/courses.html" class="btn-primary" style="width: auto; display: inline-block; text-decoration: none;">
                        Discover Courses
                    </a>
                </div>
            `;
        }

        const certContainer = document.getElementById('certificatesList');
        if (certContainer) {
            try {
                const certResponse = await api.getCertificates();
                const certificates = certResponse.data.certificates || [];

                if (certificates.length === 0) {
                    certContainer.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--card); border-radius: 12px; border: 2px dashed var(--border);">
                            <p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                                No Certificates Yet
                            </p>
                            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
                                Complete a cohort to earn your certificate!
                            </p>
                            <a href="/views/courses.html" class="btn-primary" style="width: auto; display: inline-block; text-decoration: none;">
                                Browse Courses
                            </a>
                        </div>
                    `;
                } else {
                    certContainer.innerHTML = certificates.map(function (cert) {
                        return `
                            <div class="cohort-card">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                    <span style="font-size: 2.5rem;">📜</span>
                                    <div>
                                        <h3 style="margin-bottom: 0.25rem;">${cert.cohort_name}</h3>
                                        <span class="status-badge completed">Completed</span>
                                    </div>
                                </div>
                                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                                    Certificate #: ${cert.certificate_number}
                                </p>
                                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                                    Issued: ${new Date(cert.issue_date).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                                <button onclick="downloadCertificate('${cert.id}')" class="btn-primary" id="dashDownloadBtn-${cert.id}">
                                    📥 Download PDF Certificate
                                </button>
                                <div id="dashDownloadStatus-${cert.id}" style="margin-top: 0.5rem; display: none;"></div>
                            </div>
                        `;
                    }).join('');
                }
            } catch (error) {
                console.error('Certificate error:', error);
                certContainer.innerHTML = `
                    <div class="error-message">Failed to load certificates: ${error.message}</div>
                `;
            }
        }

    } catch (error) {
        console.error('Dashboard error:', error);
        const container = document.getElementById('cohortsList');
        if (container) {
            container.innerHTML = `<div class="error-message">Failed to load data: ${error.message}</div>`;
        }
    }
});

// ===== CERTIFICATE DOWNLOAD FUNCTION =====
async function downloadCertificate(certId) {
    console.log('📥 Downloading certificate:', certId);
    
    const btn = document.getElementById(`dashDownloadBtn-${certId}`);
    const statusDiv = document.getElementById(`dashDownloadStatus-${certId}`);
    
    if (!btn) {
        console.error('Download button not found for certificate:', certId);
        return;
    }
    
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Downloading...';
    btn.style.opacity = '0.7';
    
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
    
    try {
        await api.getCertificatePDF(certId);
        
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = `<span style="color: var(--green);">✅ Download started successfully!</span>`;
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
        
    } catch (error) {
        console.error('Download error:', error);
        
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = `<span style="color: var(--red);">❌ ${error.message || 'Failed to download certificate'}</span>`;
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        } else {
            alert('Failed to download certificate: ' + error.message);
        }
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
        btn.style.opacity = '1';
    }
}

// Make it globally accessible
window.downloadCertificate = downloadCertificate;