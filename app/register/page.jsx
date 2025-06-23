"use client";

// Import React and required PrimeReact components
import { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import "./form.css"; // Import CSS

// Component: RegisterForm
export default function RegisterForm() {
  // Initial form state
  const [form, setForm] = useState({
    name: "",
    category: "",
    cuisineTypes: [],
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    country: "",
    coordinates: "",
    hours: "",
    website: "",
    socialLinks: "",
    description: "",
    licenseNumber: "",
    gstNumber: "",
    status: "Active",
    logo: null,
    logoPreview: null,
  });

  const [formErrors, setFormErrors] = useState({}); // Store validation errors
  const [message, setMessage] = useState(""); // Success or error message
  const debounceTimer = useRef(null); // To delay the API call when typing pincode

  const cuisines = ["Indian", "Chinese", "Italian", "Mexican"];
  const categories = ["Restaurant", "Cafe", "Bakery", "Juice Shop", "Coolbar"];

  // Refs for scrolling to the first error field
  const fieldRefs = {
    name: useRef(null),
    category: useRef(null),
    contactPerson: useRef(null),

    phone: useRef(null),
    email: useRef(null),
    address: useRef(null),
    pincode: useRef(null),
    city: useRef(null),
    state: useRef(null),
    country: useRef(null),
  };

  // validation rules
  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.category) errors.category = "Category is required";
    if (!form.phone.match(/^\d{10}$/)) errors.phone = "Phone must be 10 digits";
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errors.email = "Email is invalid";
    if (!form.address.trim()) errors.address = "Address is required";
    else if (form.address.length < 5) errors.address = "Address is too short";
    if (!form.pincode.match(/^\d{5,6}$/)) errors.pincode = "Invalid pincode";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";
    if (!form.country.trim()) errors.country = "Country is required";

    if (form.licenseNumber && !/^\d{14}$/.test(form.licenseNumber)) {
      errors.licenseNumber = "License number must be exactly 14 digits";
    }
    if (!form.contactPerson.trim()) {
  errors.contactPerson = "Contact person is required";
} else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(form.contactPerson.trim())) {
  errors.contactPerson =
    "Only letters and single spaces allowed (no digits or special characters)";
}

if (form.coordinates && !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(form.coordinates)) {
  errors.coordinates = "Coordinates must be in format: latitude,longitude";
}

if (form.hours && !/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(form.hours)) {
  errors.hours = "Time must be in format HH:MM AM/PM";
}

