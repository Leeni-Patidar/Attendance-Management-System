-- Insert sample data
USE attendance_system;

-- Insert users
INSERT INTO users (email, password, role, name, phone) VALUES
('admin@college.edu', '$2b$10$hash1', 'admin', 'System Admin', '+91 9999999999'),
('sarah.johnson@college.edu', '$2b$10$hash2', 'class_teacher', 'Dr. Sarah Johnson', '+91 9876543210'),
('michael.chen@college.edu', '$2b$10$hash3', 'subject_teacher', 'Prof. Michael Chen', '+91 9876543211'),
('john.doe@college.edu', '$2b$10$hash4', 'student', 'John Doe', '+91 9876543212'),
('jane.smith@college.edu', '$2b$10$hash5', 'student', 'Jane Smith', '+91 9876543213'),
('mike.wilson@college.edu', '$2b$10$hash6', 'student', 'Mike Wilson', '+91 9876543214');

-- Insert teachers
INSERT INTO teachers (user_id, employee_id, department) VALUES
(2, 'EMP001', 'Computer Science'),
(3, 'EMP002', 'Computer Science');

-- Insert classes
INSERT INTO classes (name, year, semester, section, branch, class_teacher_id) VALUES
('CS 3rd Year - Section A', 3, 6, 'A', 'Computer Science', 1);

-- Insert students
INSERT INTO students (user_id, roll_number, class_id, year, semester, branch, program) VALUES
(4, 'CS21B001', 1, 3, 6, 'Computer Science', 'B.Tech Computer Science'),
(5, 'CS21B002', 1, 3, 6, 'Computer Science', 'B.Tech Computer Science'),
(6, 'CS21B003', 1, 3, 6, 'Computer Science', 'B.Tech Computer Science');

-- Insert subjects
INSERT INTO subjects (name, code, credits, department) VALUES
('Data Structures & Algorithms', 'CS301', 4, 'Computer Science'),
('Database Management Systems', 'CS302', 3, 'Computer Science'),
('Computer Networks', 'CS303', 3, 'Computer Science');

-- Insert class subjects
INSERT INTO class_subjects (class_id, subject_id, subject_teacher_id) VALUES
(1, 1, 2),
(1, 2, 2),
(1, 3, 2);

-- Insert student subjects
INSERT INTO student_subjects (student_id, class_subject_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2), (3, 3);

-- Insert sample attendance
INSERT INTO attendance (student_id, class_subject_id, date, status, marked_by_teacher_id) VALUES
(1, 1, '2024-01-15', 'present', 2),
(1, 1, '2024-01-17', 'present', 2),
(1, 1, '2024-01-19', 'absent', 2),
(2, 1, '2024-01-15', 'present', 2),
(2, 1, '2024-01-17', 'absent', 2),
(3, 1, '2024-01-15', 'late', 2);
