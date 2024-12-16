import React, { useState, useEffect } from "react";
import { Plus, Calendar, Loader2 } from "lucide-react";
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
import { useUser  } from "@clerk/clerk-react";
import axios from "axios";
import { format } from "date-fns";

const TimelinePage = () => {
  const { user } = useUser ();
  const [timelines, setTimelines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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

  // Fetch timelines
  useEffect(() => {
    const fetchTimelines = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5003/api/timelines?clerkId=${user.id}`
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Inline styles for farming theme
  const styles = {
    container: {
      padding: "1rem",
      maxWidth: "800px",
      margin: "0 auto",
      backgroundColor: "#e6f7e6", // Light green background
      fontFamily: "'Arial', sans-serif", // Simple, readable font
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "bold",
      color: "#4a7c2a", // Dark green color
    },
    subtitle: {
      color: "#5a5a5a", // Gray text color
      marginTop: "0.5rem",
    },
    dialogContent: {
      backgroundColor: "white",
      border: "1px solid #d1d5db",
      borderRadius: " 8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    button: {
      backgroundColor: "#4a7c2a", // Dark green for buttons
      color: "white",
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s",
    },
    buttonHover: {
      backgroundColor: "#3b6b2a", // Darker green on hover
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      marginBottom: "1rem",
    },
    cardHeader: {
      padding: "1rem",
      borderBottom: "1px solid #d1d5db",
    },
    cardContent: {
      padding: "1rem",
    },
    accordionContent: {
      padding: "1rem",
      backgroundColor: "#f9fafb", // Light gray background for accordion
      borderRadius: "4px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Crop Journal</h1>
          <p style={styles.subtitle}>Track and manage your crop cycles</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button style={styles.button}>
              <Plus className="mr-2 h-4 w-4" /> New Timeline
            </Button>
          </DialogTrigger>
          <DialogContent style={styles.dialogContent}>
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
              {/* Other form fields remain unchanged */}
              <Button
                type="submit"
                style={styles.button}
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
            <Card key={timeline._id} style={styles.card}>
              <CardHeader style={styles.cardHeader}>
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
                        style={styles.button}
                      >
                        Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent style={styles.dialogContent}>
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
                        {/* Other entry fields remain unchanged */}
                        <Button
                          type="button"
                          style={styles.button}
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
              <CardContent style={styles.cardContent}>
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
                        <AccordionContent style={styles.accordionContent}>
                          <div className="space-y-4">
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










//.....

