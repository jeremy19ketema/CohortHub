
DELETE FROM user_answers;
DELETE FROM question_options;
DELETE FROM questions;
DELETE FROM quiz_attempts;
DELETE FROM quizzes;
DELETE FROM content_blocks;
DELETE FROM module_progress;
DELETE FROM modules;
DELETE FROM discussion_replies;
DELETE FROM discussions;
DELETE FROM announcements;
DELETE FROM notifications;
DELETE FROM certificates;
DELETE FROM enrollments;
DELETE FROM learning_streaks;
DELETE FROM user_profiles;
DELETE FROM cohorts;
DELETE FROM users;


INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@cohorthub.com', '$2a$12$ByqDetrSYhTe0fDtcraZ7.y54C3B.8CuQ5nNpquzaafH0JNuL0A2a', 'Admin', 'User', 'admin'),
('instructor@cohorthub.com', '$2a$12$WRYAnJM3Mih3A1vgOIM/Tur0rGz/vdXbxmYAr.vq3GCyev.KfjIUq', 'Nardos', 'Alemu', 'instructor'),
('student@cohorthub.com', '$2a$12$TwN96uenKee6yhANQpoQ8OWfHH5JCkEv7qocibIOW3rR0LFTZKJlW', 'Adonay', 'Abebe', 'student');

INSERT INTO user_profiles (user_id, bio) 
SELECT id, 'Platform Administrator' FROM users WHERE email = 'admin@cohorthub.com';

INSERT INTO user_profiles (user_id, bio) 
SELECT id, 'Senior Full-Stack Developer with 10+ years of experience' FROM users WHERE email = 'instructor@cohorthub.com';

INSERT INTO user_profiles (user_id, bio) 
SELECT id, 'Passionate learner exploring web development' FROM users WHERE email = 'student@cohorthub.com';

INSERT INTO learning_streaks (user_id) SELECT id FROM users;


DO $$
DECLARE
    c1_id UUID;
    c2_id UUID;
    m1_id UUID;
    m2_id UUID;
    m3_id UUID;
    m4_id UUID;
    m5_id UUID;
    m6_id UUID;
    q1_id UUID;
    q2_id UUID;
    q3_id UUID;
    q4_id UUID;
    q5_id UUID;
    q6_id UUID;
    quest_id UUID;
