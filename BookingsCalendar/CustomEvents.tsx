import React from "react";
import { Col, Row, Space, Tooltip } from "antd";
import { CaledarEventData } from "../../types/bookings";

import clockImage from "../../assets/images/clock.svg";
import UserImage from "../../assets/images/user-image.svg";
import campImage from "../../assets/images/camping-tent.svg";
import { OnMenuSelectParams } from "../../types/common";

export interface MyEvent {
  start: Date;
  end: Date;
  title: string;
  type: "Confirmed" | "Pending" | "Cancelled";
}

interface EventProps {
  event: CaledarEventData;
  title: string;
  style?: React.CSSProperties;
  eventSize?: { width: string; height: string };
  onMenuSelect?:({id, name}:OnMenuSelectParams)=>void;
  weekEvent?:boolean
}

const CustomEvent: React.FC<EventProps> = ({
  event,
  style,
  eventSize,
  onMenuSelect,
  weekEvent=false,
}) => {
  const eventType = event.type?.toLowerCase() || "default";

  let startDate = new Date(event.start);
  const formattedStartTime = startDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  

  const activityTime = `${event.id} - ${formattedStartTime}`;
  const handleClickForWeekDay=()=>{
    console.log("Clicked")
  }

  return (
    <Tooltip
      color="white"
      overlayClassName="cutom-calendar-tooltip"
      showArrow={false}
      title={
        <Row className="tooltip-calendar-details-container">
          <Col span={24} className="calender-tooltip-header">
            <span>Booking Details</span>
          </Col>
          <Col span={24} className="calendar-tooltip-body">
            <Row gutter={[, 5]}>
              <Col span={24}>
                <Space>
                  <img src={clockImage} alt="Time Image" className="mb-4" />
                  <span
                    className="popup-event-name"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {activityTime}
                  </span>
                </Space>
              </Col>
              <Col span={24}>
                <Space>
                  <img src={campImage} alt="Time Image" className="mb-4" />
                  <span className="popup-event-name">{event.title}</span>
                </Space>
              </Col>
              <Col span={24}>
                <Space>
                  <img src={UserImage} alt="Time Image" className="mb-4" />
                  <span className="popup-event-name">{event.user_name}</span>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      }
    >
      <div
        className={`custom-event ${eventType}`}
        style={{ ...style, ...eventSize }}
        onClick={()=>{weekEvent ? handleClickForWeekDay():onMenuSelect!({id:`${event.id}`, name:'view'})}}
      >
        {activityTime}
      </div>
    </Tooltip>
  );
};

export default CustomEvent;
