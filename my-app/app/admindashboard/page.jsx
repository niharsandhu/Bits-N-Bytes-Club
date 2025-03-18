"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Calendar, Award, Settings, PlusCircle, BarChart3, Clock, CheckCircle } from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER;
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [token, setToken] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("Access denied: No token detected");
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/admin/getStats", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const data = response.data;
      console.log("Stats:", data);
      const mappedStats = [
        { name: "Total Users", value: data.totalUsers || 0, icon: Users, color: "bg-blue-500" },
        { name: "Active Events", value: data.activeEvents || 0, icon: Calendar, color: "bg-green-500" },
        { name: "Completed Events", value: data.completedEvents || 0, icon: CheckCircle, color: "bg-purple-500" },
        { name: "Total Byte Coins", value: data.totalCoins || 0, icon: Award, color: "bg-yellow-500" },
      ];

      setStats(mappedStats);
    } catch (error) {
      console.error("Fetch stats error:", error.message);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/events/getAllEvents`);
      const data = Array.isArray(response.data.events) ? response.data.events : [];
      console.log("Upcoming Events:", data);
      setUpcomingEvents(data);
    } catch (error) {
      console.error("Fetch upcoming events error:", error.message);
    }
  };

  const fetchRecentRegistrations = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/events/recentRegistrations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const data = Array.isArray(response.data.registrations) ? response.data.registrations : [];
      console.log("Recent Registrations:", data);
      setRecentRegistrations(data);
    } catch (error) {
      console.error("Fetch recent registrations error:", error.message);
    }
  };

  useEffect(() => {
    if (token) {
      setIsMounted(true);
      fetchStats();
      fetchUpcomingEvents();
      fetchRecentRegistrations();
    }
  }, [token]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Sidebar */}

        {/* Main content */}
        <main className="pt-24 pb-16 w-full flex justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full">
            <div className="flex flex-col items-center justify-between mb-8 gap-4 sm:flex-row">
              <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
              <Link
                href="/admincreate"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Event
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <motion.div
                  key={stat.name}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center">
                    <div className={`rounded-md p-3 ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-400 truncate">{stat.name}</p>
                      <p className="mt-1 text-xl font-semibold text-white">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Events */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-white">Manage Events</h2>
                    <Link href="/adminevent" className="text-sm text-red-500 hover:text-red-400">
                      View all
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {upcomingEvents.map((event) => (
                      <div key={event._id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-medium">{event.name}</h3>
                            <div className="flex items-center mt-1 text-sm text-gray-400">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(event.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-400">
                              <span className="font-medium text-white">{event.totalRegisteredStudents}</span> registrations
                            </div>
                            <Link
                              href={`/adminevent/${event._id}`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="text-xs text-gray-400 mb-1">
                            Rounds: {event.currentRounds} of {event.totalRounds}
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${(event.currentRounds / event.totalRounds) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Registrations */}
              <div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-800">
                    <h2 className="text-lg font-medium text-white">Recent Registrations</h2>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {recentRegistrations.map((registration) => (
                      <div key={registration.id} className="px-6 py-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{registration.user}</div>
                          <div className="text-sm text-gray-400">{registration.event}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(registration.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 border-t border-gray-800">
                    <Link href="/admin/registrations" className="text-sm text-red-500 hover:text-red-400">
                      View all registrations →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
