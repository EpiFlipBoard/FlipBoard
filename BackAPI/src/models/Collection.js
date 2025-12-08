import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, default: 'My Collection' },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true })

export default mongoose.model('Collection', collectionSchema)

