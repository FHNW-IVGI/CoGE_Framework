import React, { useState } from "react";
import {
  IonItem,
  IonLabel,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonList,
  IonTextarea,
} from "@ionic/react";
import "../App.css";
import { addCircle, download } from "ionicons/icons";
import { saveAs } from "file-saver";

interface AnnotationProps {
  startTimeInSeconds: number;
  endTimeInSeconds: number;
  videoDuration: number;
}

export const AnnotationTool: React.FC<AnnotationProps> = ({
  startTimeInSeconds,
  endTimeInSeconds,
  videoDuration,
}) => {
  const [annotations, setAnnotations] = useState<
    { start: number; end: number; text: string }[]
  >([]);
  const [annotationText, setAnnotationText] = useState<string>("");

  const addAnnotation = () => {
    if (annotationText.trim()) {
      const newAnnotation = {
        start: startTimeInSeconds,
        end: endTimeInSeconds,
        text: annotationText,
      };
      setAnnotations((prevAnnotations) => [...prevAnnotations, newAnnotation]);
      setAnnotationText(""); // Reset text input
    }
  };

  const exportAnnotationsToCSV = () => {
    const header = "Start,End,Text\n";
    const rows = annotations
      .map(
        (a) =>
          `${a.start.toFixed(2)},${a.end.toFixed(2)},"${a.text.replace(
            /"/g,
            '""'
          )}"`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "annotations.csv");
  };

  const calculateAnnotationStyle = (
    start: number,
    end: number,
    index: number,
    annotations: { start: number; end: number }[]
  ) => {
    if (videoDuration === 0) return {};

    const timelineWidth = 100; // Width percentage for the timeline
    const left = (start / videoDuration) * timelineWidth;
    const width = ((end - start) / videoDuration) * timelineWidth;

    // Detect overlapping annotations and calculate `top` position
    let top = 0;
    for (let i = 0; i < index; i++) {
      const prevAnnotation = annotations[i];
      if (
        (start >= prevAnnotation.start && start <= prevAnnotation.end) ||
        (end >= prevAnnotation.start && end <= prevAnnotation.end)
      ) {
        top += 20; // Increase top position by 20px for each overlap
      }
    }

    return { left: `${left}%`, width: `${width}%`, top: `${top}px` };
  };

  return (
    <IonCard className="groupList">
      <IonCardContent>
        <IonItem>
          <IonLabel position="stacked">Annotationen</IonLabel>
          <IonTextarea
            value={annotationText}
            placeholder="Annotationstext"
            onIonChange={(e) => setAnnotationText(e.detail.value!)}
          />
        </IonItem>
        <IonButton onClick={addAnnotation}>
          <IonIcon src={addCircle}></IonIcon>
        </IonButton>
        <IonButton onClick={exportAnnotationsToCSV}>
          <IonIcon src={download}></IonIcon>
        </IonButton>
        <div className="annotation-timeline">
          {annotations.map((annotation, index) => (
            <div
              key={index}
              className="annotation-bar"
              style={calculateAnnotationStyle(
                annotation.start,
                annotation.end,
                index,
                annotations
              )}
              title={annotation.text}
            ></div>
          ))}
        </div>
        <IonList>
          {annotations.map((annotation, index) => (
            <IonItem key={index}>
              <IonLabel>
                {`[${annotation.start.toFixed(2)} - ${annotation.end.toFixed(
                  2
                )}] : ${annotation.text}`}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};
