import React from "react";
import moment from "moment";

interface CustomAgendaDateProps {
  day: Date;
}

const CustomAgendaDate: React.FC<CustomAgendaDateProps> = ({ day }) => {
  const dayNum = moment(day).format("DD"); 
  const restOfDate = moment(day).format("dddd, MMMM");
  return (
    <div className="custom-agenda-date">
      <span className="date-number">{dayNum}</span> {restOfDate}
    </div>
  );
};

export default CustomAgendaDate;