if (form.description && !/^[a-zA-Z0-9\s.,!?()'-]{3,}$/.test(form.description)) {
  errors.description = "Only letters, numbers & basic punctuation allowed";
}

if (form.licenseNumber && !/^\d{14}$/.test(form.licenseNumber)) {
  errors.licenseNumber = "License number must be exactly 14 digits";
}

if (form.gstNumber && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(form.gstNumber)) {
  errors.gstNumber = "Invalid GST format. Must be 15 alphanumeric characters";
}

    return errors;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // When uploading logo image
    if (name === "logo") {
      const file = files[0];
      if (
        file &&
        !["image/png", "image/jpeg", "image/jpg"].includes(file.type)
      ) {
        setMessage("❌ Only PNG or JPG files are allowed for logo.");
        setForm({ ...form, logo: null, logoPreview: null });
        return;
      }
      // Preview logo image
      setForm({ ...form, logo: file, logoPreview: URL.createObjectURL(file) });
    }
    // When user types pincode, fetch city/state/country using Geoapify
    else if (name === "pincode") {
      setForm({ ...form, pincode: value });
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        if (value.length >= 3) {
          try {
            const res = await fetch(
              `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
                value
              )}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY}`
            );
            const data = await res.json();
            if (data.features && data.features.length > 0) {
              const { city, state, country } = data.features[0].properties;
              setForm((prev) => ({
                ...prev,
                city: city || "",
                state: state || "",
                country: country || "",
              }));
            }
          } catch (error) {
            console.error("Geoapify fetch error:", error);
          }
        }
      }, 1000);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);

    // If there are errors, scroll to the first invalid field
    if (Object.keys(errors).length > 0) {
      setMessage("Please fill all required fields.");
      const firstErrorKey = Object.keys(errors)[0];
      const ref = fieldRefs[firstErrorKey];
      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
        ref.current.focus();
      }
      return;
    }

    setMessage("⏳ Submitting...");
    const formData = new FormData();
    for (let key in form) {
      if (key === "cuisineTypes") {
        form.cuisineTypes.forEach((c) => formData.append("cuisineTypes[]", c));
      } else if (key !== "logoPreview") {
        formData.append(key, form[key]);
      }
    }

    // Send POST request to backend API
    try {
      const res = await fetch("/api/resturants", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Registered successfully!");
        setTimeout(() => window.location.reload(), 3000);
      } else {
        setMessage(`❌ ${data.error || "Registration failed"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Unexpected error occurred");
    }
  };

  // Render form
  return (
    <div className="form-container">
      <h2>Register Restaurant/Store</h2>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="p-fluid"
      >
        <label>Name</label>
        <InputText
          name="name"
          value={form.name}
          onChange={handleChange}
          className={formErrors.name && "p-invalid"}
          ref={fieldRefs.name}
        />
        {formErrors.name && (
          <small className="p-error">{formErrors.name}</small>
        )}

        <label>Category</label>
        <Dropdown
          name="category"
          value={form.category}
          options={categories.map((c) => ({ label: c, value: c }))}
          onChange={(e) => setForm({ ...form, category: e.value })}
          placeholder="Select Category"
          className={formErrors.category && "p-invalid"}
          ref={fieldRefs.category}
        />
        {formErrors.category && (
          <small className="p-error">{formErrors.category}</small>
        )}

        <label>Cuisine Types</label>
        <MultiSelect
          name="cuisineTypes"
          value={form.cuisineTypes}
          options={cuisines.map((c) => ({ label: c, value: c }))}
          onChange={(e) => setForm({ ...form, cuisineTypes: e.value })}
          placeholder="Select Cuisines"
          display="chip"
          optionLabel="label"
          panelHeaderTemplate={() => (
            <div className="cuisine-header">
              <Button
                label="Select All"
                size="small"
                className="p-button-text p-button-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setForm({ ...form, cuisineTypes: cuisines });
                }}
              />
            </div>
          )}
          className="custom-cuisine-dropdown"
        />

<label>Contact Person</label>
<InputText
  name="contactPerson"
  value={form.contactPerson}
  onChange={handleChange}
  className={formErrors.contactPerson && "p-invalid"}
  ref={fieldRefs.contactPerson}
/>
{formErrors.contactPerson && (
  <small className="p-error">{formErrors.contactPerson}</small>
)}


        <label>Phone</label>
        <InputText
          name="phone"
          value={form.phone}
          onChange={handleChange}
          inputMode="numeric"
          keyfilter="int"
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          className={formErrors.phone && "p-invalid"}
          ref={fieldRefs.phone}
        />
        {formErrors.phone && (
          <small className="p-error">{formErrors.phone}</small>
        )}
        <label>Email</label>
        <InputText
          name="email"
          value={form.email}
          onChange={handleChange}
          className={formErrors.email && "p-invalid"}
          autoComplete="email"
          ref={fieldRefs.email}
        />
        {formErrors.email && (
          <small className="p-error">{formErrors.email}</small>
        )}

        <label>Address</label>
        <InputText
          name="address"
          value={form.address}
          onChange={handleChange}
          className={formErrors.address && "p-invalid"}
          ref={fieldRefs.address}
        />
        {formErrors.address && (
          <small className="p-error">{formErrors.address}</small>
        )}

        <label>Pincode</label>
        <InputText
          name="pincode"
          value={form.pincode}
          onChange={handleChange}
          inputMode="numeric"
          keyfilter="int"
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          className={formErrors.pincode && "p-invalid"}
          ref={fieldRefs.pincode}
        />
        {formErrors.pincode && (
          <small className="p-error">{formErrors.pincode}</small>
        )}

        <label>City</label>
        <InputText
          name="city"
          value={form.city}
          onChange={handleChange}
          className={formErrors.city && "p-invalid"}
          ref={fieldRefs.city}
        />
        {formErrors.city && (
          <small className="p-error">{formErrors.city}</small>
        )}

        <label>State</label>
        <InputText
          name="state"
          value={form.state}
          onChange={handleChange}
          className={formErrors.state && "p-invalid"}
          ref={fieldRefs.state}
        />
        {formErrors.state && (
          <small className="p-error">{formErrors.state}</small>
        )}

        <label>Country</label>
        <InputText
          name="country"
          value={form.country}
          onChange={handleChange}
          className={formErrors.country && "p-invalid"}
          ref={fieldRefs.country}
        />
        {formErrors.country && (
          <small className="p-error">{formErrors.country}</small>
        )}

        <label>Google Map Coordinates (Optional)</label>
        <InputText
          name="coordinates"
          value={form.coordinates}
          onChange={handleChange}
        />

        <label>Operating Hours (Optional)</label>
        <InputText name="hours" value={form.hours} onChange={handleChange} />

        <label>Website URL (Optional)</label>
        <InputText
          name="website"
          value={form.website}
          onChange={handleChange}
        />

        <label>Social Media Links (Optional)</label>
        <InputText
          name="socialLinks"
          value={form.socialLinks}
          onChange={handleChange}
        />

        <label>Description (Optional)</label>
        <InputTextarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          autoResize
        />

        <label>License Number (Optional)</label>
        <InputText
          name="licenseNumber"
          value={form.licenseNumber}
          onChange={handleChange}
          inputMode="numeric"
          keyfilter="int"
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          className={formErrors.licenseNumber && "p-invalid"}
        />
        {formErrors.licenseNumber && (
          <small className="p-error">{formErrors.licenseNumber}</small>
        )}

        <label>GST Number (Optional)</label>
        <InputText
          name="gstNumber"
          value={form.gstNumber}
          onChange={handleChange}
        />

        <label>Status</label>
        <Dropdown
          name="status"
          value={form.status}
          options={[
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
          onChange={(e) => setForm({ ...form, status: e.value })}
        />

        <label>Upload Logo</label>
        <div className="logo-upload-preview">
          <FileUpload
            name="logo"
            mode="basic"
            accept=".jpg,.png,.jpeg"
            chooseLabel="Upload Logo"
            customUpload
            auto
            uploadHandler={(e) => {
              const file = e.files[0];
              if (
                !["image/png", "image/jpeg", "image/jpg"].includes(file.type)
              ) {
                setMessage("❌ Only PNG or JPG files are allowed for logo.");
              } else {
                setForm({
                  ...form,
                  logo: file,
                  logoPreview: URL.createObjectURL(file),
                });
              }
            }}
          />
          {form.logo && form.logoPreview && (
            <div className="logo-preview-container">
              <img
                src={form.logoPreview}
                alt="Logo Preview"
                className="logo-preview"
              />
            </div>
          )}
        </div>

        <Button label="Submit" type="submit" className="mt-2" />

        {message && (
          <div className="mt-3">
            <Message
              severity={
                message.startsWith("✅")
                  ? "success"
                  : message.startsWith("⏳")
                  ? "info"
                  : "error"
              }
              text={message}
            />
          </div>
        )}
      </form>
    </div>
  );
}
