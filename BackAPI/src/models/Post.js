import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, default: 'Magazine' },
  author: { type: String, default: 'Epi-Flipboard team' },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  url: { type: String, default: '' },
  content: { type: String, default: '' }, // For internal articles
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export default mongoose.model('Post', postSchema)
