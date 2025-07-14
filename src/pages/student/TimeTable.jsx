import { Clock, MapPin, User, Calendar } from "lucide-react";

const timetableData = {
  Monday: [
    {
      time: "09:00 - 10:30",
      subject: "Database Management Systems",
      code: "CS301",
      instructor: "Dr. Smith",
      room: "Lab 301",
      type: "Lab",
    },
    {
      time: "11:00 - 12:30",
      subject: "Software Engineering",
      code: "CS302",
      instructor: "Prof. Johnson",
      room: "Room 205",
      type: "Lecture",
    },
    {
      time: "14:00 - 15:30",
      subject: "Computer Networks",
      code: "CS303",
      instructor: "Dr. Williams",
      room: "Room 302",
      type: "Lecture",
    },
  ],
  Tuesday: [
    {
      time: "10:00 - 11:30",
      subject: "Operating Systems",
      code: "CS304",
      instructor: "Prof. Brown",
      room: "Lab 202",
      type: "Lab",
    },
    {
      time: "12:00 - 13:30",
      subject: "Web Technologies",
      code: "CS305",
      instructor: "Dr. Davis",
      room: "Room 401",
      type: "Lecture",
    },
    {
      time: "15:00 - 16:30",
      subject: "Mobile App Development",
      code: "CS306",
      instructor: "Prof. Wilson",
      room: "Lab 405",
      type: "Lab",
    },
  ],
  Wednesday: [
    {
      time: "09:30 - 11:00",
      subject: "Database Management Systems",
      code: "CS301",
      instructor: "Dr. Smith",
      room: "Room 205",
      type: "Lecture",
    },
    {
      time: "11:30 - 13:00",
      subject: "Software Engineering",
      code: "CS302",
      instructor: "Prof. Johnson",
      room: "Lab 301",
      type: "Lab",
    },
    {
      time: "14:30 - 16:00",
      subject: "Computer Networks",
      code: "CS303",
      instructor: "Dr. Williams",
      room: "Lab 303",
      type: "Lab",
    },
  ],
  Thursday: [
    {
      time: "08:30 - 10:00",
      subject: "Operating Systems",
      code: "CS304",
      instructor: "Prof. Brown",
      room: "Room 302",
      type: "Lecture",
    },
    {
      time: "10:30 - 12:00",
      subject: "Web Technologies",
      code: "CS305",
      instructor: "Dr. Davis",
      room: "Lab 405",
      type: "Lab",
    },
    {
      time: "13:00 - 14:30",
      subject: "Mobile App Development",
      code: "CS306",
      instructor: "Prof. Wilson",
      room: "Room 401",
      type: "Lecture",
    },
  ],
  Friday: [
    {
      time: "09:00 - 10:30",
      subject: "Database Management Systems",
      code: "CS301",
      instructor: "Dr. Smith",
      room: "Room 205",
      type: "Tutorial",
    },
    {
      time: "11:00 - 12:30",
      subject: "Software Engineering",
      code: "CS302",
      instructor: "Prof. Johnson",
      room: "Room 302",
      type: "Tutorial",
    },
    {
      time: "14:00 - 15:30",
      subject: "Project Work",
      code: "CS399",
      instructor: "Dr. Anderson",
      room: "Lab 501",
      type: "Project",
    },
  ],
};

const Timetable = () => {
  const getTypeColor = (type) => {
    switch (type) {
      case "Lecture":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Lab":
        return "bg-green-100 text-green-800 border-green-200";
      case "Tutorial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Project":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCurrentDay = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  };

  const getAllTimeSlots = () => {
    const allTimes = new Set();
    Object.values(timetableData).forEach((daySlots) => {
      daySlots.forEach((slot) => allTimes.add(slot.time));
    });
    return Array.from(allTimes).sort();
  };

  const getClassForDayAndTime = (day, time) => {
    const dayClasses = timetableData[day] || [];
    return dayClasses.find((slot) => slot.time === time);
  };

  const currentDay = getCurrentDay();
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = getAllTimeSlots();

  return (
    <div className="container mx-auto p-6 space-y-6">
      
      {/* Week Summary */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Week Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(timetableData).flat().length}
            </div>
            <div className="text-sm text-gray-500">Total Classes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {
                Object.values(timetableData)
                  .flat()
                  .filter((slot) => slot.type === "Lab").length
              }
            </div>
            <div className="text-sm text-gray-500">Lab Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {
                Object.values(timetableData)
                  .flat()
                  .filter((slot) => slot.type === "Lecture").length
              }
            </div>
            <div className="text-sm text-gray-500">Lectures</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {
                Object.values(timetableData)
                  .flat()
                  .filter((slot) => slot.type === "Tutorial").length
              }
            </div>
            <div className="text-sm text-gray-500">Tutorials</div>
          </div>
        </div>
      </div>

      {/* Timetable */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border bg-gray-100 p-3 text-left font-semibold min-w-[100px] sticky left-0 z-10">
                Time / Day
              </th>
              {timeSlots.map((time) => (
                <th
                  key={time}
                  className="border bg-gray-100 p-3 text-center font-semibold min-w-[200px]"
                >
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {time}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day) => {
              const isToday = day === currentDay;
              return (
                <tr key={day} className={isToday ? "bg-blue-50" : ""}>
                  <td
                    className={`border p-3 font-semibold sticky left-0 z-10 ${
                      isToday ? "bg-blue-100 text-blue-800" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {day}
                      {isToday && (
                        <span className="ml-2 text-xs font-medium bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                          Today
                        </span>
                      )}
                    </div>
                  </td>
                  {timeSlots.map((time) => {
                    const classData = getClassForDayAndTime(day, time);
                    return (
                      <td
                        key={`${day}-${time}`}
                        className="border p-2 align-top"
                      >
                        {classData ? (
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">
                                  {classData.subject}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {classData.code}
                                </p>
                              </div>
                              <span
                                className={`ml-2 text-xs border rounded px-2 py-0.5 ${getTypeColor(
                                  classData.type
                                )}`}
                              >
                                {classData.type}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs text-gray-500">
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {classData.instructor}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {classData.room}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-gray-400 py-4">
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
export default Timetable;
