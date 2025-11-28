"use client";

import { useState } from "react";

const ViewCalendar = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // const mstDates = [
  //   "2025-09-14", // MST-1
  //   "2025-10-14", // MST-2
  //   "2025-11-06", // MST-3
  // ];

  const holidayMap = {
  "2025-08-15": "Independence Day",
  "2025-09-06": "Janmashtami",
  "2025-10-02": "Gandhi Jayanti",
  "2025-10-11": "Anant Chaturdashi",
  "2025-8-20": "Raksha Bandhan",
  "2025-10-23": "Vijayadashami",
  "2025-11-01": "Deepawali",
  "2025-12-25": "Christmas",
};


  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // shift Sunday to end
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    if (day) {
      const clickedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      setSelectedDate(clickedDate);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Academic Calendar</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Calendar Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                const dateObj = day
                  ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  : null;

                const dateStr = dateObj
                  ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`
                  : "";

                const isToday =
                  day &&
                  currentDate.getFullYear() === new Date().getFullYear() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  day === new Date().getDate();

                const isWeekend = dateObj && (dateObj.getDay() === 0 || dateObj.getDay() === 6);
                const holidayName = holidayMap[dateStr];
                const isHoliday = !!holidayName;

                const cellClasses = isToday
                  ? "bg-blue-200 border-blue-400"
                  : isHoliday
                    ? "bg-red-300 border-red-400"
                    // : isMST
                    // ? "bg-orange-300 border-orange-400"
                    : isWeekend
                      ? "bg-gray-300 border-gray-300"
                      : day
                        ? "bg-white hover:bg-gray-50 border-gray-200"
                        : "bg-gray-50 border-transparent";

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-[100px] p-2 border cursor-pointer transition-colors ${cellClasses}`}
                  >
                    {day && (
                      <>
                        <div className={`font-medium text-sm ${isToday ? "text-black font-bold" : "text-gray-900"}`}>
                          {day}
                        </div>
                        {isHoliday && (
                          <div className="text-[10px] mt-1 text-red-800 font-medium leading-tight">
                            {holidayName}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCalendar;
