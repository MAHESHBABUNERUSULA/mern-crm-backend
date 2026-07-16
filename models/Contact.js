const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const contactSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s-()]{7,20}$/, 'Please provide a valid phone number'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: {
        values: ['Lead', 'Prospect', 'Customer'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Lead',
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

contactSchema.index({ name: 'text', email: 'text' });
contactSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Contact', contactSchema);
