const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { pool } = require('../config/db');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seedDatabase() {
  console.log('====================================================');
  console.log('  SkillBridge Database Seeder');
  console.log('====================================================');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('[1/4] Checking and creating initial categories...');

    const categories = [
      { name: 'Web Development', desc: 'Full stack, frontend, backend and modern web frameworks.' },
      { name: 'Data Science & AI', desc: 'Machine Learning, Deep Learning, Data Analytics and Python.' },
      { name: 'Mobile App Development', desc: 'React Native, Flutter, iOS and Android native apps.' },
      { name: 'Cloud & DevOps', desc: 'Docker, Kubernetes, AWS, CI/CD pipelines and microservices.' },
      { name: 'UI/UX Design', desc: 'Figma, prototyping, user research, wireframing and design systems.' },
      { name: 'Cyber Security', desc: 'Ethical hacking, network defense, penetration testing and security.' },
    ];

    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (category_name, description)
         VALUES ($1, $2)
         ON CONFLICT (category_name) DO NOTHING`,
        [cat.name, cat.desc]
      );
    }
    console.log('      Categories seeded successfully.');

    console.log('[2/4] Seeding default users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const instructorPasswordHash = await bcrypt.hash('Instructor@123', salt);
    const studentPasswordHash = await bcrypt.hash('Student@123', salt);

    // 1. Admin
    const adminRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      ['System Administrator', 'admin@skillbridge.com', adminPasswordHash, 'admin']
    );

    // 2. Instructor
    const instructorRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      ['Dr. Sarah Mitchell', 'instructor@skillbridge.com', instructorPasswordHash, 'instructor']
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

    // 3. Student
    const studentRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      ['Alex Johnson', 'student@skillbridge.com', studentPasswordHash, 'student']
    );

    const studentId = studentRes.rows[0].id;
    await client.query(
      `INSERT INTO student_profiles (user_id, bio, education, interests)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio`,
      [
        studentId,
        'Aspiring software developer eager to build scalable cloud solutions.',
        'B.S. in Computer Science (Junior)',
        'React, Node.js, Cloud Computing, System Design',
      ]
    );

    console.log('      Default users seeded:');
    console.log('      - Admin: admin@skillbridge.com / Admin@123');
    console.log('      - Instructor: instructor@skillbridge.com / Instructor@123');
    console.log('      - Student: student@skillbridge.com / Student@123');

    await client.query('COMMIT');
    console.log('====================================================');
    console.log('Database seed completed successfully!');
    console.log('====================================================');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();

