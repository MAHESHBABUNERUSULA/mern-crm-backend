const express = require('express');
const { body } = require('express-validator');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s-()]{7,20}$/)
    .withMessage('Please provide a valid phone number'),
  body('status')
    .optional()
    .isIn(['Lead', 'Prospect', 'Customer'])
    .withMessage('Status must be Lead, Prospect, or Customer'),
  body('notes').optional({ checkFalsy: true }).isLength({ max: 2000 }),
];

router.route('/').get(getContacts).post(contactValidation, validate, createContact);

router
  .route('/:id')
  .get(getContact)
  .put(contactValidation.map((v) => v.optional()), validate, updateContact)
  .delete(deleteContact);

module.exports = router;
