import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const USER_ROLES = Object.freeze([
  'super_admin',
  'admin',
  'principal',
  'teacher',
  'bursar',
  'parent',
  'student',
]);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      required() { return this.role === 'student'; },
    },
    password: { type: String, required: true, select: false, minlength: 12 },
    role: { type: String, required: true, enum: USER_ROLES, index: true },
    isActive: { type: Boolean, default: true, index: true },
    tokenVersion: { type: Number, default: 0 },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    className: {
      type: String,
      trim: true,
      maxlength: 80,
      required() { return this.role === 'student'; },
    },
    mustChangePassword: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, value) {
        delete value.password;
        delete value.__v;
        return value;
      },
    },
  }
);

userSchema.index({ role: 1, parentId: 1 });
userSchema.index({ role: 1, assignedStudents: 1 });

// Hash only when a password changes; password selection and JSON output are disabled above.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
