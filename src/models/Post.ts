import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  slug: string;
  title: string;
  views: number;
  likes: number;
}

const PostSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
export default Post;
