const { query } = require('../config/db');

/**
 * @desc    Get all course categories with total course counts
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categoriesRes = await query(`
      SELECT 
        c.id, 
        c.category_name, 
        c.description, 
        c.created_at,
        COUNT(co.id) FILTER (WHERE co.status = 'published') AS course_count
      FROM categories c
      LEFT JOIN courses co ON co.category_id = c.id
      GROUP BY c.id
      ORDER BY c.category_name ASC
    `);

    res.status(200).json({
      status: 'success',
      data: {
        categories: categoriesRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new course category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name || category_name.trim().length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category name is required.',
      });
    }

    const checkRes = await query('SELECT id FROM categories WHERE LOWER(category_name) = $1', [
      category_name.toLowerCase().trim(),
    ]);

    if (checkRes.rowCount > 0) {
      return res.status(409).json({
        status: 'fail',
        message: 'Category already exists.',
      });
    }

    const insertRes = await query(
      'INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING *',
      [category_name.trim(), description || null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully.',
      data: {
        category: insertRes.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a course category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;

    const updateRes = await query(
      `UPDATE categories
       SET category_name = COALESCE($1, category_name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [category_name ? category_name.trim() : null, description, id]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully.',
      data: {
        category: updateRes.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteRes = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

