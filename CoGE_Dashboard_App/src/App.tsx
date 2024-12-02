import React, { useEffect, useRef, useState } from "react";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonRange,
  IonButton,
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonIcon,
} from "@ionic/react";
import image from "/coge_logo.png";
import { VideoPlayer } from "./components/VideoPlayer";
import { ChartSection } from "./components/ChartSection";
import { LineChart } from "./components/LineChart";
import { AnnotationTool } from "./components/AnnotationTool";
import { HandleNLP } from "./components/HandleNLP";
import { InteractionChart } from "./components/InteractionChart";
import { TimelineRangePicker } from "@mblancodev/react-ts-timeline-range-picker";
import { DateValuesType } from "@mblancodev/react-ts-timeline-range-picker/dist/src/types";
import "@mblancodev/react-ts-timeline-range-picker/dist/assets/main.css";

import "./App.css";
import { addSeconds } from "date-fns";
import { pause, play, stop } from "ionicons/icons";

const App: React.FC = () => {
  const [videoOptions, setVideoOptions] = useState<string[]>([]);
  const [videoNames, setVideoNames] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timeAggr, setTimeAggr] = useState<number>(60);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [timelineInterval, setTimelineInterval] = useState<[Date, Date]>([
    new Date(0),
    new Date(1),
  ]);
  const [value, setValue] = useState<DateValuesType>([0, 1]);
  const [selectedTab, setSelectedTab] = useState<string>("chart1");
  const [selectedTab2, setSelectedTab2] = useState<string>("chart2");
  const [selectedTabTopic, setSelectedTabTopic] = useState<string>("chartA");
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  const [isPlaying, setIsPlaying] = useState<boolean>(false); // State to track video playing status
  const videoPlayerRef = useRef<HTMLVideoElement>(null); // Reference to VideoPlayer

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videoResponse = await fetch("/api/files");
        if (!videoResponse.ok) {
          throw new Error(`HTTP error! status: ${videoResponse.status}`);
        }
        const videoData = await videoResponse.json();
        if (Array.isArray(videoData)) {
          setVideoOptions(videoData);
          const namesWithoutExtension = videoData.map((fileName) =>
            fileName.replace(".mp4", "")
          );
          setVideoNames(namesWithoutExtension);
          if (namesWithoutExtension.length > 0) {
            setSelectedVideo(namesWithoutExtension[0]);
          }
        } else {
          console.error("Unexpected response format:", videoData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleVideoLoaded = (duration: number) => {
    //console.log("Video duration received:", duration);
    if (duration && duration > 0) {
      setVideoDuration(duration);
      const videoEndTime = addSeconds(new Date(0), duration);
      setTimelineInterval([new Date(0), videoEndTime]);

      if (isFirstLoad) {
        setValue([0, duration * 1000]); // Set value only on the first load
        setIsFirstLoad(false); // Update the state to prevent future updates
      }
    } else {
      console.error("Invalid video duration:", duration);
    }
  };

  const handleChange = (values: DateValuesType) => {
    setValue(values);
  };

  const startTimeInSeconds = value[0] / 1000; // Convert milliseconds to seconds
  const endTimeInSeconds = value[1] / 1000;

  const handlePlayPause = () => {
    if (videoPlayerRef.current) {
      if (isPlaying) {
        videoPlayerRef.current.pause(); // Pause the video if it's playing
      } else {
        videoPlayerRef.current.play(); // Play the video if it's paused
      }
      setIsPlaying(!isPlaying); // Toggle the playing state
    }
  };

  const handleStop = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause(); // Stop video
      videoPlayerRef.current.currentTime = startTimeInSeconds; // Reset to start time
      setIsPlaying(false); // Update the playing state
    }
  };
  return (
    <IonApp>
      <IonHeader>
        <IonToolbar>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={image} alt="Logo" style={{ height: "50px" }} />
            <IonTitle>CoGE-App Dashboard</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-content">
        <IonGrid style={{ height: "100%", padding: "0" }}>
          <IonRow style={{ height: "100%" }}>
            <IonCol
              size="4"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <IonCard>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Wähle Gruppe</IonLabel>
                    <IonSelect
                      value={selectedVideo}
                      placeholder="Select Group"
                      onIonChange={(e) => setSelectedVideo(e.detail.value)}
                    >
                      {videoNames.map((name) => (
                        <IonSelectOption key={name} value={name}>
                          {name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Wähle Aggregation</IonLabel>
                    <IonRange
                      aria-label="Custom range"
                      min={0}
                      max={60}
                      value={timeAggr}
                      step={2}
                      pin={true}
                      ticks={true}
                      snaps={true}
                      onIonChange={(e) => setTimeAggr(e.detail.value as number)}
                    ></IonRange>
                  </IonItem>
                  <div style={{ width: "100%", paddingBottom: "40px" }}>
                    <TimelineRangePicker
                      step={100000}
                      value={value}
                      onChange={handleChange}
                      timelineInterval={timelineInterval}
                    />
                  </div>
                  <IonButton onClick={handlePlayPause}>
                    {isPlaying ? (
                      <IonIcon src={pause}></IonIcon>
                    ) : (
                      <IonIcon src={play}></IonIcon>
                    )}
                  </IonButton>
                  <IonButton onClick={handleStop}>
                    <IonIcon src={stop}></IonIcon>
                  </IonButton>
                </IonCardContent>
              </IonCard>
              <IonCard
                style={{
                  background: "transparent",
                }}
              >
                <VideoPlayer
                  video={
                    videoOptions.find((v) => v.includes(selectedVideo)) || ""
                  }
                  onTimeUpdate={handleTimeUpdate}
                  onVideoLoaded={handleVideoLoaded}
                  startTime={startTimeInSeconds} // Pass start time
                  endTime={endTimeInSeconds} // Pass end time
                  videoRef={videoPlayerRef} // Pass video ref to control from outside
                />
              </IonCard>

              <AnnotationTool
                startTimeInSeconds={startTimeInSeconds}
                endTimeInSeconds={endTimeInSeconds}
                videoDuration={videoDuration}
              />
            </IonCol>
            <IonCol
              size="8"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <IonCard>
                <IonCardContent>
                  <IonSegment
                    value={selectedTabTopic}
                    onIonChange={(e) =>
                      setSelectedTabTopic(e.detail.value as string)
                    }
                    style={{ marginBottom: "10px" }}
                  >
                    <IonSegmentButton value="chartA">NVB</IonSegmentButton>
                    <IonSegmentButton value="chartB">NLP</IonSegmentButton>
                  </IonSegment>
                  {selectedTabTopic === "chartA" && (
                    <IonCard>
                      <IonCardContent>
                        <IonSegment
                          value={selectedTab}
                          onIonChange={(e) =>
                            setSelectedTab(e.detail.value as string)
                          }
                          style={{ marginBottom: "10px" }}
                        >
                          <IonSegmentButton value="chart1">
                            Blickrichtungen
                          </IonSegmentButton>
                          <IonSegmentButton value="chart6">
                            Kopfbewegung
                          </IonSegmentButton>
                          <IonSegmentButton value="chart7">
                            Mundbewegung
                          </IonSegmentButton>
                          <IonSegmentButton value="chart8">
                            Aufgabentypen
                          </IonSegmentButton>
                        </IonSegment>

                        <div style={{ height: "300px", overflowY: "auto" }}>
                          {selectedTab === "chart1" && (
                            <InteractionChart
                              selectedVideo={selectedVideo}
                              timeAggr={timeAggr}
                              startTimeInSeconds={startTimeInSeconds}
                              endTimeInSeconds={endTimeInSeconds}
                              keyname={"interaction_values"}
                            />
                          )}
                          {selectedTab === "chart6" && (
                            <InteractionChart
                              selectedVideo={selectedVideo}
                              timeAggr={timeAggr}
                              startTimeInSeconds={startTimeInSeconds}
                              endTimeInSeconds={endTimeInSeconds}
                              keyname={"head_movement"}
                              style={{ height: "100%" }}
                            />
                          )}
                          {selectedTab === "chart7" && (
                            <InteractionChart
                              selectedVideo={selectedVideo}
                              timeAggr={timeAggr}
                              startTimeInSeconds={startTimeInSeconds}
                              endTimeInSeconds={endTimeInSeconds}
                              keyname={"mouth_ratio"}
                              style={{ height: "100%" }}
                            />
                          )}

                          {selectedTab === "chart8" && (
                            <ChartSection
                              selectedVideo={selectedVideo}
                              timeAggr={timeAggr}
                            />
                          )}
                        </div>
                      </IonCardContent>

                      <IonCardContent>
                        <IonSegment
                          value={selectedTab2}
                          onIonChange={(e) =>
                            setSelectedTab2(e.detail.value as string)
                          }
                          style={{ marginBottom: "10px" }}
                        >
                          <IonSegmentButton value="chart2">
                            Körperbewegung
                          </IonSegmentButton>
                          <IonSegmentButton value="chart3">
                            Handbewegung
                          </IonSegmentButton>
                          <IonSegmentButton value="chart4">
                            Hand-Gesicht Abstand
                          </IonSegmentButton>
                          <IonSegmentButton value="chart5">
                            Handspanne
                          </IonSegmentButton>
                        </IonSegment>

                        <div style={{ height: "300px", overflowY: "auto" }}>
                          {selectedTab2 === "chart2" && (
                            <InteractionChart
                              selectedVideo={selectedVideo}
                              timeAggr={timeAggr}
                              startTimeInSeconds={startTimeInSeconds}
                              endTimeInSeconds={endTimeInSeconds}
                              keyname={"body_movement"}
                              style={{ height: "100%" }}
                            />
                          )}

                          {selectedTab2 === "chart3" && (
                            <InteractionChart
                              selectedVideo={selectedVideo}
                              timeAggr={timeAggr}
                              startTimeInSeconds={startTimeInSeconds}
                              endTimeInSeconds={endTimeInSeconds}
                              keyname={"hand_movement"}
                              style={{ height: "100%" }}
                            />
                          )}
                          {selectedTab2 === "chart4" && (
                            <InteractionChart
                              selectedVideo={selectedVideo}
                              timeAggr={timeAggr}
                              startTimeInSeconds={startTimeInSeconds}
                              endTimeInSeconds={endTimeInSeconds}
                              keyname={"hand_face_distance"}
                              style={{ height: "100%" }}
                            />
                          )}
                          {selectedTab2 === "chart5" && (
                            <InteractionChart
                              selectedVideo={selectedVideo}
                              timeAggr={timeAggr}
                              startTimeInSeconds={startTimeInSeconds}
                              endTimeInSeconds={endTimeInSeconds}
                              keyname={"hand_span"}
                              style={{ height: "100%" }}
                            />
                          )}
                          {selectedTab2 === "chart6" && (
                            <InteractionChart
                              selectedVideo={selectedVideo}
                              timeAggr={timeAggr}
                              startTimeInSeconds={startTimeInSeconds}
                              endTimeInSeconds={endTimeInSeconds}
                              keyname={"head_movement"}
                              style={{ height: "100%" }}
                            />
                          )}
                        </div>
                      </IonCardContent>
                      <div style={{ height: "400px", overflowY: "auto" }}>
                        <LineChart
                          selectedVideo={selectedVideo}
                          timeAggr={timeAggr}
                          videoCurrentTime={currentTime}
                          startTimeInSeconds={startTimeInSeconds}
                          endTimeInSeconds={endTimeInSeconds}
                          style={{ height: "100%" }}
                        />
                      </div>
                    </IonCard>
                  )}
                  {selectedTabTopic === "chartB" && (
                    <>
                      <HandleNLP
                        selectedVideo={selectedVideo}
                        timeAggr={timeAggr}
                        startTimeInSeconds={startTimeInSeconds}
                        endTimeInSeconds={endTimeInSeconds}
                        keyname={"statistics"}
                      />
                      <HandleNLP
                        selectedVideo={selectedVideo}
                        timeAggr={timeAggr}
                        startTimeInSeconds={startTimeInSeconds}
                        endTimeInSeconds={endTimeInSeconds}
                        keyname={"contents"}
                      />
                      <HandleNLP
                        selectedVideo={selectedVideo}
                        timeAggr={timeAggr}
                        startTimeInSeconds={startTimeInSeconds}
                        endTimeInSeconds={endTimeInSeconds}
                        keyname={"words"}
                      />
                      <HandleNLP
                        selectedVideo={selectedVideo}
                        timeAggr={timeAggr}
                        startTimeInSeconds={startTimeInSeconds}
                        endTimeInSeconds={endTimeInSeconds}
                        keyname={"conversation"}
                      />
                      <HandleNLP
                        selectedVideo={selectedVideo}
                        timeAggr={timeAggr}
                        startTimeInSeconds={startTimeInSeconds}
                        endTimeInSeconds={endTimeInSeconds}
                        keyname={"task_related"}
                      />
                    </>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonApp>
  );
};

export default App;
