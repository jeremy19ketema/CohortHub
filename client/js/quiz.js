function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', async function () {
    const user = checkAuth();
    if (!user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('moduleId');
    const container = document.getElementById('quizContainer');

    if (!moduleId) {
        container.innerHTML = '<div class="error-message">No module specified for quiz.</div>';
        return;
    }

    document.getElementById('backBtn').addEventListener('click', function () {
        window.location.href = `/views/module.html?id=${moduleId}`;
    });

    try {
        console.log('📤 Fetching quiz for module:', moduleId);
        
        const response = await api.getQuiz(moduleId);
        console.log('📥 Full API Response:', response);
        console.log('📥 Response data:', response.data);
        
       
        if (!response.data) {
            container.innerHTML = '<div class="error-message">No data returned from server.</div>';
            return;
        }
        
        if (!response.data.quiz) {
            container.innerHTML = '<div class="error-message">No quiz data found. Response: ' + JSON.stringify(response.data) + '</div>';
            return;
        }
        
        const quiz = response.data.quiz;
        const attemptsRemaining = response.data.attemptsRemaining || 0;
        
        console.log('✅ Quiz loaded:', quiz.title);
        console.log('📝 Questions:', quiz.questions.length);
        console.log('📝 Question 1 options:', quiz.questions[0]?.options);
        console.log('📝 Question 2 options:', quiz.questions[1]?.options);

        
        let html = '';
        html += '<h1>' + escapeHtml(quiz.title) + '</h1>';
        html += '<div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; color: var(--text-secondary);">';
        html += '<span><strong>Passing Score:</strong> ' + quiz.passingScore + '%</span>';
        html += '<span><strong>Attempts Remaining:</strong> ' + attemptsRemaining + '</span>';
        html += '</div>';
        html += '<form id="quizForm">';

        
        for (let qIndex = 0; qIndex < quiz.questions.length; qIndex++) {
            const question = quiz.questions[qIndex];
            
            html += '<div class="question-card">';
            html += '<p><strong>Question ' + (qIndex + 1) + ':</strong> ' + escapeHtml(question.question_text) + ' (' + question.points + ' point' + (question.points > 1 ? 's' : '') + ')</p>';
            
            
            if (question.options && question.options.length > 0) {
                
                for (let oIndex = 0; oIndex < question.options.length; oIndex++) {
                    const option = question.options[oIndex];
                    const optionText = option.text || 'Option ' + (oIndex + 1);
                    
                    html += '<label class="option-item">';
                    html += '<input type="radio" name="q_' + qIndex + '" value="' + escapeHtml(option.id) + '" required>';
                    html += '<span style="margin-left: 0.5rem;">' + escapeHtml(optionText) + '</span>';
                    html += '</label>';
                }
            } else {
                html += '<p style="color: #dc3545; padding: 0.5rem; background: #f8d7da; border-radius: 4px;">No options available for this question.</p>';
            }
            
            html += '</div>';
        }

        html += '<button type="submit" class="btn-primary">Submit Quiz</button>';
        html += '</form>';
        html += '<div id="quizResult"></div>';

        container.innerHTML = html;
        console.log('✅ Quiz rendered successfully');

        document.getElementById('quizForm').addEventListener('submit', async function (event) {
            event.preventDefault();

            const answers = [];
            for (let i = 0; i < quiz.questions.length; i++) {
                const selectedRadio = document.querySelector('input[name="q_' + i + '"]:checked');
                answers.push({
                    questionId: quiz.questions[i].id,
                    selectedOptionId: selectedRadio ? selectedRadio.value : null
                });
            }

            const unanswered = answers.filter(function (a) {
                return !a.selectedOptionId;
            });

            if (unanswered.length > 0) {
                alert('Please answer all questions. ' + unanswered.length + ' remaining.');
                return;
            }

            try {
                const result = await api.submitQuiz(quiz.id, answers);
                const data = result.data;

                document.getElementById('quizForm').style.display = 'none';
                document.getElementById('quizResult').innerHTML = 
                    '<div class="result-card ' + (data.passed ? 'passed' : 'failed') + '">' +
                        '<h2>' + (data.passed ? '🎉 Congratulations! You Passed!' : '📚 Keep Studying') + '</h2>' +
                        '<div style="font-size: 3rem; font-weight: 700; margin: 1rem 0;">' + Math.round(data.score) + '%</div>' +
                        '<p>' + data.earnedPoints + ' out of ' + data.totalPoints + ' points</p>' +
                        '<p style="margin-bottom: 1.5rem; color: var(--text-secondary);">Passing score: ' + data.passingScore + '%</p>' +
                        (data.passed ? 
                            '<button onclick="window.location.href=\'/views/dashboard.html\'" class="btn-primary">Back to Dashboard</button>' :
                            '<button onclick="location.reload()" class="btn-secondary">Retry Quiz</button>'
                        ) +
                    '</div>';
            } catch (error) {
                alert('Error submitting quiz: ' + error.message);
            }
        });
    } catch (error) {
        console.error('❌ Quiz loading error:', error);
        container.innerHTML = '<div class="error-message">Error loading quiz: ' + error.message + '</div>';
    }
});