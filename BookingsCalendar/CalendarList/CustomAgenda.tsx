import React from "react";
import { CaledarEventData } from "../../../types/bookings";

interface CustomAgendaProps {
  event: CaledarEventData;
}

const CustomAgenda: React.FC<CustomAgendaProps> = (props) => {
  const { event } = props;

  return <div className="custom-agenda">{event.title}</div>;
};

export default CustomAgenda;
