const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['CREATE_CONTACT', 'UPDATE_CONTACT', 'DELETE_CONTACT'],
      required: true,
    },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

activityLogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
