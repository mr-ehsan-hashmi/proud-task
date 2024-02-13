import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./BookingsCalendar.scss";
import { Calendar, momentLocalizer } from "react-big-calendar";
import CustomToolbar from "./CustomToolbar";
import CustomEvent from "./CustomEvents";
import { CaledarEventData } from "../../types/bookings";
import CustomPopupForMonth from "../common/CustomPopupForMonth/CustomPopupForMonth";
import { OnMenuSelectParams } from "../../types/common";
import { CalendarView } from "../../containers/BookingContainer/BookingContainer";
import CustomAgenda from "./CalendarList/CustomAgenda";
import CustomAgendaTime from "./CalendarList/CustomAgendaTime";
import CustomAgendaDate from "./CalendarList/CustomAgendaDate";
import CustomDayViewComponent from "./CustomDay/CustomDayView";
import {
  selectBooking,
  setBookingCalendarAdditionalData,
} from "../../store/slices/bookingSlice";
import { useDispatch, useSelector } from "react-redux";
import { formatDateForDayLable } from "../../utils/helperFunctions";
import CustomWeekView from "./CustomWeek/CustomWeekView";
import { fetchCalendarAdditionalDataForBookings } from "../../store/thunks/bookingThunk";
import { AppDispatch } from "../../store/store";

const localizer = momentLocalizer(moment);

export interface MyEvent {
  start: Date;
  end: Date;
  title: string;
  type: string;
}

interface BookingCalendarProps {
  bookingCalendarData: CaledarEventData[];
  onMenuSelect: ({ id, name }: OnMenuSelectParams) => void;
  currentView: CalendarView;
  onChangeCurrentView: (name: CalendarView) => void;
  activityType: string;
}

const MyCalendar: React.FC<BookingCalendarProps> = ({
  bookingCalendarData,
  onMenuSelect,
  currentView,
  onChangeCurrentView,
  activityType,
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [groupedEvents, setGroupedEvents] = useState<{
    [date: string]: CaledarEventData[];
  }>({});
  const { selectedDateForDay } = useSelector(selectBooking);

  const [currentDate, setCurrentDate] = useState<Date>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<CaledarEventData[]>([]);
  const moreEventCountRef = useRef<number>(0);
  const dispatch: AppDispatch = useDispatch();
  const [eventSizeRef, setEventSizeRef] = useState({
    width: "164px",
    height: "26px",
  });

  useEffect(() => {
    const eventsGroupedByDate = groupEventsByDate(bookingCalendarData);
    setGroupedEvents(eventsGroupedByDate);
  }, [bookingCalendarData]);

  useEffect(() => {
    if (calendarRef.current) {
      const cell = calendarRef.current.querySelector(
        ".rbc-date-cell"
      ) as HTMLElement;
      const dayBg = calendarRef.current.querySelector(
        ".rbc-day-bg"
      ) as HTMLElement;

      const eventElement = calendarRef.current.querySelector(
        ".rbc-event"
      ) as HTMLElement;

      if (cell && eventElement && dayBg) {
        const cellHeight = cell.offsetHeight;
        const cellWidth = cell.offsetWidth;

        const adjustedEventHeight = `${Math.floor(cellHeight / 1.2)}px`;
        const adjustedEventWidth = `${Math.floor(cellWidth) * 2}px`;

        setEventSizeRef({
          width: adjustedEventWidth,
          height: adjustedEventHeight,
        });
      }
    }
  }, [calendarRef.current]);

  useEffect(() => {
    if (calendarRef.current) {
      const onClickHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.classList.contains("rbc-show-more")) {
          const text = target.textContent || "";
          const numberMatch = text.match(/\+(\d+) more/);
          if (numberMatch && numberMatch[1]) {
            const number = parseInt(numberMatch[1], 10);
            moreEventCountRef.current = number;
          }
        }
      };
      calendarRef.current.addEventListener("click", onClickHandler);
      return () => {
        if (calendarRef.current) {
          calendarRef.current.removeEventListener("click", onClickHandler);
        }
      };
    }
  }, [calendarRef]);

  const handleCancel = () => {
    dispatch(setBookingCalendarAdditionalData(null));
    setModalOpen(false);
  };

  const handleOk = () => {
    dispatch(setBookingCalendarAdditionalData(null));
    setModalOpen(false);
  };

  const groupEventsByDate = (
    events: CaledarEventData[]
  ): { [date: string]: CaledarEventData[] } => {
    const eventsGroupedByDate: { [date: string]: CaledarEventData[] } = {};

    events.forEach((event) => {
      const date = moment(event.start).format("YYYY-MM-DD");
      if (!eventsGroupedByDate[date]) {
        eventsGroupedByDate[date] = [];
      }
      eventsGroupedByDate[date].push(event);
    });

    return eventsGroupedByDate;
  };

  const onClickMore = () => {
    const dateAttribute = moment(`${currentDate}`).format("YYYY-MM-DD");
    if (dateAttribute) {
      let bodyParams = {
        activity_id: activityType,
        date: dateAttribute,
      };
      dispatch(fetchCalendarAdditionalDataForBookings(bodyParams));
      let data = groupedEvents?.[dateAttribute];
      if (data) {
        setModalOpen(true);
        const filteredData = data
          .slice(data.length - moreEventCountRef.current || 0)
          .filter((event) => event.type !== "Cancelled");

        setModalData(filteredData);
      }
    }
  };

  useEffect(() => {
    if (currentDate) {
      onClickMore();
    }
  }, [currentDate]);

  const displayedEvents = bookingCalendarData?.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));

  const formats = {
    timeGutterFormat: "h:mm A", // 12-hour format with AM/PM
    selectRangeFormat: (
      { start, end }: { start: Date; end: Date },
      culture: string,
      local: any
    ) =>
      local.format(start, "h:mm A", culture) +
      " – " +
      local.format(end, "h:mm A", culture),
  };

  const onShowMore = useCallback((event: any, date: Date) => {
    onChangeCurrentView("month");
    setCurrentDate(date);
  }, []);

  const views = {
    month: true,
    week: CustomWeekView,
    day: CustomDayViewComponent,
    agenda: true,
  };

  const formattedDateLable = formatDateForDayLable(
    selectedDateForDay ? selectedDateForDay : ""
  );

  return (
    <div
      ref={calendarRef}
      className={`booking-calendar-container ${currentView}`}
    >
      <Calendar
        localizer={localizer}
        formats={formats}
        view={currentView}
        onShowMore={onShowMore}
        views={views}
        onView={(view: CalendarView) => {
          onChangeCurrentView(view);
        }}
        tooltipAccessor={false}
        components={{
          toolbar: (props: any) => {
            if (currentView === "day") {
              return (
                <CustomToolbar
                  {...props}
                  label={formattedDateLable}
                />
              );
            } else {
              return <CustomToolbar {...props} />;
            }
          },

          event: (props: any) => (
            <CustomEvent
              {...props}
              eventSize={eventSizeRef}
              onMenuSelect={onMenuSelect}
            />
          ),
          agenda: {
            event: (props: any) => <CustomAgenda {...props} />,
            time: CustomAgendaTime,
            date: CustomAgendaDate,
          },
        }}
        events={displayedEvents}
      />

      <CustomPopupForMonth
        isModalOpen={modalOpen}
        handleCancel={handleCancel}
        handleOk={handleOk}
        events={modalData!}
      />
    </div>
  );
};

export default MyCalendar;
