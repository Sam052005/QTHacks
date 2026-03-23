import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IChatMemory extends Document {
  projectId: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  updatedAt: Date;
}

const ChatMessageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ChatMemorySchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  messages: [ChatMessageSchema]
}, {
  timestamps: true
});

export const ChatMemory = mongoose.model<IChatMemory>('ChatMemory', ChatMemorySchema);
