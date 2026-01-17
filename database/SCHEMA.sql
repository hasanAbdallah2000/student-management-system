-- University Website database schema
-- This file creates the core tables: users, courses, enrollments
-- Use MySQL. Adjust types if using another RDBMS.
SET
    FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS university_project;

USE university_project;

-- Users table: stores students and admins/teachers
CREATE TABLE
    IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role ENUM ('student', 'teacher') NOT NULL DEFAULT 'student',
        avatar_url VARCHAR(1024) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Courses table
CREATE TABLE
    IF NOT EXISTS courses (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        credits SMALLINT UNSIGNED NOT NULL DEFAULT 3,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Enrollments table: links students to courses and holds a single grade per enrollment
CREATE TABLE
    IF NOT EXISTS enrollments (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        student_id INT UNSIGNED NOT NULL,
        course_id INT UNSIGNED NOT NULL,
        enrolled_at DATE NOT NULL DEFAULT (CURRENT_DATE),
        grade DECIMAL(5,2) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT uq_enrollment UNIQUE (student_id, course_id),
        CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

-- Helpful indexes
CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_enrollments_student ON enrollments (student_id);

CREATE INDEX idx_enrollments_course ON enrollments (course_id);

SET
    FOREIGN_KEY_CHECKS = 1;

-- Notes:
-- 1) `enrollments` holds the grade fields (one grade per student per course).
-- 2) Unique constraint on (student_id, course_id) prevents duplicate enrollments.
-- 3) Deleting a user or course cascades to enrollments.