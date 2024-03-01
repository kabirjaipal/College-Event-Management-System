import { Schema, model } from "mongoose";

const applicationSchema = new Schema({
  name: {
    type: String,
    required: [true, "Full Name is required"],
    trim: true,
  },
  designation: String,
  Organization: String,
  department: String,
  mobileNumber: Number,
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: {
      validator: function (v) {
        // Simple email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid Email address!`,
    },
  },
  participantStatus: {
    type: String,
    enum: ["academician", "student"],
    required: [true, "Participant Status is required"],
  },
  presentation: {
    type: String,
    enum: ["yes", "no"],
    required: [true, "Presentation field is required"],
  },
  address: String,
  RegistrationFee: {
    type: Number,
    required: [true, "Registration Fee is required"],
  },
  pdfFile: {
    data: Buffer,
    contentType: String,
    filename: String,
  },
  ImageFile: {
    data: Buffer,
    contentType: String,
    filename: String,
  },
  paymentdate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  Transactionid: String,
});

export default model("Application", applicationSchema);
