document.addEventListener('DOMContentLoaded', async function () {
    const user = checkAuth();
    if (!user) return;

    document.getElementById('userDisplay').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('logoutBtn').addEventListener('click', function () {
        api.logout();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('id');
    const cohortId = urlParams.get('cohortId');

    document.getElementById('backToCohort').addEventListener('click', function () {
        window.location.href = `/views/cohort.html?id=${cohortId}`;
    });

    if (!moduleId) return;

    try {
        const response = await api.getModule(moduleId);
        const module = response.data.module;
        const contentBlocks = response.data.contentBlocks || [];

        let html = `
            <h1>${module.title}</h1>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${module.description || ''}</p>
        `;

       
        contentBlocks.forEach(function (block) {
            if (block.block_type === 'text') {
                html += `<div class="module-body" style="margin-bottom: 1rem;">${block.content}</div>`;
            } else if (block.block_type === 'code') {
                html += `
                    <div style="background: #0d1117; color: #c9d1d9; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; overflow-x: auto;">
                        <pre><code>${block.content}</code></pre>
                    </div>
                `;
            } else if (block.block_type === 'video') {
                const videoId = block.video_id;
                if (videoId) {
                    html += `
                        <div style="margin-bottom: 1rem; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
                            <iframe 
                                src="https://www.youtube.com/embed/${videoId}" 
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                            ></iframe>
                        </div>
                        ${block.content ? `<div class="module-body" style="margin-bottom: 1rem;">${block.content}</div>` : ''}
                    `;
                } else {
                    html += `
                        <div style="margin-bottom: 1rem; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
                            <iframe 
                                src="${block.content}" 
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                                allowfullscreen
                            ></iframe>
                        </div>
                    `;
                }
            } else if (block.block_type === 'image') {
                html += `
                    <div style="margin-bottom: 1rem; text-align: center;">
                        <img src="${block.file_url || block.content}" alt="${block.title || 'Image'}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        ${block.title ? `<p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">${block.title}</p>` : ''}
                    </div>
                `;
            } else if (block.block_type === 'pdf') {
                html += `
                    <div style="margin-bottom: 1rem;">
                        <a href="${block.file_url || block.content}" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none; width: auto;">
                            📄 ${block.title || 'View PDF Document'}
                        </a>
                    </div>
                `;
            } else {
                html += `<div class="module-body" style="margin-bottom: 1rem;">${block.content || ''}</div>`;
            }
        });

        
        if (module.is_completed) {
            html += `<div style="margin-top: 2rem;"><div class="success-message">✓ Module Completed</div></div>`;
        } else {
            html += `
                <div style="margin-top: 2rem;">
                    <button onclick="window.location.href='/views/quiz.html?moduleId=${moduleId}'" class="btn-primary">
                        Take Module Quiz
                    </button>
                </div>
            `;
        }

        document.getElementById('moduleContent').innerHTML = html;
    } catch (error) {
        document.getElementById('moduleContent').innerHTML = `
            <div class="error-message">${error.message}</div>
        `;
    }
});