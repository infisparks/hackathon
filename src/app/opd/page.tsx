// app/opd-booking/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebaseconfig";
import { ref, push, onValue, set } from "firebase/database";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserData {
  id: string;
  name: string;
  number: string;
  email: string;
  age: string;
  gender: string;
}

interface DoctorData {
  id: string;
  name: string;
  charges: number;
  type: string;
}

export default function OpdBookingPage() {
  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [message, setMessage] = useState("");

  // Lists for doctors and users
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [existingUsers, setExistingUsers] = useState<UserData[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // --- Voice Recognition Commands ---
  const commands = useMemo(
    () => [
      {
        command: "name *",
        callback: (val: string) => {
          const trimmed = val.trim();
          setName(trimmed);
          toast.info(`Name set to: ${trimmed}`);
        },
      },
      {
        command: "phone *",
        callback: (val: string) => {
          const sanitized = val.replace(/\D/g, "").trim();
          setPhone(sanitized);
          toast.info(`Phone set to: ${sanitized}`);
        },
      },
      {
        command: "email *",
        callback: (val: string) => {
          const trimmed = val.trim();
          setEmail(trimmed);
          toast.info(`Email set to: ${trimmed}`);
        },
      },
      {
        command: "age *",
        callback: (val: string) => {
          const trimmed = val.trim();
          setAge(trimmed);
          toast.info(`Age set to: ${trimmed}`);
        },
      },
      {
        command: "gender *",
        callback: (val: string) => {
          const trimmed = val.trim();
          setGender(trimmed);
          toast.info(`Gender set to: ${trimmed}`);
        },
      },
      {
        command: "doctor *",
        callback: (val: string) => {
          const normalized = val.trim().toLowerCase();
          const doc = doctors.find((d) =>
            d.name.toLowerCase().includes(normalized)
          );
          if (doc) {
            setSelectedDoctor(doc.id);
            setAmount(doc.charges.toString());
            toast.info(`Doctor set to: ${doc.name}`);
          } else {
            toast.error(`Doctor "${val}" not found.`);
          }
        },
      },
      {
        command: "amount *",
        callback: (val: string) => {
          const trimmed = val.trim();
          setAmount(trimmed);
          toast.info(`Amount set to: ${trimmed}`);
        },
      },
      {
        command: "payment *",
        callback: (val: string) => {
          const trimmed = val.trim();
          setPaymentMethod(trimmed);
          toast.info(`Payment method set to: ${trimmed}`);
        },
      },
      {
        command: "message *",
        callback: (val: string) => {
          const trimmed = val.trim();
          setMessage(trimmed);
          toast.info("Message set.");
        },
      },
    ],
    [doctors]
  );

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ commands });

  // Toggle listening for voice commands
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      toast.info("Voice recognition stopped.");
    } else {
      if (browserSupportsSpeechRecognition) {
        SpeechRecognition.startListening({ continuous: true });
        toast.info("Voice recognition started.");
      } else {
        toast.error("Browser does not support speech recognition.");
      }
    }
  };

  // --- Fetch Doctors from Firebase ---
  useEffect(() => {
    const doctorsRef = ref(db, "doctors");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const doctorsArray = Object.entries(data).map(([id, doctor]) => ({
          id,
          ...(doctor as { name: string; charges: number; type: string }),
        }));
        setDoctors(doctorsArray);
      } else {
        setDoctors([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Fetch Existing Users from Firebase ---
  useEffect(() => {
    const usersRef = ref(db, "user");
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray: UserData[] = Object.entries(data).map(([id, user]) => ({
          id,
          ...(user as {
            name: string;
            number: string;
            email: string;
            age: string;
            gender: string;
          }),
        }));
        setExistingUsers(usersArray);
      } else {
        setExistingUsers([]);
      }
    });
    return () => unsubscribeUsers();
  }, []);

  // --- Auto-update Amount when Doctor is Selected ---
  useEffect(() => {
    if (selectedDoctor) {
      const doc = doctors.find((d) => d.id === selectedDoctor);
      if (doc) {
        setAmount(doc.charges.toString());
      }
    }
  }, [selectedDoctor, doctors]);

  // --- Handle Customer Name Change & Suggestions ---
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    // Reset selected user if typing manually
    setSelectedUserId(null);
    if (value.length >= 2) {
      const suggestions = existingUsers.filter((user) =>
        user.name.toLowerCase().includes(value.toLowerCase())
      );
      setUserSuggestions(suggestions);
    } else {
      setUserSuggestions([]);
    }
  };

  // When a suggestion is clicked, fill in the form fields
  const handleUserSelect = (user: UserData) => {
    setName(user.name);
    setPhone(user.number);
    setEmail(user.email);
    setAge(user.age);
    setGender(user.gender);
    setSelectedUserId(user.id);
    setUserSuggestions([]);
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !phone ||
      !email ||
      !age ||
      !gender ||
      !selectedDoctor ||
      !amount
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctor);
    const opdData: {
      opdid?: string;
      timespan: number;
      message: string;
      doctorname: string;
      doctorid: string;
      paymentmethod: string;
      amount: number;
    } = {
      timespan: Date.now(),
      message,
      doctorname: selectedDoctorObj ? selectedDoctorObj.name : "",
      doctorid: selectedDoctor,
      paymentmethod: paymentMethod,
      amount: parseFloat(amount),
    };

    try {
      if (selectedUserId) {
        const opdRef = ref(db, `user/${selectedUserId}/opd`);
        const newOpdRef = push(opdRef);
        const opdId = newOpdRef.key;
        if (!opdId) {
          throw new Error("Failed to generate OPD id.");
        }
        opdData.opdid = opdId;
        await set(newOpdRef, opdData);
        alert("OPD booking submitted for existing user!");
      } else {
        const usersRef = ref(db, "user");
        const newUserRef = push(usersRef);
        const userId = newUserRef.key;
        if (!userId) {
          throw new Error("Failed to generate user id.");
        }
        const opdRef = ref(db, `user/${userId}/opd`);
        const newOpdRef = push(opdRef);
        const opdId = newOpdRef.key;
        if (!opdId) {
          throw new Error("Failed to generate OPD id.");
        }
        opdData.opdid = opdId;
        const userData = {
          name,
          userid: userId,
          number: phone,
          age,
          email,
          gender,
          opd: {
            [opdId]: opdData,
          },
        };
        await set(newUserRef, userData);
        alert("New user created and OPD booking submitted!");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Error submitting booking: " + err.message);
      } else {
        alert("Error submitting booking.");
      }
    }

    // Reset form fields
    setName("");
    setPhone("");
    setEmail("");
    setAge("");
    setGender("");
    setSelectedDoctor("");
    setAmount("");
    setPaymentMethod("Cash");
    setMessage("");
    setSelectedUserId(null);
    setUserSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-8 relative">
        {/* Voice Control Buttons */}
        <div className="mb-4 flex justify-center space-x-4">
          <button
            type="button"
            onClick={toggleListening}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            {listening ? "Stop Voice Control" : "Start Voice Control"}
          </button>
          <button
            type="button"
            onClick={resetTranscript}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Reset Transcript
          </button>
        </div>
        {/* Display Transcript */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Transcript</h3>
          <p className="text-gray-700">{transcript}</p>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          OPD Booking
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {/* Customer Name with Auto-Suggest */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={handleNameChange}
              required
            />
            {userSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-md shadow-lg">
                {userSuggestions.map((user) => (
                  <li
                    key={user.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.name} - {user.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          {/* Age & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Doctor
            </label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.type}) - Charges: {doctor.charges}
                </option>
              ))}
            </select>
          </div>
          {/* Amount (auto-filled when a doctor is selected) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message (Optional)
            </label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message (optional)"
            ></textarea>
          </div>
          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200"
            >
              Submit Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