BEGIN
    
    INSERT INTO cohorts (name, description, about, requirements, what_you_will_learn, start_date, end_date, instructor_id, max_students) 
    VALUES (
        'Web Development Fundamentals',
        'Master HTML5, CSS3, and JavaScript. Build responsive websites from scratch.',
        'This comprehensive course is designed for beginners who want to become web developers.',
        'No prior programming experience required.',
        'Build responsive websites\nMaster HTML5\nCreate layouts with CSS3\nAdd interactivity with JavaScript',
        '2024-01-15',
        '2024-04-15',
        (SELECT id FROM users WHERE email = 'instructor@cohorthub.com'),
        30
    )
    RETURNING id INTO c1_id;

    
    INSERT INTO modules (cohort_id, title, description, order_number, is_published) 
    VALUES (c1_id, 'Introduction to HTML5', 'Learn HTML document structure and semantic elements.', 1, true)
    RETURNING id INTO m1_id;

    INSERT INTO content_blocks (module_id, block_type, title, content, order_number) VALUES
    (m1_id, 'text', 'What is HTML?', '<h3>Understanding HTML</h3><p>HTML is the standard language for creating web pages.</p>', 1),
    (m1_id, 'code', 'Your First HTML Page', '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>', 2);

    
    INSERT INTO quizzes (module_id, title, description, passing_score, max_attempts)
    VALUES (m1_id, 'HTML Quiz', 'Test your HTML knowledge', 70, 3)
    RETURNING id INTO q1_id;

    INSERT INTO questions (quiz_id, question_text, points, order_number)
    VALUES (q1_id, 'What does HTML stand for?', 1, 1)
    RETURNING id INTO quest_id;

    INSERT INTO question_options (question_id, option_text, is_correct, order_number) VALUES
    (quest_id, 'Hyper Text Markup Language', true, 1),
    (quest_id, 'High Tech Modern Language', false, 2),
    (quest_id, 'Hyper Transfer Markup Language', false, 3),
    (quest_id, 'Home Tool Markup Language', false, 4);

    
    INSERT INTO modules (cohort_id, title, description, order_number, is_published) 
    VALUES (c1_id, 'CSS3 Styling', 'Master CSS selectors and layouts.', 2, true)
    RETURNING id INTO m2_id;

    INSERT INTO content_blocks (module_id, block_type, title, content, order_number) VALUES
    (m2_id, 'text', 'What is CSS?', '<h3>Cascading Style Sheets</h3><p>CSS controls the visual presentation of HTML.</p>', 1),
    (m2_id, 'code', 'CSS Example', 'body {\n    font-family: Arial;\n    background: #f0f0f0;\n}', 2);

   
    INSERT INTO quizzes (module_id, title, description, passing_score, max_attempts)
    VALUES (m2_id, 'CSS Quiz', 'Test your CSS knowledge', 70, 3)
    RETURNING id INTO q2_id;

    INSERT INTO questions (quiz_id, question_text, points, order_number)
    VALUES (q2_id, 'What does CSS stand for?', 1, 1)
    RETURNING id INTO quest_id;

    INSERT INTO question_options (question_id, option_text, is_correct, order_number) VALUES
    (quest_id, 'Cascading Style Sheets', true, 1),
    (quest_id, 'Computer Style Sheets', false, 2),
    (quest_id, 'Creative Style Sheets', false, 3),
    (quest_id, 'Colorful Style Sheets', false, 4);

    
    INSERT INTO modules (cohort_id, title, description, order_number, is_published) 
    VALUES (c1_id, 'JavaScript Fundamentals', 'Learn variables, functions, and DOM manipulation.', 3, true)
    RETURNING id INTO m3_id;

    INSERT INTO content_blocks (module_id, block_type, title, content, order_number) VALUES
    (m3_id, 'text', 'What is JavaScript?', '<h3>Making Pages Interactive</h3><p>JavaScript adds interactivity to websites.</p>', 1),
    (m3_id, 'code', 'Your First JavaScript', 'let name = "Adonay";\nconsole.log("Hello, " + name);', 2);

    
    INSERT INTO quizzes (module_id, title, description, passing_score, max_attempts)
    VALUES (m3_id, 'JavaScript Quiz', 'Test your JavaScript knowledge', 70, 3)
    RETURNING id INTO q3_id;

    INSERT INTO questions (quiz_id, question_text, points, order_number)
    VALUES (q3_id, 'Which keyword declares a constant?', 1, 1)
    RETURNING id INTO quest_id;

    INSERT INTO question_options (question_id, option_text, is_correct, order_number) VALUES
    (quest_id, 'const', true, 1),
    (quest_id, 'var', false, 2),
    (quest_id, 'let', false, 3),
    (quest_id, 'static', false, 4);

    
    INSERT INTO discussions (cohort_id, user_id, title, content) VALUES
    (c1_id, (SELECT id FROM users WHERE email = 'student@cohorthub.com'), 
     'Best code editor?', 
     'What editor do you recommend for beginners?');

    INSERT INTO announcements (cohort_id, user_id, title, content, is_important) VALUES
    (c1_id, (SELECT id FROM users WHERE email = 'instructor@cohorthub.com'), 
     'Welcome! 🚀', 
     'Complete Module 1 this week.', true);

    
    INSERT INTO enrollments (user_id, cohort_id)
    SELECT id, c1_id FROM users WHERE email = 'student@cohorthub.com';

    
    INSERT INTO cohorts (name, description, about, requirements, what_you_will_learn, start_date, end_date, instructor_id, max_students) 
    VALUES (
        'Advanced JavaScript Mastery',
        'Deep dive into advanced JavaScript concepts.',
        'Take your JavaScript skills to the next level.',
        'Basic JavaScript knowledge required.',
        'Master closures\nUnderstand async/await\nUse ES6+ features',
        '2024-02-01',
        '2024-05-01',
        (SELECT id FROM users WHERE email = 'instructor@cohorthub.com'),
        25
    )
    RETURNING id INTO c2_id;

   
    INSERT INTO modules (cohort_id, title, description, order_number, is_published) 
    VALUES (c2_id, 'Closures & Scope', 'Master closures and lexical scope.', 1, true)
    RETURNING id INTO m4_id;

    INSERT INTO content_blocks (module_id, block_type, title, content, order_number) VALUES
    (m4_id, 'text', 'Understanding Closures', '<h3>What are Closures?</h3><p>A closure is a function that remembers its outer scope.</p>', 1),
    (m4_id, 'code', 'Closure Example', 'function counter() {\n    let count = 0;\n    return function() { count++; return count; };\n}', 2);

   
    INSERT INTO quizzes (module_id, title, description, passing_score, max_attempts)
    VALUES (m4_id, 'Closures Quiz', 'Test your closure knowledge', 70, 3)
    RETURNING id INTO q4_id;

    INSERT INTO questions (quiz_id, question_text, points, order_number)
    VALUES (q4_id, 'What is a closure?', 1, 1)
    RETURNING id INTO quest_id;

    INSERT INTO question_options (question_id, option_text, is_correct, order_number) VALUES
    (quest_id, 'A function that remembers its outer scope', true, 1),
    (quest_id, 'A way to close a browser', false, 2),
    (quest_id, 'A type of loop', false, 3),
    (quest_id, 'A CSS property', false, 4);

    
    INSERT INTO modules (cohort_id, title, description, order_number, is_published) 
    VALUES (c2_id, 'Async/Await', 'Master asynchronous programming.', 2, true)
    RETURNING id INTO m5_id;

    INSERT INTO content_blocks (module_id, block_type, title, content, order_number) VALUES
    (m5_id, 'text', 'Understanding Async/Await', '<h3>Async/Await</h3><p>Async/await makes asynchronous code easier to write.</p>', 1),
    (m5_id, 'code', 'Async Example', 'async function getData() {\n    const response = await fetch("/api/data");\n    return response.json();\n}', 2);

   
    INSERT INTO quizzes (module_id, title, description, passing_score, max_attempts)
    VALUES (m5_id, 'Async/Await Quiz', 'Test your async knowledge', 70, 3)
    RETURNING id INTO q5_id;

    INSERT INTO questions (quiz_id, question_text, points, order_number)
    VALUES (q5_id, 'What keyword handles errors in async/await?', 1, 1)
    RETURNING id INTO quest_id;

    INSERT INTO question_options (question_id, option_text, is_correct, order_number) VALUES
    (quest_id, 'try/catch', true, 1),
    (quest_id, 'if/else', false, 2),
    (quest_id, 'switch/case', false, 3),
    (quest_id, 'for/loop', false, 4);

    
    INSERT INTO modules (cohort_id, title, description, order_number, is_published) 
    VALUES (c2_id, 'ES6+ Features', 'Learn modern JavaScript features.', 3, true)
    RETURNING id INTO m6_id;

    INSERT INTO content_blocks (module_id, block_type, title, content, order_number) VALUES
    (m6_id, 'text', 'ES6+ Features', '<h3>Modern JavaScript</h3><p>Learn destructuring, spread, and arrow functions.</p>', 1),
    (m6_id, 'code', 'ES6 Example', 'const { name, age } = user;\nconst newArr = [...oldArr, 4, 5];', 2);

    
    INSERT INTO quizzes (module_id, title, description, passing_score, max_attempts)
    VALUES (m6_id, 'ES6+ Quiz', 'Test your ES6 knowledge', 70, 3)
    RETURNING id INTO q6_id;

    INSERT INTO questions (quiz_id, question_text, points, order_number)
    VALUES (q6_id, 'What does the spread operator do?', 1, 1)
    RETURNING id INTO quest_id;

    INSERT INTO question_options (question_id, option_text, is_correct, order_number) VALUES
    (quest_id, 'Spreads elements of an iterable', true, 1),
    (quest_id, 'Spreads CSS elements', false, 2),
    (quest_id, 'Creates HTML elements', false, 3),
    (quest_id, 'None of the above', false, 4);

   
    INSERT INTO discussions (cohort_id, user_id, title, content) VALUES
    (c2_id, (SELECT id FROM users WHERE email = 'instructor@cohorthub.com'), 
     'Welcome to Advanced JS! 🚀', 
     'Welcome everyone! Start with Module 1.');

    INSERT INTO announcements (cohort_id, user_id, title, content, is_important) VALUES
    (c2_id, (SELECT id FROM users WHERE email = 'instructor@cohorthub.com'), 
     'Course Kickoff!', 
     'Start with Module 1 on Closures.', true);

    
    INSERT INTO enrollments (user_id, cohort_id)
    SELECT id, c2_id FROM users WHERE email = 'student@cohorthub.com';

END $$;