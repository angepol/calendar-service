import { act, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { createEntry, deleteEntry, getEntries, getEntry } from "./client";
jest.mock("./client");

const mockCreateEntry = createEntry as jest.MockedFunction<typeof createEntry>;
const mockGetEntries = getEntries as jest.MockedFunction<typeof getEntries>;
const mockGetEntry = getEntry as jest.MockedFunction<typeof getEntry>;
const mockDeleteEntry = deleteEntry as jest.MockedFunction<typeof deleteEntry>;

describe("App", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern" as FakeTimersConfig);
    const date = new Date("2022-02-15T04:00");
    jest.setSystemTime(date);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders correctly", async () => {
    mockCreateEntry.mockResolvedValue({});
    mockGetEntries.mockResolvedValue([
      {
        end: "2022-02-27T05:43:37.868Z",
        start: "2022-02-27T05:43:37.868Z",
        title: "Berta goes to the baseball game!",
      },
    ]);
    const app: any = render(<App />);
    expect(await screen.findByText(/Mon/)).toBeVisible();
    expect(app.asFragment()).toMatchSnapshot();
  });

  it("shows calendar", async () => {
    mockCreateEntry.mockResolvedValue({});
    mockGetEntries.mockResolvedValue([
      {
        end: "2022-02-27T05:43:37.868Z",
        start: "2022-02-27T05:43:37.868Z",
        title: "Berta goes to the baseball game!",
      },
    ]);
    render(<App />);
    expect(await screen.findByText(/Mon/)).toBeVisible();
    expect(await screen.findByText(/Tue/)).toBeVisible();
    expect(await screen.findByText(/Wed/)).toBeVisible();
    expect(await screen.findByText(/Thu/)).toBeVisible();
    expect(await screen.findByText(/Fri/)).toBeVisible();
    expect(await screen.findByText(/Sat/)).toBeVisible();
    expect(await screen.findByText(/Sun/)).toBeVisible();
  });

  describe("events", () => {
    it("defaults to today's date and a one hour time window", () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
      ]);
      waitFor(() => {
        render(<App />);
      });
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("Start Time")).toHaveValue("04:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("05:00");
    });

    it("displays event in ui when all inputs are provided valid values", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          description: "She had some tasty nachos and margarita!",
        },
      ]);
      await act(async () => {
        await render(<App />);
      });
      expect(mockGetEntries).toHaveBeenCalledTimes(1);
      userEvent.click(screen.getByLabelText("Title"));
      userEvent.type(
        screen.getByLabelText("Title"),
        "Berta goes to the baseball game!",
      );
      userEvent.type(
        screen.getByLabelText("Description"),
        "She had some tasty nachos and margarita!",
      );
      userEvent.type(screen.getByLabelText("Start Date"), "02152022");
      userEvent.type(screen.getByLabelText("Start Time"), "08:10");
      userEvent.type(screen.getByLabelText("End Date"), "02152022");
      userEvent.type(screen.getByLabelText("End Time"), "10:10");
      await waitFor(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });
      expect(await screen.findByLabelText("Title")).toHaveAttribute(
        "value",
        "",
      );
      expect(
        await screen.findByText("Berta goes to the baseball game!"),
      ).toBeVisible();
      expect(mockCreateEntry).toHaveBeenCalledWith({
        startTimeUtc: new Date("2022-02-15T16:10:00.000Z"),
        endTimeUtc: new Date("2022-02-15T18:10:00.000Z"),
        title: "Berta goes to the baseball game!",
        description: "She had some tasty nachos and margarita!",
        allDay: false,
      });
    });

    it("fetches event details when event is clicked", async () => {
      mockGetEntries.mockResolvedValue([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          allDay: false,
        },
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
          allDay: false,
        },
      ]);

      mockGetEntry.mockResolvedValue([
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
          allDay: false,
        },
      ]);

      render(<App />);
      expect(mockGetEntries).toHaveBeenCalledTimes(1);
      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      eventText.click();
      expect(mockGetEntry).toHaveBeenCalledTimes(1);
      const modal = await screen.findByRole("dialog");
      expect(modal).toBeVisible();
      expect(await within(modal).findByText("Event Details")).toBeVisible();
    });

    it("deletes entry when delete button is clicked", async () => {
      mockGetEntries.mockResolvedValueOnce([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
        },
      ]);

      mockGetEntry.mockResolvedValue({
        _id: "345",
        end: "2022-02-24T05:43:37.868Z",
        start: "2022-02-24T05:43:37.868Z",
        title: "Dance",
        description: "fun times",
      });

      mockDeleteEntry.mockResolvedValue();

      mockGetEntries.mockResolvedValueOnce([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
      ]);
      await act(async () => {
        await render(<App />);
      });
      expect(mockGetEntries).toHaveBeenCalledTimes(1);
      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      await act(async () => {
        await eventText.click();
      });
      expect(mockGetEntry).toHaveBeenCalledTimes(1);
      const deleteButton = await screen.findByText("Delete");
      await act(async () => {
        await deleteButton.click();
        expect(mockDeleteEntry).toHaveBeenCalled();
      });
    });

    it("automatically sets end date when start date is selected", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([]);
      await act(async () => {
        await render(<App />);
      });
      userEvent.type(screen.getByLabelText("Start Date"), "2016-12-12");
      expect(screen.getByLabelText("Start Date")).toHaveValue("2016-12-12");
      expect(screen.getByLabelText("End Date")).toHaveValue("2016-12-12");
    });

    it("errors when end date is before start date", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([]);
      await act(async () => {
        await render(<App />);
      });
      userEvent.type(screen.getByLabelText("Start Date"), "2016-12-12");
      expect(screen.getByLabelText("Start Date")).toHaveValue("2016-12-12");
      userEvent.type(screen.getByLabelText("End Date"), "2016-11-11");
      expect(screen.getByLabelText("End Date")).toHaveValue("2016-11-11");
      waitFor(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });
      expect(
        screen.getByText("Error: end cannot be before start."),
      ).toBeVisible();
    });

    it("errors when end time is before start time on the same day", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([]);
      await act(async () => {
        await render(<App />);
      });
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      userEvent.type(screen.getByLabelText("Start Time"), "12:00");
      expect(screen.getByLabelText("Start Time")).toHaveValue("12:00");
      userEvent.type(screen.getByLabelText("End Time"), "04:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("04:00");
      waitFor(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });
      expect(
        screen.getByText("Error: end cannot be before start."),
      ).toBeVisible();
    });
  });
});
