const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true }, // Denormalized for easy display
  action: { 
    type: String, 
    required: true,
    enum: ['CREATE_MARKET', 'RESOLVE_MARKET', 'DELETE_MARKET', 'GRANT_ADMIN', 'REVOKE_ADMIN']
  },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // Market ID or User ID
  details: { type: mongoose.Schema.Types.Mixed }, // Additional context (e.g., market question, outcome)
  timestamp: { type: Date, default: Date.now }
});

// Index for efficient querying
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
