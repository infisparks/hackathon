// app/add-doctor/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebaseconfig";
import { ref, push } from "firebase/database";

export default function AddDoctorPage() {
  const router = useRouter();

  // Form state for adding a doctor
  const [doctorName, setDoctorName] = useState("");
  const [doctorCharges, setDoctorCharges] = useState("");
  const [doctorType, setDoctorType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorName || !doctorCharges || !doctorType) {
      alert("Please fill all required fields.");
      return;
    }

    const doctorData = {
      name: doctorName,
      charges: parseFloat(doctorCharges),
      type: doctorType,
      createdAt: Date.now(),
    };

    try {
      const doctorsRef = ref(db, "doctors");
      await push(doctorsRef, doctorData);
      alert("Doctor added successfully!");
      // Optionally, clear the form or redirect
      setDoctorName("");
      setDoctorCharges("");
      setDoctorType("");
      // For example, redirect to the OPD booking page:
      // router.push("/opd-booking");
    } catch (err: any) {
      alert("Error adding doctor: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "2rem" }}>
      <h2>Add Doctor</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Doctor Name:</label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </div>
        <div>
          <label>Doctor Charges:</label>
          <input
            type="number"
            value={doctorCharges}
            onChange={(e) => setDoctorCharges(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </div>
        <div>
          <label>Type:</label>
          <select
            value={doctorType}
            onChange={(e) => setDoctorType(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          >
            <option value="">Select Type</option>
            <option value="OPD">OPD</option>
            <option value="IPD">IPD</option>
            <option value="Both">Both</option>
          </select>
        </div>
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add Doctor
        </button>
      </form>
    </div>
  );
}
