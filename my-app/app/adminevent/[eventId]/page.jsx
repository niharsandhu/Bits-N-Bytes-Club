"use client";

import { useState, useEffect ,use} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, Award, CheckCircle, ArrowLeft, Edit, Trash2, UserCheck, UserX, BarChart3, Settings } from "lucide-react";
import axios from "axios";

// Mock data


const participantsList = [
  {
    id: "p1",
    name: "Team Alpha",
    members: ["John Doe", "Jane Smith"],
    status: "qualified",
    roundStatus: ["qualified", "pending", ""],
  },
  {
    id: "p2",
    name: "Team Beta",
    members: ["Mike Johnson", "Sarah Williams"],
    status: "qualified",
    roundStatus: ["qualified", "pending", ""],
  },
  {
    id: "p3",
    name: "Team Gamma",
    members: ["Alex Brown", "Chris Davis"],
    status: "disqualified",
    roundStatus: ["qualified", "disqualified", ""],
  },
  {
    id: "p4",
    name: "Team Delta",
    members: ["Emily Wilson", "David Miller"],
    status: "qualified",
    roundStatus: ["qualified", "pending", ""],
  },
  {
    id: "p5",
    name: "Team Epsilon",
    members: ["Lisa Taylor", "Robert Anderson"],
    status: "qualified",
    roundStatus: ["qualified", "pending", ""],
  },
];

