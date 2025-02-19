import { useState } from "react";
import "./HorarioTable.css";

const HorarioTable = () => {
  const [inputText, setInputText] = useState("");
  const [week1, setWeek1] = useState([]);
  const [week2, setWeek2] = useState([]);

  const timeSlots = [
    "08:00 às 10:00",
    "10:00 às 12:00",
    "12:00 às 14:00",
    "14:00 às 16:00",
    "16:00 às 19:00",
    "19:00 às 21:00",
    "21:00 às 23:00",
  ];

  const days = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

  const processText = () => {
    const lines = inputText.split("\n");
    const week1Data = [];
    const week2Data = [];
    let currentSubject = null;

    lines.forEach((line) => {
      line = line.trim();
      if (line.match(/^[A-Za-z]{2,}\d{2,}-\d{2}/)) {
        if (currentSubject) {
          currentSubject.schedule.forEach((schedule) => {
            distributeToWeeks(schedule, currentSubject, week1Data, week2Data);
          });
        }
        const [code, ...rest] = line.split(" - ");
        const name = rest[0];
        const campus = rest[rest.length - 1];
        currentSubject = { code, name, campus, schedule: [] };
      } else if (line !== "" && currentSubject) {
        const [dayTime, frequency] = line.split(" - ");
        const [day, time] = dayTime.split(" das ");
        currentSubject.schedule.push({ day: day.trim(), time: time.trim(), frequency: frequency.trim() });
      }
    });

    if (currentSubject) {
      currentSubject.schedule.forEach((schedule) => {
        distributeToWeeks(schedule, currentSubject, week1Data, week2Data);
      });
    }

    setWeek1(week1Data);
    setWeek2(week2Data);
  };

  const distributeToWeeks = (schedule, subject, week1Data, week2Data) => {
    if (schedule.frequency === "semana 1") {
      week1Data.push({ ...subject, schedule: [schedule] });
    } else if (schedule.frequency === "semana 2") {
      week2Data.push({ ...subject, schedule: [schedule] });
    } else if (schedule.frequency === "semanal") {
      week1Data.push({ ...subject, schedule: [schedule] });
      week2Data.push({ ...subject, schedule: [schedule] });
    }
  };

  const calculateDuration = (time) => {
    const [start, end] = time.split(" às ");
    const startHour = parseInt(start.split(":")[0]);
    const endHour = parseInt(end.split(":")[0]);
    return Math.ceil((endHour - startHour) / 2); // Ajustando para intervalos de 2 horas
  };

  const renderTable = (data, week) => {
    const tableData = {};
    days.forEach((day) => {
      tableData[day] = {};
      timeSlots.forEach((slot) => {
        tableData[day][slot] = [];
      });
    });

    data.forEach((subject) => {
      const { name, schedule } = subject;
      const { day, time } = schedule[0];
      const duration = calculateDuration(time);

      if (tableData[day] && tableData[day][time]) {
        tableData[day][time].push({ name, duration });
        console.log(tableData[day][time])
      }
      
      if (duration > 1) {
        for (let i = 1; i < duration; i++) {
          const nextSlot = timeSlots[timeSlots.indexOf(time) + i];
          if (tableData[day] && tableData[day][nextSlot]) {
            tableData[day][nextSlot].push({ name, duration });
          }
        }
      }
    });

    return (
      <div>
        <h2>{week}</h2>
        <table className="horario-table">
          <thead>
            <tr>
              <th>Horário</th>
              {days.map((day, index) => (
                <th key={index}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => (
              <tr key={index}>
                <td>{slot}</td>
                {days.map((day, dayIndex) => (
                  <td key={dayIndex}>
                    <div className="cell-container">
                      {tableData[day][slot].map((event, i) => (
                        <div key={i} className="event" data-duration={event.duration}>
                          {event.name}
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={10}
        cols={100}
        placeholder="Cole o texto aqui..."
      />
      <br />
      <button onClick={processText}>Processar</button>
      {renderTable(week1, "Semana 1")}
      {renderTable(week2, "Semana 2")}
    </div>
  );
};

export default HorarioTable;
