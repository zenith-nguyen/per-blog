import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  content: string;
  guest_name: string;
  guest_email?: string;
  is_approved: boolean;
  post_slug: string;
  parent_id?: mongoose.Types.ObjectId;
}

const CommentSchema: Schema = new Schema({
  content: { type: String, required: true },
  guest_name: { type: String, required: true },
  guest_email: { type: String },
  is_approved: { type: Boolean, default: false },
  post_slug: { type: String, required: true, index: true }, // ref 'Post' conceptually
  parent_id: { type: Schema.Types.ObjectId, ref: 'Comment' },
}, { timestamps: true });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;
