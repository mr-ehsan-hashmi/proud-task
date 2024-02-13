import React, { FC, ReactNode, useEffect } from "react";
import PropTypes from "prop-types";
import { TableColumnType, Table } from "antd";
import { Navigate } from "react-big-calendar";
import { CaledarEventData } from "../../../types/bookings";
import moment from "moment";
import { AppDispatch } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { selectBooking, setSelectedDateForDay } from "../../../store/slices/bookingSlice";
import { generateTimeSlots } from "../../../utils/helperFunctions";
import CustomEvent from "../CustomEvents";


const groupEventsByTimeSlot = (
  events: CaledarEventData[],
  timeSlots: Date[],
  localizer: any
): CaledarEventData[][] => {
  const groupedEvents: CaledarEventData[][] = timeSlots.map(() => []);

  for (const event of events) {
    const eventStartHour = localizer.startOf(event.start, "hour");
    const index = timeSlots.findIndex((slot) =>
      localizer.eq(slot, eventStartHour)
    );
    if (index !== -1) {
      groupedEvents[index].push(event);
    }
  }

  return groupedEvents;
};

interface CustomDayViewProps {
  events: CaledarEventData[];
  date: Date;
  localizer: any;
}
const CustomDayView: FC<CustomDayViewProps> = ({
  date,
  localizer,
  events,
}) => {
    const dispatch: AppDispatch = useDispatch();
    const { selectedDateForDay } = useSelector(selectBooking);
    date = selectedDateForDay? moment(selectedDateForDay).toDate():date;
    
    useEffect(()=>{
        let dateToUpdate = date.toISOString();
        dispatch(setSelectedDateForDay(dateToUpdate))
    },[date])
    
  const timeSlots = generateTimeSlots(date, localizer);
  

  const groupedEvents = groupEventsByTimeSlot(events, timeSlots, localizer);

  const initialColumns: TableColumnType<any>[] = [
    {
      title: "",
      dataIndex: "time",
      key: "time",
      fixed: "left",
      width: 147,
      render: (time: Date): ReactNode => {
        return <div className="day-time-column"> {localizer.format(time, "hh:mm A")}</div>
      },
    },
    ...Array.from({ length: 6 }, (_, i) => ({
      title: ``,
      dataIndex: `event${i + 1}`,
      key: `event${i + 1}`,
      width: 206,
      render: (id: number, record: any) => {
        const event = record.events.find((e: CaledarEventData) => e.id === id);
        
        return event ? (
          <CustomEvent event={event} weekEvent title={event.title} />
        ) : null;
      },
    })),
  ];

  const maxEventCountInAnySlot = Math.max(
    ...groupedEvents.map((events) => events.length)
  );
  const additionalColumns: TableColumnType<any>[] =
    maxEventCountInAnySlot > 6
      ? Array.from({ length: maxEventCountInAnySlot - 6 }, (_, i) => ({
          title: `Event ${i + 6}`,
          dataIndex: `event${i + 6}`,
          key: `event${i + 6}`,
          width:206,
          render: (text, record) => {
            // Find the event that matches the column
            const event = record.events.find(
              (e: CaledarEventData) => e.id === text
            );
            return event ? (
              <CustomEvent event={event} weekEvent title={event.title} />
            ) : null;
          },
        }))
      : [];

  // Combine the initial and additional columns
  const columns = [...initialColumns, ...additionalColumns];

  // Create dataSource for the table
  const dataSource = timeSlots.map((timeSlot, index) => {
    // Define the type for record with an index signature
    const slotEvents = groupedEvents[index];

    const record: {
      [key: string]: any;
      key: number;
      time: Date;
      events: CaledarEventData[];
    } = {
      key: index,
      time: timeSlot,
      events: [],
    };

    slotEvents.forEach((event, eventIndex) => {
      // Construct the key for the event's data cell
      const eventKey = `event${eventIndex + 1}`;
      // Assign the event ID to the record using the key
      record[eventKey] = event.id;
      // Add the event to the events array in the record
      record.events.push(event);
    });

    return record;
  });

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      className="custom-day-view-table"
      bordered
      showHeader={false}
      scroll={{ x: "max-content", y:550 }} // Enables horizontal scrolling
    />
  );
};


const CustomDayViewComponent = Object.assign(CustomDayView, {
  propTypes: {
    date: PropTypes.instanceOf(Date).isRequired,
    localizer: PropTypes.object.isRequired,
  },
  range: (date: Date, localizer: any) => {
    const start = localizer.startOf(date, "day");
    return [start];
  },
  navigate: (date: Date, action: string, { localizer }: any) => {
    switch (action) {
      case Navigate.PREVIOUS:
        return localizer.add(date, -1, "day");
      case Navigate.NEXT:
        return localizer.add(date, 1, "day");
      default:
        return date;
    }
  },
  title: (date: Date, { localizer }: any) => {
    return localizer.format(date, "dayHeaderFormat");
  },
});

export default CustomDayViewComponent;
