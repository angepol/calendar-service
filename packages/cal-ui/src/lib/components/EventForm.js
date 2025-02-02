import React, { useState } from "react";
import {
  formatDate,
  getDateTimeString,
  padNumberWith0Zero,
  timeFormat,
} from "../helpers/lib";
import { Checkbox, RadioGroup, Radio, Stack } from "@chakra-ui/react";
import s from "./EventForm.module.css";

const EventForm = ({
  initialStart,
  initialEnd,
  initialTitle = "",
  initialDescription = "",
  initialAllDay,
  initialRecurring,
  initialRecurrenceEnd,
  onFormSubmit,
  isCreate,
}) => {
  const [startDate, setStartDate] = useState(
    formatDate(new Date(initialStart)),
  );
  const [endDate, setEndDate] = useState(formatDate(new Date(initialEnd)));
  const [startTime, setStartTime] = useState(
    timeFormat(new Date(initialStart)),
  );
  const [endTime, setEndTime] = useState(timeFormat(new Date(initialEnd)));
  const [error, setError] = useState(null);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [allDay, setAllDay] = useState(initialAllDay);
  const [recurring, setRecurring] = useState(initialRecurring);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState("monthly");
  const currentHour = new Date().getHours();
  const DEFAULT_START_TIME = `${padNumberWith0Zero(currentHour + 1)}:00`;
  const DEFAULT_END_TIME = `${padNumberWith0Zero(currentHour + 2)}:00`;
  const recurrenceBeginDate = new Date(getDateTimeString(startDate, startTime));
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    formatDate(new Date(initialRecurrenceEnd)),
  );

  const handleFormSubmit = async (_) => {
    const startDateAndTime = getDateTimeString(startDate, startTime);
    const endDateAndTime = getDateTimeString(endDate, endTime);
    const recurrenceEndDateAndTime = getDateTimeString(
      recurrenceEndDate,
      startTime,
    );
    if (title === "") {
      setError("Error: Add Title");
      return;
    }
    if (startDateAndTime > endDateAndTime) {
      setError("Error: end cannot be before start.");
      return;
    }
    if (endDateAndTime > recurrenceEndDateAndTime) {
      setError("Error: recurrence end cannot be before start.");
      return;
    }
    if (!recurring) {
      onFormSubmit({
        title,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
        allDay,
        recurring,
      });
    } else {
      onFormSubmit({
        title,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
        allDay,
        recurring,
        frequency: recurrenceFrequency,
        recurrenceBegins: recurrenceBeginDate,
        recurrenceEnds: recurrenceEndDate,
      });
    }
  };

  return (
    <div className={s.container}>
      <label htmlFor="title" className={s.formItem}>
        Title
        <input
          className={s.formInput}
          id="title"
          type="text"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          value={title}
        />
      </label>
      <label htmlFor="description" className={s.formItem}>
        Description
        <input
          className={s.formInput}
          id="description"
          type="text"
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          value={description}
        />
      </label>
      <label htmlFor="startDate" className={s.formItem}>
        Start Date
        <input
          className={s.formInput}
          id="startDate"
          min={formatDate(new Date())}
          type="date"
          onChange={(e) => {
            setStartDate(e.target.value);
            setEndDate(e.target.value);
          }}
          value={startDate}
        />
      </label>
      <label htmlFor="endDate" className={s.formItem}>
        End Date
        <input
          className={s.formInput}
          id="endDate"
          min={startDate}
          type="date"
          onChange={(e) => {
            setEndDate(e.target.value);
          }}
          value={endDate}
        />
      </label>
      <div className={s.checkbox}>
        <Checkbox
          isChecked={allDay}
          onChange={(e) => {
            setAllDay(e.target.checked);
            if (e.target.checked === false) {
              setStartTime(DEFAULT_START_TIME);
              setEndTime(DEFAULT_END_TIME);
            }
          }}
        >
          All Day
        </Checkbox>
      </div>
      {!allDay && (
        <>
          <label htmlFor="startTime" className={s.formItem}>
            Start Time
            <input
              className={s.formInput}
              id="startTime"
              type="time"
              onChange={(e) => {
                setStartTime(e.target.value);
              }}
              value={startTime}
              disabled={allDay}
            />
          </label>
          <label htmlFor="endTime" className={s.formItem}>
            End Time
            <input
              className={s.formInput}
              id="endTime"
              type="time"
              onChange={(e) => {
                setEndTime(e.target.value);
              }}
              value={endTime}
              disabled={allDay}
            />
          </label>
        </>
      )}
      <div className={s.checkbox}>
        <Checkbox
          isChecked={recurring}
          onChange={(e) => {
            setRecurring(e.target.checked);
          }}
        >
          Recurring
        </Checkbox>
      </div>
      {recurring && (
        <>
          <label htmlFor="recurrenceType" className={s.formItem}>
            Recurrence Frequency
            <RadioGroup
              onChange={setRecurrenceFrequency}
              value={recurrenceFrequency}
            >
              <Stack direction="row">
                <Radio value="monthly">Monthly</Radio>
                <Radio value="weekly">Weekly</Radio>
                <Radio value="daily">Daily</Radio>
              </Stack>
            </RadioGroup>
          </label>
          <label htmlFor="recurrenceEnd" className={s.formItem}>
            Recurrence Ends
            <input
              className={s.formInput}
              id="recurrenceEnd"
              min={endDate}
              type="date"
              onChange={(e) => {
                setRecurrenceEndDate(e.target.value);
              }}
              value={recurrenceEndDate}
            />
          </label>
        </>
      )}
      <button className={s.formSubmit} onClick={handleFormSubmit}>
        {isCreate ? "Create Event" : "Save"}
      </button>
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
};

export default EventForm;
