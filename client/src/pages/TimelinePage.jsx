import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, Calendar, Bookmark, Loader2 } from "lucide-react";
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
import { format } from "date-fns";

const TimelinePage = () => {
  const { user } = useUser();
  const [timelines, setTimelines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [activeTimelineId, setActiveTimelineId] = useState(null);

  const [newTimeline, setNewTimeline] = useState({
    title: "",
    cropType: "",
    startDate: "",
    description: "",
    totalArea: {
      value: "",
      unit: "acres",
    },
    expectedYield: {
      value: "",
      unit: "tons",
    },
  });

  const [newEntry, setNewEntry] = useState({
    date: "",
    activity: "",
    notes: "",
    weather: "",
    metrics: {
      temperature: "",
      humidity: "",
      rainfall: "",
      soilPH: "",
    },
  });

  // Fetch timelines
  useEffect(() => {
    const fetchTimelines = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5003/api/timelines?clerkId=${user.id}`,
        );
        setTimelines(response.data);
      } catch (error) {
        console.error("Error fetching timelines:", error);
        setError(error.response?.data?.error || "Failed to load timelines");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimelines();
  }, [user]);

  const handleCreateTimeline = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5003/api/timelines", {
        ...newTimeline,
        clerkId: user.id,
      });

      setTimelines((prev) => [...prev, response.data]);
      setCreateDialogOpen(false);
      setNewTimeline({
        title: "",
        cropType: "",
        startDate: "",
        description: "",
        totalArea: { value: "", unit: "acres" },
        expectedYield: { value: "", unit: "tons" },
      });
    } catch (error) {
      console.error("Error creating timeline:", error);
      setError(error.response?.data?.error || "Failed to create timeline");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddEntry = async () => {
    if (!activeTimelineId) return;
    setIsAddingEntry(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5003/api/timelines/${activeTimelineId}/entries`,
        {
          ...newEntry,
          clerkId: user.id,
        },
      );

      setTimelines((prev) =>
        prev.map((timeline) =>
          timeline._id === activeTimelineId ? response.data : timeline,
        ),
      );

      setEntryDialogOpen(false);
      setNewEntry({
        date: "",
        activity: "",
        notes: "",
        weather: "",
        metrics: {
          temperature: "",
          humidity: "",
          rainfall: "",
          soilPH: "",
        },
      });
    } catch (error) {
      console.error("Error adding entry:", error);
      setError(error.response?.data?.error || "Failed to add entry");
    } finally {
      setIsAddingEntry(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Crop Journal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your crop cycles
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" /> New Timeline
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white border shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Create New Timeline
              </DialogTitle>
            </DialogHeader>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
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
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Area</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={newTimeline.totalArea.value}
                      onChange={(e) =>
                        setNewTimeline({
                          ...newTimeline,
                          totalArea: {
                            ...newTimeline.totalArea,
                            value: e.target.value,
                          },
                        })
                      }
                      placeholder="Area"
                      required
                    />
                    <Select
                      value={newTimeline.totalArea.unit}
                      onValueChange={(value) =>
                        setNewTimeline({
                          ...newTimeline,
                          totalArea: { ...newTimeline.totalArea, unit: value },
                        })
                      }
                    >
                      <SelectTrigger className="w-24 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="hectares">Hectares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Expected Yield</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={newTimeline.expectedYield.value}
                      onChange={(e) =>
                        setNewTimeline({
                          ...newTimeline,
                          expectedYield: {
                            ...newTimeline.expectedYield,
                            value: e.target.value,
                          },
                        })
                      }
                      placeholder="Yield"
                      required
                    />
                    <Select
                      value={newTimeline.expectedYield.unit}
                      onValueChange={(value) =>
                        setNewTimeline({
                          ...newTimeline,
                          expectedYield: {
                            ...newTimeline.expectedYield,
                            unit: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-24 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="tons">Tons</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="quintals">Quintals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Timeline"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {timelines.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No timelines yet
            </h3>
            <p className="text-gray-500">
              Create your first timeline to start tracking your crop cycles.
            </p>
          </div>
        ) : (
          timelines.map((timeline) => (
            <Card key={timeline._id} className="bg-white shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{timeline.title}</CardTitle>
                    <CardDescription>
                      Started: {format(new Date(timeline.startDate), "PPP")}
                      {timeline.totalArea && (
                        <span className="ml-2">
                          • {timeline.totalArea.value} {timeline.totalArea.unit}
                        </span>
                      )}
                      {timeline.expectedYield && (
                        <span className="ml-2">
                          • Expected: {timeline.expectedYield.value}{" "}
                          {timeline.expectedYield.unit}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Dialog
                    open={entryDialogOpen}
                    onOpenChange={setEntryDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTimelineId(timeline._id)}
                      >
                        Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border shadow-lg">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                          Add Timeline Entry
                        </DialogTitle>
                      </DialogHeader>
                      {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                          {error}
                        </div>
                      )}
                      <div className="space-y-4 mt-4">
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
                          <label className="text-sm font-medium">
                            Activity
                          </label>
                          <Select
                            value={newEntry.activity}
                            onValueChange={(value) =>
                              setNewEntry({ ...newEntry, activity: value })
                            }
                          >
                            <SelectTrigger className="w-full bg-white">
                              <SelectValue placeholder="Select activity type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
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

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Temperature (°C)
                            </label>
                            <Input
                              type="number"
                              value={newEntry.metrics.temperature}
                              onChange={(e) =>
                                setNewEntry({
                                  ...newEntry,
                                  metrics: {
                                    ...newEntry.metrics,
                                    temperature: e.target.value,
                                  },
                                })
                              }
                              placeholder="Temperature"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Humidity (%)
                            </label>
                            <Input
                              type="number"
                              value={newEntry.metrics.humidity}
                              onChange={(e) =>
                                setNewEntry({
                                  ...newEntry,
                                  metrics: {
                                    ...newEntry.metrics,
                                    humidity: e.target.value,
                                  },
                                })
                              }
                              placeholder="Humidity"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Rainfall (mm)
                            </label>
                            <Input
                              type="number"
                              value={newEntry.metrics.rainfall}
                              onChange={(e) =>
                                setNewEntry({
                                  ...newEntry,
                                  metrics: {
                                    ...newEntry.metrics,
                                    rainfall: e.target.value,
                                  },
                                })
                              }
                              placeholder="Rainfall"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Soil pH
                            </label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newEntry.metrics.soilPH}
                              onChange={(e) =>
                                setNewEntry({
                                  ...newEntry,
                                  metrics: {
                                    ...newEntry.metrics,
                                    soilPH: e.target.value,
                                  },
                                })
                              }
                              placeholder="Soil pH"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea
                            value={newEntry.notes}
                            onChange={(e) =>
                              setNewEntry({
                                ...newEntry,
                                notes: e.target.value,
                              })
                            }
                            placeholder="Additional notes about this activity"
                            required
                          />
                        </div>

                        <Button
                          type="button"
                          className="w-full bg-gray-900 text-white hover:bg-gray-800"
                          onClick={handleAddEntry}
                          disabled={isAddingEntry}
                        >
                          {isAddingEntry ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                              Adding...
                            </>
                          ) : (
                            "Add Entry"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {timeline.entries?.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No entries yet. Add your first activity to start tracking.
                    </div>
                  ) : (
                    timeline.entries?.map((entry) => (
                      <AccordionItem key={entry._id} value={entry._id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-4">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(entry.date), "PPP")}</span>
                            <span className="font-medium">
                              {entry.activity}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Weather:</span>
                              <span>{entry.weather}</span>
                            </div>

                            {entry.metrics &&
                              Object.keys(entry.metrics).length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                  {entry.metrics.temperature && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        Temperature:
                                      </span>
                                      <span>{entry.metrics.temperature}°C</span>
                                    </div>
                                  )}
                                  {entry.metrics.humidity && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        Humidity:
                                      </span>
                                      <span>{entry.metrics.humidity}%</span>
                                    </div>
                                  )}
                                  {entry.metrics.rainfall && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        Rainfall:
                                      </span>
                                      <span>{entry.metrics.rainfall} mm</span>
                                    </div>
                                  )}
                                  {entry.metrics.soilPH && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        Soil pH:
                                      </span>
                                      <span>{entry.metrics.soilPH}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                            <div>
                              <span className="font-medium">Notes:</span>
                              <p className="mt-1 text-gray-600">
                                {entry.notes}
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))
                  )}
                </Accordion>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TimelinePage;


