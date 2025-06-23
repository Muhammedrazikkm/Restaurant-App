import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: String,
    cuisineTypes: [String],
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      validate: {
        validator: function (v) {
          return /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(v.trim());
        },
        message: (props) =>
          `${props.value} is not a valid name! Only letters and single spaces allowed, and it should not be empty.`,
      },
    },
    

    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); 
        },
        message: props => `${props.value} is not a valid 10-digit phone number!`,
      },
    },

    email: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`,
      },
    },

    address: { type: String, required: true },
    pincode: String,
    city: { type: String, required: true },
    state: String,
    country: String,
    coordinates: String,
    hours: String,

    website: {
      type: String,
      validate: {
        validator: function (v) {
          return v === "" || /^www\.[a-zA-Z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?$/.test(v);
        },
        message: props =>
          `${props.value} is not a valid website! Only format like "www.example.com" is allowed.`,
      },
    },

    socialLinks: String,
    description: String,
    licenseNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return v === "" || v === null || /^\d{14}$/.test(v);
        },
        message: props =>
          `${props.value} is invalid. License number must be 14 digits.`,
      },
    },
    gstNumber: String,

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    logoUrl: String,
    restaurantId: { type: String, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);
