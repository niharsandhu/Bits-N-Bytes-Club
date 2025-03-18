"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar, Clock, Users, Award, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateEvent() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER;
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: "",
    type:"",
    byteCoins: "",
    rounds: [],
    image: null, // Add image state
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      setMessage("Access denied: No token detected");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoundChange = (index, field, value) => {
    const updatedRounds = [...eventData.rounds];
    updatedRounds[index] = { ...updatedRounds[index], [field]: value };
    setEventData((prev) => ({ ...prev, rounds: updatedRounds }));
  };

  const addRound = () => {
    setEventData((prev) => ({
      ...prev,
      rounds: [...prev.rounds, {
        name: `Round ${prev.rounds.length + 1}`,
        description: "",
        topX: "10",
        roundType: "",
      }],
    }));
  };

  const removeRound = (index) => {
    if (eventData.rounds.length > 1) {
      const updatedRounds = eventData.rounds.filter((_, i) => i !== index);
      setEventData((prev) => ({ ...prev, rounds: updatedRounds }));
    }
  };

  const handleImageChange = (e) => {
    setEventData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!token) {
      console.error("Access denied: No token detected");
      setMessage("Access denied: No token detected");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", eventData.name);
    formData.append("description", eventData.description);
    formData.append("date", eventData.date);
    formData.append("time", eventData.time);
    formData.append("location", eventData.location);
    formData.append("maxParticipants", eventData.maxParticipants);
    formData.append("byteCoins", eventData.byteCoins);
    formData.append("type", "individual"); // Assuming a default type
    if (eventData.image) {
      formData.append("image", eventData.image);
    }

    try {
      // API call to create an event
      const { data } = await axios.post(
        `${backendUrl}/api/events/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("Event created successfully:", data);

      // Get the newly created event ID
      const eventId = data.event?._id;

      if (eventId && eventData.rounds.length > 0) {
        // Add all rounds to the event
        for (let i = 0; i < eventData.rounds.length; i++) {
          const round = eventData.rounds[i];
          await axios.post(
            `${backendUrl}/api/events/add-round`,
            {
              eventId,
              roundNumber: i + 1,
              roundName: round.name,
              roundType: round.roundType,
              topX: round.topX || 10, // Default to 10 if not set
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
        }
        console.log("All rounds added successfully");
      }

      // Navigate to events page after successful creation
      router.push("/admin/events");
    } catch (error) {
      console.log("Error creating event:", error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-gray-400 mt-2">Fill in the details to create a new event</p>
        </div>

        {message && (
          <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Event Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={eventData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Enter Event Name"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                  Event Type
                </label>
                <input
                  id="type"
                  name="type"
                  type="text"
                  required
                  value={eventData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Enter Event Type"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={eventData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Describe the event..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      required
                      value={eventData.date}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">
                    Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      required
                      value={eventData.time}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={eventData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Main Auditorium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-300 mb-1">
                    Max Participants
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      min="1"
                      required
                      value={eventData.maxParticipants}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="byteCoins" className="block text-sm font-medium text-gray-300 mb-1">
                    Byte Coin Reward
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="byteCoins"
                      name="byteCoins"
                      type="number"
                      min="0"
                      required
                      value={eventData.byteCoins}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
                  Event Image
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Event Rounds</h3>
                  <button
                    type="button"
                    onClick={addRound}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Round
                  </button>
                </div>

                <div className="space-y-4">
                  {eventData.rounds.map((round, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Round {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeRound(index)}
                          className="text-gray-400 hover:text-red-500"
                          disabled={eventData.rounds.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor={`round-name-${index}`}
                            className="block text-sm font-medium text-gray-300 mb-1"
                          >
                            Round Name
                          </label>
                          <input
                            id={`round-name-${index}`}
                            type="text"
                            value={round.name}
                            onChange={(e) => handleRoundChange(index, "name", e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`round-topx-${index}`}
                            className="block text-sm font-medium text-gray-300 mb-1"
                          >
                            Top X Qualifiers
                          </label>
                          <input
                            id={`round-topx-${index}`}
                            type="number"
                            min="1"
                            value={round.topX || 10}
                            onChange={(e) => handleRoundChange(index, "topX", parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`round-topx-${index}`}
                            className="block text-sm font-medium text-gray-300 mb-1"
                          >
                            Round Type
                          </label>
                          <input
                            id={`round-type-${index}`}
                            type="text"
                            min="1"
                            value={round.roundType}
                            onChange={(e) => handleRoundChange(index, "roundType",e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Create Event
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
