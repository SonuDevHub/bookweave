
import mongoose from 'mongoose'

const enquirySchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: 30,
    },
    bookTitle: {
      type: String,
      trim: true,
      default: '',
      maxlength: 150,
    },
    genre: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },
    manuscriptStatus: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },
    services: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.length <= 10 &&
          items.every(
            (item) => typeof item === 'string' && item.trim().length <= 80
          ),
        message: 'Invalid services selection.',
      },
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'contacted', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
)

const Enquiry = mongoose.model('Enquiry', enquirySchema)

export default Enquiry
