-- TUTOR PROFILES
-- NOTE: You likely need to create this user in Supabase Auth first, or use a trigger to auto-create profile.
-- Since we are manually inserting, ensure 'd114c0de-0000-4000-a000-000000000000' matches an auth.users id or adjust FLP policies if needed for testing.

insert into public.profiles (id, email, full_name, avatar_url)
values ('d114c0de-0000-4000-a000-000000000000', 'alex.tutor@example.com', 'Alex Rivers', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex')
on conflict (id) do nothing;

-- STUDENTS
insert into public.students (tutor_id, full_name, email, grade_level, status, risk_score, notes)
values 
('d114c0de-0000-4000-a000-000000000000', 'Jordan Smith', 'jordan@student.com', '10th Grade', 'active', 15, 'Strong at algebra, struggles with word problems.'),
('d114c0de-0000-4000-a000-000000000000', 'Casey Chen', 'casey@student.com', 'University', 'active', 45, 'Working on advanced calculus. Missed last session.');

-- COURSES
insert into public.courses (tutor_id, title, description, hourly_rate, color_code)
values 
('d114c0de-0000-4000-a000-000000000000', 'Advanced Mathematics', 'Calculus, Trigonometry, and Linear Algebra.', 60.00, '#4F46E5'),
('d114c0de-0000-4000-a000-000000000000', 'Intro to Physics', 'Classical mechanics and thermodynamics.', 55.00, '#06B6D4');

-- ENROLLMENTS
insert into public.enrollments (student_id, course_id)
values 
((select id from public.students where full_name = 'Jordan Smith' limit 1), (select id from public.courses where title = 'Intro to Physics' limit 1)),
((select id from public.students where full_name = 'Casey Chen' limit 1), (select id from public.courses where title = 'Advanced Mathematics' limit 1));

-- SESSIONS
insert into public.sessions (tutor_id, course_id, student_id, start_time, end_time, status, topic)
values 
('d114c0de-0000-4000-a000-000000000000', 
 (select id from public.courses where title = 'Intro to Physics' limit 1), 
 (select id from public.students where full_name = 'Jordan Smith' limit 1), 
 now() - interval '2 days', now() - interval '46 hours', 'completed', 'Newtonian Mechanics'),

('d114c0de-0000-4000-a000-000000000000', 
 (select id from public.courses where title = 'Advanced Mathematics' limit 1), 
 (select id from public.students where full_name = 'Casey Chen' limit 1), 
 now() + interval '1 day', now() + interval '25 hours', 'scheduled', 'Integrals and Derivatives');

-- PAYMENTS
insert into public.payments (tutor_id, student_id, amount, status, paid_at, due_date)
values 
('d114c0de-0000-4000-a000-000000000000', (select id from public.students where full_name = 'Jordan Smith' limit 1), 110.00, 'paid', now() - interval '1 day', now() - interval '1 day'),
('d114c0de-0000-4000-a000-000000000000', (select id from public.students where full_name = 'Casey Chen' limit 1), 120.00, 'pending', null, now() + interval '5 days');

-- MESSAGES
insert into public.messages (tutor_id, student_id, sender, content)
values 
('d114c0de-0000-4000-a000-000000000000', (select id from public.students where full_name = 'Jordan Smith' limit 1), 'tutor', 'Hey Jordan, dont forget to bring your lab manual!'),
('d114c0de-0000-4000-a000-000000000000', (select id from public.students where full_name = 'Jordan Smith' limit 1), 'student', 'Got it, thanks Alex!');
