const { query, getClient } = require('../config/db');

/**
 * @desc    Get all courses with search, filters, sorting & pagination
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const offset = (page - 1) * limit;

    const {
      search,
      category,
      category_id,
      difficulty,
      min_price,
      max_price,
      status = 'published',
      sort = 'newest',
      instructor_id,
    } = req.query;

    let baseQuery = `
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.thumbnail, 
        c.price, 
        c.difficulty_level, 
        c.duration, 
        c.status, 
        c.created_at,
        u.id AS instructor_id,
        u.full_name AS instructor_name,
        u.profile_image AS instructor_image,
        cat.id AS category_id,
        cat.category_name,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(DISTINCT r.id) AS reviews_count,
        COUNT(DISTINCT e.id) AS total_enrolled
      FROM courses c
      JOIN users u ON u.id = c.instructor_id
      LEFT JOIN categories cat ON cat.id = c.category_id
      LEFT JOIN reviews r ON r.course_id = c.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE 1=1
    `;

    const params = [];

    // Filter by status (public view only sees published courses)
    if (status && status !== 'all') {
      params.push(status);
      baseQuery += ` AND c.status = $${params.length}`;
    }

    // Filter by instructor
    if (instructor_id) {
      params.push(parseInt(instructor_id, 10));
      baseQuery += ` AND c.instructor_id = $${params.length}`;
    }

    // Search query
    if (search) {
      params.push(`%${search.toLowerCase().trim()}%`);
      baseQuery += ` AND (LOWER(c.title) LIKE $${params.length} OR LOWER(c.description) LIKE $${params.length})`;
    }

    // Filter by category
    if (category_id) {
      params.push(parseInt(category_id, 10));
      baseQuery += ` AND c.category_id = $${params.length}`;
    } else if (category) {
      params.push(category.toLowerCase().trim());
      baseQuery += ` AND LOWER(cat.category_name) = $${params.length}`;
    }

    // Filter by difficulty
    if (difficulty) {
      params.push(difficulty.toLowerCase().trim());
      baseQuery += ` AND c.difficulty_level = $${params.length}`;
    }

    // Filter by price range
    if (min_price !== undefined && min_price !== '') {
      params.push(parseFloat(min_price));
      baseQuery += ` AND c.price >= $${params.length}`;
    }
    if (max_price !== undefined && max_price !== '') {
      params.push(parseFloat(max_price));
      baseQuery += ` AND c.price <= $${params.length}`;
    }

    baseQuery += ` GROUP BY c.id, u.id, cat.id`;

    // Sorting
    switch (sort) {
      case 'price-low':
        baseQuery += ` ORDER BY c.price ASC`;
        break;
      case 'price-high':
        baseQuery += ` ORDER BY c.price DESC`;
        break;
      case 'rating':
        baseQuery += ` ORDER BY average_rating DESC, reviews_count DESC`;
        break;
      case 'popular':
        baseQuery += ` ORDER BY total_enrolled DESC`;
        break;
      case 'newest':
      default:
        baseQuery += ` ORDER BY c.created_at DESC`;
        break;
    }

    // Execute paginated query
    const totalCountRes = await query(
      `SELECT COUNT(*) FROM (${baseQuery}) AS count_tbl`,
      params
    );
    const totalCourses = parseInt(totalCountRes.rows[0].count, 10);

    params.push(limit);
    baseQuery += ` LIMIT $${params.length}`;
    params.push(offset);
    baseQuery += ` OFFSET $${params.length}`;

    const coursesRes = await query(baseQuery, params);

    res.status(200).json({
      status: 'success',
      total: totalCourses,
      page,
      totalPages: Math.ceil(totalCourses / limit),
      data: {
        courses: coursesRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single course details by ID with curriculum, lessons, reviews & instructor
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    const courseRes = await query(
      `SELECT 
        c.*,
        u.id AS instructor_id,
        u.full_name AS instructor_name,
        u.email AS instructor_email,
        u.profile_image AS instructor_image,
        ip.expertise AS instructor_expertise,
        ip.bio AS instructor_bio,
        cat.category_name,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(DISTINCT r.id) AS reviews_count,
        COUNT(DISTINCT e.id) AS total_enrolled
      FROM courses c
      JOIN users u ON u.id = c.instructor_id
      LEFT JOIN instructor_profiles ip ON ip.user_id = u.id
      LEFT JOIN categories cat ON cat.id = c.category_id
      LEFT JOIN reviews r ON r.course_id = c.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, u.id, ip.id, cat.id`,
      [courseId]
    );

    if (courseRes.rowCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found.',
      });
    }

    const course = courseRes.rows[0];

    // Fetch Sections and their Lessons
    const sectionsRes = await query(
      `SELECT 
        s.id,
        s.section_title,
        s.section_order,
        json_agg(
          json_build_object(
            'id', l.id,
            'title', l.title,
            'description', l.description,
            'video_url', l.video_url,
            'resource_url', l.resource_url,
            'duration', l.duration,
            'lesson_order', l.lesson_order
          ) ORDER BY l.lesson_order ASC
        ) FILTER (WHERE l.id IS NOT NULL) AS lessons
      FROM course_sections s
      LEFT JOIN lessons l ON l.section_id = s.id
      WHERE s.course_id = $1
      GROUP BY s.id
      ORDER BY s.section_order ASC`,
      [courseId]
    );

    course.sections = sectionsRes.rows.map((sec) => ({
      ...sec,
      lessons: sec.lessons || [],
    }));

    // Fetch Quizzes for this course
    const quizzesRes = await query(
      `SELECT id, section_id, title, description, duration, passing_score
       FROM quizzes
       WHERE course_id = $1`,
      [courseId]
    );
    course.quizzes = quizzesRes.rows;

    // Fetch Assignments for this course
    const assignmentsRes = await query(
      `SELECT id, title, description, due_date, total_marks
       FROM assignments
       WHERE course_id = $1`,
      [courseId]
    );
    course.assignments = assignmentsRes.rows;

    // Fetch Reviews
    const reviewsRes = await query(
      `SELECT 
        r.id, 
        r.rating, 
        r.review_text, 
        r.created_at,
        u.id AS user_id,
        u.full_name AS student_name,
        u.profile_image AS student_image
      FROM reviews r
      JOIN users u ON u.id = r.student_id
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10`,
      [courseId]
    );
    course.reviews = reviewsRes.rows;

    res.status(200).json({
      status: 'success',
      data: {
        course,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private (Instructor or Admin)
 */
