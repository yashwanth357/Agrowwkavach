import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, Calendar, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

const TimelinePage = () => {
  const { user } = useUser();
  const [timelines, setTimelines] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTimeline, setNewTimeline] = useState({
    title: "",
    cropType: "",
    startDate: "",
    description: "",
  });
  const [newEntry, setNewEntry] = useState({
    timelineId: "",
    date: "",
    activity: "",
    notes: "",
    weather: "",
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulated timeline data
    setTimelines([
      {
        id: "1",
        title: "Wheat Crop 2024",
        cropType: "Wheat",
        startDate: "2024-01-15",
        description: "Annual wheat cultivation cycle",
        entries: [
          {
            id: "1",
            date: "2024-01-15",
            activity: "Soil Preparation",
            notes: "Added organic fertilizers and prepared the soil",
            weather: "Sunny, 25°C",
          },
          {
            id: "2",
            date: "2024-01-20",
            activity: "Sowing",
            notes: "Used new hybrid seeds",
            weather: "Cloudy, 22°C",
          },
        ],
      },
      // Add more mock timelines as needed
    ]);
  }, []);

  const handleCreateTimeline = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // Add API call here to create timeline
      const newTimelineData = {
        ...newTimeline,
        userId: user.id,
      };
      // Simulate API call
      setTimelines([
        ...timelines,
        { ...newTimelineData, id: Date.now(), entries: [] },
      ]);
      setNewTimeline({
        title: "",
        cropType: "",
        startDate: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating timeline:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddEntry = async (timelineId) => {
    try {
      // Add API call here to add entry
      const newEntryData = {
        ...newEntry,
        id: Date.now(),
      };

      setTimelines(
        timelines.map((timeline) => {
          if (timeline.id === timelineId) {
            return {
              ...timeline,
              entries: [...timeline.entries, newEntryData],
            };
          }
          return timeline;
        }),
      );

      setNewEntry({
        timelineId: "",
        date: "",
        activity: "",
        notes: "",
        weather: "",
      });
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crop Journal</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" /> New Timeline
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Timeline</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTimeline} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newTimeline.title}
                  onChange={(e) =>
                    setNewTimeline({ ...newTimeline, title: e.target.value })
                  }
                  placeholder="e.g., Wheat Crop 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Crop Type</label>
                <Select
                  value={newTimeline.cropType}
                  onValueChange={(value) =>
                    setNewTimeline({ ...newTimeline, cropType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="corn">Corn</SelectItem>
                    <SelectItem value="cotton">Cotton</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newTimeline.startDate}
                  onChange={(e) =>
                    setNewTimeline({
                      ...newTimeline,
                      startDate: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTimeline.description}
                  onChange={(e) =>
                    setNewTimeline({
                      ...newTimeline,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of this timeline"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 text-white hover:bg-gray-800"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Timeline"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {timelines.map((timeline) => (
          <Card key={timeline.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{timeline.title}</CardTitle>
                  <CardDescription>
                    Started on:{" "}
                    {new Date(timeline.startDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Add Entry</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Timeline Entry</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={newEntry.date}
                          onChange={(e) =>
                            setNewEntry({ ...newEntry, date: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Activity</label>
                        <Select
                          value={newEntry.activity}
                          onValueChange={(value) =>
                            setNewEntry({ ...newEntry, activity: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="soil-preparation">
                              Soil Preparation
                            </SelectItem>
                            <SelectItem value="sowing">Sowing</SelectItem>
                            <SelectItem value="fertilization">
                              Fertilization
                            </SelectItem>
                            <SelectItem value="irrigation">
                              Irrigation
                            </SelectItem>
                            <SelectItem value="pest-control">
                              Pest Control
                            </SelectItem>
                            <SelectItem value="harvesting">
                              Harvesting
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Weather</label>
                        <Input
                          value={newEntry.weather}
                          onChange={(e) =>
                            setNewEntry({
                              ...newEntry,
                              weather: e.target.value,
                            })
                          }
                          placeholder="e.g., Sunny, 25°C"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                          value={newEntry.notes}
                          onChange={(e) =>
                            setNewEntry({ ...newEntry, notes: e.target.value })
                          }
                          placeholder="Additional notes about this activity"
                          required
                        />
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => handleAddEntry(timeline.id)}
                      >
                        Add Entry
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {timeline.entries.map((entry) => (
                  <AccordionItem key={entry.id} value={entry.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                        <span className="font-medium">{entry.activity}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Weather:</span>
                          <span>{entry.weather}</span>
                        </div>
                        <div>
                          <span className="font-medium">Notes:</span>
                          <p className="mt-1 text-gray-600">{entry.notes}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TimelinePage;
