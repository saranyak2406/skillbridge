const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { pool } = require('../config/db');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seedDatabase() {
  console.log('====================================================');
  console.log('  SkillBridge Complete Database Seeder');
  console.log('====================================================');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Categories
    console.log('[1/8] Seeding Categories...');
    const categoriesData = [
      { name: 'Web Development', desc: 'Full stack, frontend, backend and modern web frameworks.' },
      { name: 'Data Science & AI', desc: 'Machine Learning, Deep Learning, Data Analytics and Python.' },
      { name: 'Mobile App Development', desc: 'React Native, Flutter, iOS and Android native apps.' },
      { name: 'Cloud & DevOps', desc: 'Docker, Kubernetes, AWS, CI/CD pipelines and microservices.' },
      { name: 'UI/UX Design', desc: 'Figma, prototyping, user research, wireframing and design systems.' },
      { name: 'Cyber Security', desc: 'Ethical hacking, network defense, penetration testing and security.' },
    ];

    const categoryMap = new Map();
    for (const cat of categoriesData) {
      const res = await client.query(
        `INSERT INTO categories (category_name, description)
         VALUES ($1, $2)
         ON CONFLICT (category_name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id, category_name`,
        [cat.name, cat.desc]
      );
      categoryMap.set(cat.name, res.rows[0].id);
    }

    // 2. Default Users
    console.log('[2/8] Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const instructorHash = await bcrypt.hash('Instructor@123', salt);
    const studentHash = await bcrypt.hash('Student@123', salt);

    // Admin
    const adminRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      ['System Administrator', 'admin@skillbridge.com', adminHash, 'admin']
    );

    // Instructor
    const instructorRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      ['Dr. Sarah Mitchell', 'instructor@skillbridge.com', instructorHash, 'instructor']
    );
    const instructorId = instructorRes.rows[0].id;

    await client.query(
      `INSERT INTO instructor_profiles (user_id, expertise, qualifications, experience, bio)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET expertise = EXCLUDED.expertise`,
      [
        instructorId,
        'Full Stack & Cloud Architecture',
        'Ph.D. in Computer Science, AWS Certified Solutions Architect',
        '10+ Years in Software Engineering and University Teaching',
        'Passionate about simplifying complex software engineering paradigms for students worldwide.',
      ]
    );

    // Student
    const studentRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      ['Alex Johnson', 'student@skillbridge.com', studentHash, 'student']
    );
    const studentId = studentRes.rows[0].id;

    await client.query(
      `INSERT INTO student_profiles (user_id, bio, education, interests)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio`,
      [
        studentId,
        'Aspiring software developer eager to build scalable cloud solutions.',
        'Undergraduate Degree',
        'React, Node.js, Cloud Computing, PostgreSQL',
      ]
    );

    // 3. Courses
    console.log('[3/8] Seeding Courses...');
    const coursesData = [
      {
        title: 'Full Stack Web Architecture with React & Node.js',
        desc: 'Master production-grade full-stack web applications from front to back using React 18, Vite, Tailwind, Node.js Express, and PostgreSQL.',
        category: 'Web Development',
        price: 49.99,
        difficulty: 'intermediate',
        duration: '42 hours',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Applied Machine Learning & Neural Networks in Python',
        desc: 'Comprehensive training in predictive modeling, supervised and unsupervised machine learning, deep neural nets, and AI model deployment.',
        category: 'Data Science & AI',
        price: 59.99,
        difficulty: 'advanced',
        duration: '38 hours',
        thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Cloud Infrastructure & Kubernetes DevOps Bootcamp',
        desc: 'Containerize and orchestrate scalable applications using Docker, Kubernetes clusters, CI/CD pipelines, and cloud monitoring tools.',
        category: 'Cloud & DevOps',
        price: 44.99,
        difficulty: 'intermediate',
        duration: '30 hours',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      },
    ];

    const courseMap = [];
    for (const c of coursesData) {
      const catId = categoryMap.get(c.category) || null;
      const cRes = await client.query(
        `INSERT INTO courses (
          instructor_id, category_id, title, description, thumbnail, price, difficulty_level, duration, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published')
        ON CONFLICT DO NOTHING
        RETURNING id`,
        [instructorId, catId, c.title, c.desc, c.thumbnail, c.price, c.difficulty, c.duration]
      );

      let courseId;
      if (cRes.rowCount > 0) {
        courseId = cRes.rows[0].id;
      } else {
        const findRes = await client.query('SELECT id FROM courses WHERE title = $1', [c.title]);
        courseId = findRes.rows[0].id;
      }
      courseMap.push(courseId);
    }

    const mainCourseId = courseMap[0]; // Full Stack Web Architecture

    // 4. Sections & Lessons for Main Course
    console.log('[4/8] Seeding Curriculum Sections & Video Lessons...');
    const sec1 = await client.query(
      `INSERT INTO course_sections (course_id, section_title, section_order)
       VALUES ($1, 'Section 1: Modern Client-Server Foundations', 1)
       RETURNING id`,
      [mainCourseId]
    );
    const sec1Id = sec1.rows[0].id;

    const lessonsData = [
      {
        title: '1. Course Overview & Full Stack Architecture',
        desc: 'Deconstructing modern decoupled SPA architectures, RESTful communication protocols, and data persistence models.',
        video: 'https://www.youtube.com/embed/SccSCuHhOw0',
        duration: '18 mins',
        order: 1,
      },
      {
        title: '2. Setting Up Express.js & Security Middleware',
        desc: 'Hardening Express with Helmet, CORS, Morgan logger, and Rate Limiter to guard against common web vulnerabilities.',
        video: 'https://www.youtube.com/embed/Oe421EPjeBE',
        duration: '24 mins',
        order: 2,
      },
      {
        title: '3. PostgreSQL Schema Design & Connection Pools',
        desc: 'Configuring node-postgres (pg) connection pools, writing parameterized queries, and setting up foreign keys.',
        video: 'https://www.youtube.com/embed/qw--VYLpxG4',
        duration: '32 mins',
        order: 3,
      },
    ];

    const lessonIds = [];
    for (const l of lessonsData) {
      const lRes = await client.query(
        `INSERT INTO lessons (section_id, title, description, video_url, duration, lesson_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [sec1Id, l.title, l.desc, l.video, l.duration, l.order]
      );
      lessonIds.push(lRes.rows[0].id);
    }

    // 5. Quiz with Multiple Choice Questions
    console.log('[5/8] Seeding Interactive Examination & Quizzes...');
    const quizRes = await client.query(
      `INSERT INTO quizzes (course_id, section_id, title, description, duration, passing_score)
       VALUES ($1, $2, 'Full Stack Architecture & Security Assessment', 'Test your comprehension of REST API architecture, JWT authentication tokens, and SQL injection prevention.', 15, 70)
       RETURNING id`,
      [mainCourseId, sec1Id]
    );
    const quizId = quizRes.rows[0].id;

    const questionsData = [
      {
        text: 'Which HTTP header is utilized by the client to transmit a JSON Web Token (JWT) securely to the API?',
        marks: 1,
        options: [
          { text: 'Content-Type: application/jwt', is_correct: false },
          { text: 'Authorization: Bearer <token>', is_correct: true },
          { text: 'X-Auth-Signature: <token>', is_correct: false },
          { text: 'Accept-Token: <token>', is_correct: false },
        ],
      },
      {
        text: 'Why should database queries always use parameterized placeholders (e.g., $1, $2) rather than string concatenation?',
        marks: 1,
        options: [
          { text: 'To completely neutralize SQL Injection vulnerabilities', is_correct: true },
          { text: 'To reduce RAM usage on the database engine', is_correct: false },
          { text: 'To compress JSON payloads across the wire', is_correct: false },
          { text: 'To eliminate the need for primary keys', is_correct: false },
        ],
      },
      {
        text: 'What is the primary role of helmet middleware in an Express.js production environment?',
        marks: 1,
        options: [
          { text: 'To compress HTTP responses with Gzip', is_correct: false },
          { text: 'To establish secure HTTP response headers (CSP, HSTS, X-Frame-Options)', is_correct: true },
          { text: 'To encrypt database passwords in the file system', is_correct: false },
          { text: 'To route incoming WebSocket connections', is_correct: false },
        ],
      },
      {
        text: 'In PostgreSQL, which constraint ensures that a student cannot enroll in the same course twice?',
        marks: 1,
        options: [
          { text: 'FOREIGN KEY (student_id) REFERENCES users(id)', is_correct: false },
          { text: 'UNIQUE (student_id, course_id)', is_correct: true },
          { text: 'CHECK (enrollment_date > NOW())', is_correct: false },
          { text: 'PRIMARY KEY (id, role)', is_correct: false },
        ],
      },
    ];

    for (const q of questionsData) {
      const qRes = await client.query(
        `INSERT INTO questions (quiz_id, question_text, question_type, marks)
         VALUES ($1, $2, 'multiple_choice', $3)
         RETURNING id`,
        [quizId, q.text, q.marks]
      );
      const qId = qRes.rows[0].id;

      for (const opt of q.options) {
        await client.query(
          `INSERT INTO question_options (question_id, option_text, is_correct)
           VALUES ($1, $2, $3)`,
          [qId, opt.text, opt.is_correct]
        );
      }
    }

    // 6. Assignment
    console.log('[6/8] Seeding Course Assignment...');
    await client.query(
      `INSERT INTO assignments (course_id, instructor_id, title, description, due_date, total_marks)
       VALUES ($1, $2, 'Capstone Project: Secure REST API Implementation', 'Build an Express and PostgreSQL service featuring JWT authentication, role guards, and parameterized queries. Submit your GitHub repository URL or a zipped source package.', CURRENT_TIMESTAMP + INTERVAL '14 days', 100)`,
      [mainCourseId, instructorId]
    );

    // 7. Enrollment & Progress for Student Alex
    console.log('[7/8] Seeding Student Enrollment & Lesson Progress...');
    await client.query(
      `INSERT INTO enrollments (student_id, course_id, payment_status, status)
       VALUES ($1, $2, 'completed', 'active')
       ON CONFLICT (student_id, course_id) DO NOTHING`,
      [studentId, mainCourseId]
    );

    // Mark 2 of the 3 lessons completed so progress is 67%
    if (lessonIds.length >= 2) {
      await client.query(
        `INSERT INTO lesson_progress (student_id, lesson_id, is_completed, completed_at)
         VALUES ($1, $2, true, CURRENT_TIMESTAMP)
         ON CONFLICT (student_id, lesson_id) DO NOTHING`,
        [studentId, lessonIds[0]]
      );
      await client.query(
        `INSERT INTO lesson_progress (student_id, lesson_id, is_completed, completed_at)
         VALUES ($1, $2, true, CURRENT_TIMESTAMP)
         ON CONFLICT (student_id, lesson_id) DO NOTHING`,
        [studentId, lessonIds[1]]
      );
    }

    // 8. Reviews
    console.log('[8/8] Seeding Reviews...');
    await client.query(
      `INSERT INTO reviews (student_id, course_id, rating, review_text)
       VALUES ($1, $2, 5, 'Exceptional course! The explanations of database connection pooling and JWT security were clear and directly applicable to production systems.')
       ON CONFLICT (student_id, course_id) DO NOTHING`,
      [studentId, mainCourseId]
    );

    await client.query('COMMIT');

    console.log('====================================================');
    console.log('SkillBridge Database Seeder completed successfully!');
    console.log('Initial accounts ready:');
    console.log(' - Admin: admin@skillbridge.com / Admin@123');
    console.log(' - Instructor: instructor@skillbridge.com / Instructor@123');
    console.log(' - Student: student@skillbridge.com / Student@123');
    console.log('====================================================');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding encountered an error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
