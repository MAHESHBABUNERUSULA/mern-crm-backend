const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get contacts for logged-in user (paginated, searchable, filterable)
// @route   GET /api/contacts?page=1&limit=10&search=&status=
// @access  Private
const getContacts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { search, status } = req.query;

  const query = { owner: req.user._id };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (status && ['Lead', 'Prospect', 'Customer'].includes(status)) {
    query.status = status;
  }

  const options = {
    page,
    limit,
    sort: { createdAt: -1 },
  };

  const result = await Contact.paginate(query, options);

  res.status(200).json({
    success: true,
    data: result.docs,
    pagination: {
      total: result.totalDocs,
      page: result.page,
      pages: result.totalPages,
      limit: result.limit,
      hasNext: result.hasNextPage,
      hasPrev: result.hasPrevPage,
    },
  });
});

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, owner: req.user._id });
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  res.status(200).json({ success: true, data: contact });
});

// @desc    Create contact
// @route   POST /api/contacts
// @access  Private
const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, company, status, notes } = req.body;

  const contact = await Contact.create({
    owner: req.user._id,
    name,
    email,
    phone,
    company,
    status,
    notes,
  });

  await ActivityLog.create({
    user: req.user._id,
    action: 'CREATE_CONTACT',
    contact: contact._id,
    description: `Created contact "${contact.name}"`,
  });

  res.status(201).json({ success: true, data: contact });
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, owner: req.user._id });
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  const fields = ['name', 'email', 'phone', 'company', 'status', 'notes'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) contact[field] = req.body[field];
  });

  const updated = await contact.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'UPDATE_CONTACT',
    contact: updated._id,
    description: `Updated contact "${updated.name}"`,
  });

  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, owner: req.user._id });
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  const name = contact.name;
  await contact.deleteOne();

  await ActivityLog.create({
    user: req.user._id,
    action: 'DELETE_CONTACT',
    description: `Deleted contact "${name}"`,
  });

  res.status(200).json({ success: true, message: 'Contact deleted', data: { id: req.params.id } });
});

module.exports = { getContacts, getContact, createContact, updateContact, deleteContact };
