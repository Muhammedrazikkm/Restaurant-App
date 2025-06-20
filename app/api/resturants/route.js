import { NextResponse } from "next/server";
import { connectDB } from "../../../backend/lib/db";
import Restaurant from "../../../backend/models/resturant";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());
    const cuisines = formData.getAll("cuisineTypes[]");
    const logo = formData.get("logo");

    let logoUrl = "";

    if (logo && logo.name) {
      const ext = logo.name.split(".").pop().toLowerCase();
      if (!["png", "jpg", "jpeg"].includes(ext)) {
        return NextResponse.json(
          { error: "Only PNG or JPG files are allowed for logo." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await logo.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const logoPath = path.join(uploadDir, logo.name);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      await writeFile(logoPath, buffer);
      logoUrl = `/uploads/${logo.name}`;
    }

    //  to Generate restaurantId
    const cityCode = (fields.city || "").substring(0, 3).toUpperCase(); // e.g. KOC
    const categoryCode = (fields.category || "").substring(0, 3).toUpperCase(); // e.g. RES

    // Count how many restaurants already exist with that code
    const prefix = cityCode + categoryCode;
    const count = await Restaurant.countDocuments({
      restaurantId: new RegExp(`^${prefix}`),
    });

    // with 7-digit number
    const sequence = String(count + 1).padStart(7, "0");
    const restaurantId = `${prefix}${sequence}`;

    const newRestaurant = new Restaurant({
      name: fields.name,
      category: fields.category,
      cuisineTypes: cuisines,
      contactPerson: fields.contactPerson,
      phone: fields.phone,
      email: fields.email,
      address: fields.address,
      pincode: fields.pincode,
      city: fields.city,
      state: fields.state,
      country: fields.country,
      coordinates: fields.coordinates,
      hours: fields.hours,
      website: fields.website,
      socialLinks: fields.socialLinks,
      description: fields.description,
      licenseNumber: fields.licenseNumber,
      gstNumber: fields.gstNumber,
      status: fields.status,
      logoUrl,
      restaurantId,
    });

    await newRestaurant.save();
    return NextResponse.json({ message: "Restaurant Registered Successfully" });
  } catch (error) {
    console.error("Error registering restaurant:", error);

    if (error.name === "ValidationError") {
      const firstErr = Object.values(error.errors)[0].message;
      return NextResponse.json({ error: firstErr }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Error registering restaurant", detail: error.message },
      { status: 500 }
    );
  }
}
