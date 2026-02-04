-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS / TUTORS (Extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STUDENTS
create table public.students (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references public.profiles(id) not null,
  full_name text not null,
  email text,
  grade_level text, -- e.g. "10th Grade", "University"
  status text check (status in ('active', 'inactive', 'archived')) default 'active',
  notes text,
  risk_score integer default 0, -- 0-100, calculated by AI/Analytics
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COURSES
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  hourly_rate numeric(10, 2),
  color_code text, -- For UI badging
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENROLLMENTS (Link Students to Courses)
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) not null,
  course_id uuid references public.courses(id) not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, course_id)
);

-- SESSIONS
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references public.profiles(id) not null,
  course_id uuid references public.courses(id) not null,
  student_id uuid references public.students(id), -- Optional if 1-on-1, or use a join table for group sessions. Assuming 1-on-1 for simplicity or linked to enrollment? Let's link to Student for now.
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('scheduled', 'completed', 'cancelled')) default 'scheduled',
  topic text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PAYMENTS
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references public.profiles(id) not null,
  student_id uuid references public.students(id) not null,
  amount numeric(10, 2) not null,
  currency text default 'USD',
  status text check (status in ('pending', 'paid', 'overdue')) default 'pending',
  due_date timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references public.profiles(id) not null,
  student_id uuid references public.students(id) not null,
  sender text check (sender in ('tutor', 'student')),
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ANALYTICS CACHE (Optional, or calculate on fly)
-- For this MVP, we likely calculate on the fly or have a view. 
-- Let's add a view for Monthly Earnings.

create or replace view public.monthly_earnings as
select 
  tutor_id,
  date_trunc('month', paid_at) as month,
  sum(amount) as total
from public.payments
where status = 'paid'
group by tutor_id, date_trunc('month', paid_at);

-- RLS POLICIES (Simple version: Users can only see their own data)
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.sessions enable row level security;
alter table public.payments enable row level security;
alter table public.messages enable row level security;

-- Policy examples
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Tutors can view own students" on public.students for select using (auth.uid() = tutor_id);
create policy "Tutors can insert own students" on public.students for insert with check (auth.uid() = tutor_id);
create policy "Tutors can update own students" on public.students for update using (auth.uid() = tutor_id);

-- (Repeat similar policies for other tables based on tutor_id)
create policy "Tutors can view own courses" on public.courses for select using (auth.uid() = tutor_id);
create policy "Tutors can insert own courses" on public.courses for insert with check (auth.uid() = tutor_id);

create policy "Tutors can view own sessions" on public.sessions for select using (auth.uid() = tutor_id);
create policy "Tutors can insert own sessions" on public.sessions for insert with check (auth.uid() = tutor_id);

create policy "Tutors can view own payments" on public.payments for select using (auth.uid() = tutor_id);
create policy "Tutors can insert own payments" on public.payments for insert with check (auth.uid() = tutor_id);
