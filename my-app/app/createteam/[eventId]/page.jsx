"use client";

import { useState, useEffect ,use} from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Check, AlertCircle, Info } from "lucide-react";
import axios from "axios";

// Mock events data for displaying event details
const availableEvents = [
  { id: "1", name: "Spring Hackathon 2025", date: "2025-04-15", registrationOpen: true, maxTeamSize: 4 },
  { id: "2", name: "AI Workshop", date: "2025-03-25", registrationOpen: true, maxTeamSize: 2 },
  { id: "3", name: "Design Challenge", date: "2025-05-05", registrationOpen: false, maxTeamSize: 3 },
  { id: "4", name: "Coding Competition", date: "2025-06-10", registrationOpen: true, maxTeamSize: 3 },
];

export default function CreateTeam({ params }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER;
  const router = useRouter();
  const { eventId } = use(params);
  const [token, setToken] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ rollNo: "" });
  const [errors, setErrors] = useState({});

  // Get the event details using the eventId from params
  const currentEvent = availableEvents.find((event) => event.id === eventId);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      setMessage("Access denied: No token detected");
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const addMember = () => {
    // Validate new member data
    if (!newMember.rollNo.trim()) {
      setErrors({
        ...errors,
        newMember: "Roll number is required"
      });
      return;
    }

    // Check if we've reached the maximum team size (4 members)
    if (members.length >= 4) {
      setErrors({
        ...errors,
        newMember: "Maximum team size is 4 members"
      });
      return;
    }

    // Add the new member
    const memberId = Date.now().toString();
    setMembers([...members, { id: memberId, rollNo: newMember.rollNo }]);
    
    // Clear the form and any errors
    setNewMember({ rollNo: "" });
    setErrors({ ...errors, newMember: null });
  };

  const removeMember = (id) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!teamName.trim()) {
      setErrors({ ...errors, teamName: "Team name is required" });
      return;
    }

    if (members.length === 0) {
      setErrors({ ...errors, members: "Please add at least one team member" });
      return;
    }

    setIsLoading(true);


    try {
      // 1. CREATE TEAM
      const teamResponse = await axios.post(
        `${backendUrl}/api/team/create`,
        {
          name: teamName,
          eventId: eventId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
  
  
      const teamData = teamResponse.data;
      const teamId = teamData.team._id; // ✅ Correct way to access team ID
  
      if (!teamId) {
        throw new Error("❌ Team ID not found in response!");
      }
  
      console.log("🎉 Team created successfully with ID:", teamId);
  
      // 2. ADD MEMBERS
      for (const member of members) {
        const memberResponse = await axios.post(
          `${backendUrl}/api/team/add-member`, // Dynamic route if required
          {
            teamId: teamId,
            memberRollNo: member.rollNo, // or memberRollNO depending on backend
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
  
        console.log(`✅ Member added: ${member.rollNo}`, memberResponse.data);
      }
  
      console.log("🎉 All members added successfully!");
      alert("Team created and members added successfully!");
      router.push("/userdasboard");
  
    } catch (error) {
      console.log(error.response.data);
      console.error("❌ Error creating team or adding members:", error);
      alert("Something went wrong while creating the team. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create a Team</h1>
          <p className="text-gray-400 mt-2">Form a team to participate in {currentEvent?.name || "the event"}</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Information */}
            {currentEvent && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">Event Information</h2>
                <div className="p-3 bg-blue-900/30 border border-blue-800 rounded-lg flex items-start">
                  <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium">{currentEvent.name}</p>
                    <p className="text-blue-200 text-xs mt-1">
                      Date:{" "}
                      {new Date(currentEvent.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-blue-200 text-xs">Maximum team size: 4 members</p>
                    <p className="text-blue-200 text-xs">
                      Registration Status: {currentEvent.registrationOpen ? "Open" : "Closed"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Team Information */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">Team Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-1">
                    Team Name
                  </label>
                  <input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-800 border ${errors.teamName ? "border-red-500" : "border-gray-700"} rounded-lg focus:ring-red-500 focus:border-red-500 text-white`}
                    placeholder="Enter your team name"
                  />
                  {errors.teamName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.teamName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Team Members</h2>
                <span className="text-sm text-gray-400">
                  {members.length} / 4 members
                </span>
              </div>

              {/* Existing Members List */}
              <div className="space-y-4 mb-6">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold mr-3">
                        M
                      </div>
                      <div>
                        <p className="font-medium">Roll No: {member.rollNo}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="text-gray-400 hover:text-red-500"
                        title="Remove member"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {errors.members && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.members}
                  </p>
                )}
              </div>

              {/* Add New Member Form */}
              <div className="border-t border-gray-800 pt-4">
                <h3 className="font-medium text-lg mb-3">Add Team Member</h3>

                <div className="flex items-end gap-4">
                  <div className="flex-grow">
                    <label htmlFor="memberRollNo" className="block text-sm font-medium text-gray-300 mb-1">
                      Roll Number
                    </label>
                    <input
                      id="memberRollNo"
                      value={newMember.rollNo}
                      onChange={(e) => setNewMember({ rollNo: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                      placeholder="e.g. 21CS01002"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addMember}
                    disabled={members.length >= 4}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Member
                  </button>
                </div>

                {errors.newMember && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.newMember}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/events"
                className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Check className="h-5 w-5 mr-2" />
                )}
                Create Team
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}