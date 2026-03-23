import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: number; // Links to Prisma User
  name: string;
  circuitType: string;
  numFlipFlops: number;
  circuitParams: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  userId: { type: Number, required: true, index: true },
  name: { type: String, required: true },
  circuitType: { type: String, default: 'Shift Register' },
  numFlipFlops: { type: Number, default: 4 },
  circuitParams: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true 
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