const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category_id,
      price = 0,
      difficulty_level = 'beginner',
      duration = '10 hours',
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        status: 'fail',
        message: 'Course title and description are required.',
      });
    }

    const instructorId = req.user.role === 'admin' && req.body.instructor_id
      ? parseInt(req.body.instructor_id, 10)
      : req.user.id;

    // Handle thumbnail from Multer if uploaded
    let thumbnail = req.body.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
    if (req.file) {
      thumbnail = `/uploads/${req.file.filename}`;
    }

    // Default status: published for admin, pending or published for instructor
    const status = req.user.role === 'admin' ? 'published' : 'published';

    const insertRes = await query(
      `INSERT INTO courses (
        instructor_id, category_id, title, description, thumbnail, price, difficulty_level, duration, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        instructorId,
        category_id ? parseInt(category_id, 10) : null,
        title.trim(),
        description.trim(),
        thumbnail,
        parseFloat(price) || 0,
        difficulty_level,
        duration,
        status,
      ]
    );

    const newCourse = insertRes.rows[0];

    // Create a default initial section so instructor can immediately add lessons
    await query(
      `INSERT INTO course_sections (course_id, section_title, section_order)
       VALUES ($1, $2, 1)`,
      [newCourse.id, 'Section 1: Course Introduction']
    );

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully.',
      data: {
        course: newCourse,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course details
 * @route   PUT /api/courses/:id
 * @access  Private (Owner Instructor or Admin)
 */
const updateCourse = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    // Check ownership
    const checkRes = await query('SELECT instructor_id FROM courses WHERE id = $1', [courseId]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }

    if (req.user.role !== 'admin' && checkRes.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to modify this course.',
      });
    }

    const {
      title,
      description,
      category_id,
      price,
      difficulty_level,
      duration,
      status,
    } = req.body;

    let thumbnailUpdate = req.body.thumbnail;
    if (req.file) {
      thumbnailUpdate = `/uploads/${req.file.filename}`;
    }

    const updateRes = await query(
      `UPDATE courses
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           price = COALESCE($4, price),
           difficulty_level = COALESCE($5, difficulty_level),
           duration = COALESCE($6, duration),
           thumbnail = COALESCE($7, thumbnail),
           status = COALESCE($8, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        title ? title.trim() : null,
        description ? description.trim() : null,
        category_id ? parseInt(category_id, 10) : null,
        price !== undefined ? parseFloat(price) : null,
        difficulty_level,
        duration,
        thumbnailUpdate,
        status,
        courseId,
      ]
    );

    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully.',
      data: {
        course: updateRes.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a course
 * @route   DELETE /api/courses/:id
 * @access  Private (Owner Instructor or Admin)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    const checkRes = await query('SELECT instructor_id FROM courses WHERE id = $1', [courseId]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }

    if (req.user.role !== 'admin' && checkRes.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this course.',
      });
    }

    await query('DELETE FROM courses WHERE id = $1', [courseId]);

    res.status(200).json({
      status: 'success',
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change course publication status (Admin approval/rejection)
 * @route   PATCH /api/courses/:id/status
 * @access  Private/Admin
 */
const updateCourseStatus = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['draft', 'pending', 'published', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status. Permitted: draft, pending, published, rejected.',
      });
    }

    const updateRes = await query(
      `UPDATE courses 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, courseId]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }

    res.status(200).json({
      status: 'success',
      message: `Course status successfully updated to "${status}".`,
      data: {
        course: updateRes.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COURSE SECTIONS CONTROLLERS
// ==========================================

const createSection = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const { section_title, section_order } = req.body;

    if (!section_title) {
      return res.status(400).json({ status: 'fail', message: 'Section title is required.' });
    }

    const orderRes = await query(
      'SELECT COALESCE(MAX(section_order), 0) + 1 AS next_order FROM course_sections WHERE course_id = $1',
      [courseId]
    );
    const order = section_order || orderRes.rows[0].next_order;

    const insertRes = await query(
      `INSERT INTO course_sections (course_id, section_title, section_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [courseId, section_title.trim(), order]
    );

    res.status(201).json({
      status: 'success',
      data: {
        section: insertRes.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSectionsByCourse = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const sectionsRes = await query(
      `SELECT s.*, 
        json_agg(l.* ORDER BY l.lesson_order ASC) FILTER (WHERE l.id IS NOT NULL) AS lessons
       FROM course_sections s
       LEFT JOIN lessons l ON l.section_id = s.id
       WHERE s.course_id = $1
       GROUP BY s.id
       ORDER BY s.section_order ASC`,
      [courseId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        sections: sectionsRes.rows.map((s) => ({ ...s, lessons: s.lessons || [] })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateSection = async (req, res, next) => {
  try {
    const sectionId = parseInt(req.params.id, 10);
    const { section_title, section_order } = req.body;

    const updateRes = await query(
      `UPDATE course_sections
       SET section_title = COALESCE($1, section_title),
           section_order = COALESCE($2, section_order)
       WHERE id = $3
       RETURNING *`,
      [section_title, section_order, sectionId]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Section not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: { section: updateRes.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

const deleteSection = async (req, res, next) => {
  try {
    const sectionId = parseInt(req.params.id, 10);
    await query('DELETE FROM course_sections WHERE id = $1', [sectionId]);
    res.status(200).json({ status: 'success', message: 'Section deleted.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LESSONS CONTROLLERS
// ==========================================

const createLesson = async (req, res, next) => {
  try {
    const sectionId = parseInt(req.params.id, 10);
    const {
      title,
      description,
      video_url,
      resource_url,
      duration = '15 mins',
      lesson_order,
    } = req.body;

    if (!title) {
      return res.status(400).json({ status: 'fail', message: 'Lesson title is required.' });
    }

    const orderRes = await query(
      'SELECT COALESCE(MAX(lesson_order), 0) + 1 AS next_order FROM lessons WHERE section_id = $1',
      [sectionId]
    );
    const order = lesson_order || orderRes.rows[0].next_order;

    const insertRes = await query(
      `INSERT INTO lessons (
        section_id, title, description, video_url, resource_url, duration, lesson_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        sectionId,
        title.trim(),
        description || null,
        video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        resource_url || null,
        duration,
        order,
      ]
    );

    res.status(201).json({
      status: 'success',
      data: {
        lesson: insertRes.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

const getLessonById = async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const lessonRes = await query('SELECT * FROM lessons WHERE id = $1', [lessonId]);

    if (lessonRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Lesson not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: { lesson: lessonRes.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const { title, description, video_url, resource_url, duration, lesson_order } = req.body;

    const updateRes = await query(
      `UPDATE lessons
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           video_url = COALESCE($3, video_url),
           resource_url = COALESCE($4, resource_url),
           duration = COALESCE($5, duration),
           lesson_order = COALESCE($6, lesson_order)
       WHERE id = $7
       RETURNING *`,
      [title, description, video_url, resource_url, duration, lesson_order, lessonId]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Lesson not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: { lesson: updateRes.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

const deleteLesson = async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    await query('DELETE FROM lessons WHERE id = $1', [lessonId]);
    res.status(200).json({ status: 'success', message: 'Lesson deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  createSection,
  getSectionsByCourse,
  updateSection,
  deleteSection,
  createLesson,
  getLessonById,
  updateLesson,
  deleteLesson,
};

