import React, { FC } from "react";
import moment from "moment";

import { CaledarEventData } from "../../../types/bookings";

interface CustomAgendaTimeProps {
  event: CaledarEventData;
}
const CustomAgendaTime: FC<CustomAgendaTimeProps> = ({ event }) => {
  const formattedStartTime = moment(event.start).format("hh:mm A");

  const eventType = event.type?.toLowerCase() || "default";

  return (
    <div className={`custom-event ${eventType}`}>
      {event.id} - {formattedStartTime}
    </div>
  );
};

export default CustomAgendaTime;
