import React, { FC } from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import { Navigate } from "react-big-calendar";
import { CaledarEventData } from "../../../types/bookings";
import moment from "moment";
import { generateTimeSlots } from "../../../utils/helperFunctions";
import CustomEvent from "../CustomEvents";
import CustomPopupForMonth from "../../common/CustomPopupForMonth/CustomPopupForMonth";
import { setBookingCalendarAdditionalData } from "../../../store/slices/bookingSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { fetchCalendarAdditionalDataForBookings } from "../../../store/thunks/bookingThunk";

interface CustomWeekViewProps {
  date: Date;
  localizer: any;
  max?: Date;
  min?: Date;
  scrollToTime?: Date;
  [key: string]: any; // for additional props
}

interface EventRecord {
  key: number;
  time: Date;
  [key: string]: any; // Use an index signature for dynamic day keys
}

const CustomWeekView: FC<CustomWeekViewProps> = ({
  date,
  localizer,
  max = localizer.endOf(new Date(), "day"),
  min = localizer.startOf(new Date(), "day"),
  scrollToTime = localizer.startOf(new Date(), "day"),
  ...props
}) => {
  const { events } = props;
  
  const dispatch: AppDispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalEvents, setModalEvents] = React.useState<CaledarEventData[]>([]);
  const timeSlots = generateTimeSlots(date, localizer);

  const startDate = date;

  // Group events by day and time
  const eventsByDayAndTime = events.reduce(
    (acc: any, event: CaledarEventData) => {
      const dayKey = moment(event.start).format("YYYY-MM-DD");
      const roundedTime = moment(event.start).startOf('hour');
      const timeKey = roundedTime.format("hh:mm A");
      if (!acc[dayKey]) acc[dayKey] = {};
      if (!acc[dayKey][timeKey]) acc[dayKey][timeKey] = [];
      acc[dayKey][timeKey].push(event);
      return acc;
    },
    {}
  );

  // Create the columns for the days of the week
  const dayColumns = Array.from({ length: 7 }).map((_, index) => {
    const currentDate = localizer.add(startDate, index, "days");
    const dayKey = localizer.format(currentDate, "YYYY-MM-DD");
    return {
      title: (
        <div className="day-time-column flex-center">
          {localizer.format(currentDate, "DD ddd")}
        </div>
      ), // '27 Mon'
      dataIndex: dayKey,
      key: dayKey,
      width: 160,
      height:167,
      render: (text: any, record: EventRecord) => {
        const timeKey = new Date(record.time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        
        const dayEvents = eventsByDayAndTime[dayKey]
        ? eventsByDayAndTime[dayKey][timeKey] || []
        : [];
        if (dayEvents.length > 3) {
          const displayedEvents = dayEvents.slice(0, 3);
          const moreEvents = dayEvents.length - 3;
  
            return (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {displayedEvents.map((event: CaledarEventData, index: number) => (
                  <CustomEvent event={event} weekEvent title={event.title} />
                ))}
                <div className="nth-more-btn" onClick={() => handleOpenModal(dayEvents.slice(3))}>
                +{moreEvents} more
                </div >
                
              </div>
            );
          }
          return dayEvents.map((event: CaledarEventData, index: number) => (
            <CustomEvent event={event} weekEvent title={event.title} />
          ));
      },
    };
  });

  
  const handleOpenModal = (events: CaledarEventData[]) => {
    const data = moment(events[0].end).format('YYYY-MM-DD')
    let bodyParams={
      date:data
    }
    dispatch(fetchCalendarAdditionalDataForBookings(bodyParams));
    setModalEvents(events);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    
    dispatch(setBookingCalendarAdditionalData(null));
    setModalEvents([]);
  };

  const timeColumn = {
    title: "",
    dataIndex: "time",
    key: "time",
    render: (time: Date) => (
      <div className="day-time-column">{localizer.format(time, "hh:mm A")}</div>
    ),
    width: 105,
  };

  const dataSource = timeSlots.map((time, index) => ({
    key: index,
    time,
    ...eventsByDayAndTime, // Spread events across days
  }));

  const columns = [timeColumn, ...dayColumns];

  return (
    <>
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      className="custom-week-view-table"
      bordered
      scroll={{y:500}}
    />
    <CustomPopupForMonth
        isModalOpen={isModalOpen}
        handleCancel={handleCloseModal}
        events={modalEvents}
      />
    </>
  );
};

const CustomWeekViewComponent = Object.assign(CustomWeekView, {
  propTypes: {
    date: PropTypes.instanceOf(Date).isRequired,
    localizer: PropTypes.object,
    max: PropTypes.instanceOf(Date),
    min: PropTypes.instanceOf(Date),
    scrollToTime: PropTypes.instanceOf(Date),
  },
  range: (date: Date, localizer: any) => {
    const start = date;
    const end = localizer.add(start, 6, "day");

    let current = start;
    const range = [];

    while (localizer.lte(current, end, "day")) {
      range.push(current);
      current = localizer.add(current, 1, "day");
    }

    return range;
  },
  navigate: (date: Date, action: string, { localizer }: any) => {
    switch (action) {
      case Navigate.PREVIOUS:
        return localizer.add(date, -7, "day");

      case Navigate.NEXT:
        return localizer.add(date, 7, "day");

      default:
        return date;
    }
  },
  title: (date: Date, { localizer }: any) => {
    const start = date;
    const end = localizer.add(start, 6, "day");
    return localizer.format({ start, end }, "dayRangeHeaderFormat");
  },
});

export default CustomWeekViewComponent;