export default function EventManagement({params}) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER;
  const router = useRouter();
  const { eventId } = use(params); 
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [participants, setParticipants] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [activeRound, setActiveRound] = useState(1);
 const [token, setToken] = useState(null);

 useEffect(() => {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    setToken(storedToken);
  } else {
    setMessage("Access denied: No token detected");
  }
}, []);

  const fetchEventData = async () =>{
  const response = await axios.get(`${backendUrl}/api/events/getEvent/${eventId}`); 
  setEventData(response.data.event);
  console.log(response.data.event);
  }



  useEffect(() => {
    setIsMounted(true);
    if (eventId) { // ✅ Call fetchEventData only if id is defined
      fetchEventData();
    }
  }, [eventId]);

  if (!isMounted || !eventData) {
    return <div>Loading event data...</div>; // You can replace this with a fancy loader/spinner
  }

  const handleQualify = async (userId, activeRound) => {
    // Find index of current round
    const currentRoundIndex = eventData.rounds.findIndex(r => r.roundNumber === activeRound);
  
    // Fetch next round safely
    const nextRound = eventData.rounds[currentRoundIndex + 1]; // get next round object safely
    const nextRoundId = nextRound?._id;
  
    if (!nextRoundId) {
      console.error("Next Round ID not found or no further rounds available.");
      return;
    }
  
    try {
      const response = await axios.post(`${backendUrl}/api/events/manualQualify`,
        {
          userIds: [userId], // Ensure userId is a valid ObjectId
          teamIds: [], // No team ID required for individual events
          nextRoundId: nextRoundId,
          action: "accept"
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
        }
      );
      console.log(response.data);
      // Optionally refresh event data
      fetchEventData();
    } catch (error) {
      console.error("Error qualifying user:", error);
    }
  };
  
  
  
  const handleDisqualify = async (teamId, activeRound) => {
    const nextRoundId = eventData.rounds[activeRound + 1]?._id; // dynamically get next round id
  
    if (!nextRoundId) {
      console.error("Next Round ID not found or no further rounds available.");
      return;
    }
  
    try {
      const response = await axios.post(`${backendUrl}/api/events/manualQualify`, {
        teamIds: [teamId],
        nextRoundId: nextRoundId,
        action: "reject" ,// disqualify the team,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });
      console.log(response.data);
      // Optional: refresh event data to reflect changes
      fetchEventData();
    } catch (error) {
      console.error("Error disqualifying team:", error);
    }
  };
  

  return (
    <div className="min-h-screen bg-black text-white">
       
        <div className="flex">
        {/* Sidebar */}
       
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4">
        
        <div className="mb-8">
          <Link href="/admindashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
      
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{eventData?.name}</h1>
              <p className="text-gray-400 mt-1">{eventData?.description}</p>
            </div>

            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                href={`/admin/events/${params.id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-800"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Event
              </Link>
              <button className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-900 rounded-lg p-4 flex items-center">
              <Calendar className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <div className="text-sm text-gray-400">Date</div>
                <div>
                  {new Date(eventData.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 flex items-center">
              <Clock className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <div className="text-sm text-gray-400">Time</div>
                <div>{eventData.time}</div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 flex items-center">
              <Users className="h-5 w-5 text-red-500 mr-3" />
              <div>
              <div className="text-sm text-gray-400">
  {eventData.type === 'team' ? ' Registered Teams' : ' Registered Participants'}</div>
   <div>
  {eventData.type === "team"
    ? eventData.registeredTeams?.length
    : eventData.registeredUsers?.length}
</div>
</div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 flex items-center">
              <Award className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <div className="text-sm text-gray-400">Byte Coin Reward</div>
                <div>{eventData.byteCoins}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-red-500 text-red-500"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("rounds")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "rounds"
                  ? "border-red-500 text-red-500"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Rounds
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "participants"
                  ? "border-red-500 text-red-500"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Participants
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Event Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Description</h3>
                  <p className="mt-1">{eventData.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Location</h3>
                  <p className="mt-1">{eventData.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Current Status</h3>
                  <div className="mt-1 flex items-center">
                   
                    {eventData?.rounds?.length > 0 && eventData.rounds.findIndex((r) => r.status === "ongoing") !== -1 ? (
  <div className="flex items-center">
    <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
    <p>Active - Round {eventData.rounds.findIndex((r) => r.status === "ongoing") + 1} in progress</p>
  </div>
) : (
  <div className="flex items-center">
    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-2"></div>
    <p>No Active Round</p>
  </div>
)}

                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Event Progress</h2>
               
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-between">
                  {eventData.rounds.map((round, index) => (
                    <div key={round._id} className="flex flex-col items-center">
                      <div
                        className={`
                        flex h-8 w-8 items-center justify-center rounded-full
                        ${
                          round.status === "completed"
                            ? "bg-green-500"
                            : round.status === "ongoing"
                              ? "bg-blue-500"
                              : "bg-gray-700"
                        }
                      `}
                      >
                        {round.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="mt-2 text-sm font-medium text-center">{round?.roundName}</div>
                      <div className="mt-1 text-xs text-gray-400 text-center">{round?.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

{activeTab === "rounds" && (
  <div>
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Round Tabs */}
      <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
        {eventData.rounds.map((round, index) => (
          <button
            key={round._id}
            onClick={() => setActiveRound(index + 1)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeRound === index + 1
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {round.roundName}
          </button>
        ))}
      </div>

      {/* Round Details */}
      <div>
        <h2 className="text-xl font-bold mb-4">{eventData.rounds[activeRound - 1].roundName}</h2>

        {/* Round Status */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">Round Status</h3>
          <div className="flex items-center">
            <div
              className={`h-2.5 w-2.5 rounded-full mr-2 ${
                eventData.rounds[activeRound - 1].status === "completed"
                  ? "bg-green-500"
                  : eventData.rounds[activeRound - 1].status === "active"
                  ? "bg-blue-500"
                  : "bg-gray-500"
              }`}
            ></div>
            <p className="capitalize">{eventData.rounds[activeRound - 1].status}</p>
          </div>
        </div>

        {/* Participants / Teams Table */}
        <div className="space-y-4">
          <h3 className="font-medium">Qualified</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {eventData.type === "individual" ? "Participant Name" : "Team Name"}
                  </th>
                  {eventData.type === "team" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Members
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {eventData.type === "individual"
                  ? eventData.rounds?.[activeRound - 1]?.qualifiedUsers?.map((user) => (
                      <tr key={user._id}>
                        {/* Participant Name */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user?.userId.name}</td>

                        {/* Empty cell for alignment */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"></td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                          <div className="flex justify-end space-x-2">
                            {/* Accept Button */}
                            <button
                              onClick={() => handleQualify(user.userId._id, activeRound)}
                              className="text-green-500 hover:text-green-400"
                              title="Qualify"
                            >
                              <UserCheck className="h-5 w-5" />
                            </button>

                            {/* Decline Button */}
                            <button
                              onClick={() => handleDisqualify(user.userId._id, activeRound)}
                              className="text-red-500 hover:text-red-400"
                              title="Disqualify"
                            >
                              <UserX className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : eventData.rounds?.[activeRound - 1]?.qualifiedTeams?.map((team) => (
                      <tr key={team._id}>
                        {/* Team Name */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{team?.teamName}</td>

                        {/* Members */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {team.members.map((member) => member.name).join(", ")}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                          <div className="flex justify-end space-x-2">
                            {/* Accept Button */}
                            <button
                              onClick={() => handleQualify(team._id, activeRound,)}
                              className="text-green-500 hover:text-green-400"
                              title="Qualify"
                            >
                              <UserCheck className="h-5 w-5" />
                            </button>

                            {/* Decline Button */}
                            <button
                              onClick={() => handleDisqualify(team._id, activeRound)}
                              className="text-red-500 hover:text-red-400"
                              title="Disqualify"
                            >
                              <UserX className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
)}




        {activeTab === "participants" && (
          <div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">Registered Participants</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Team
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Members
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Round Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {participants?.map((participant) => (
                      <tr key={participant.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{participant.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {participant.members.join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              participant.status === "qualified"
                                ? "bg-green-900/30 text-green-400"
                                : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            {participant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="flex items-center space-x-1">
                            {participant.roundStatus.map((status, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  status === "qualified"
                                    ? "bg-green-500"
                                    : status === "disqualified"
                                      ? "bg-red-500"
                                      : status === "pending"
                                        ? "bg-yellow-500"
                                        : "bg-gray-600"
                                }`}
                                title={`Round ${index + 1}: ${status || "Not started"}`}
                              ></div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  )
}

