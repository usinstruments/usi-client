import React, { createContext, useEffect, useRef, useState } from "react";
import { Project } from "./types/api-types.ts";
import net from "net";
import { myFetch } from "./util.ts";
import { myConsole } from "./Console.tsx";

type DataPoint = {
  counter: number;
  timestamp: number;
  value: number;
};

type Subscriber = (point: DataPoint) => void;

type Subscribers = {
  [key: number]: Subscriber[];
};

function decodeData(data: Buffer): DataPoint {
  // #[repr(C)]
  // pub struct DataPoint {
  //     pub source_id: u32,
  //     pub counter: u64,
  //     pub timestamp: u64,
  //     pub value: f64,
  // }

  const sourceId = data.readUInt32LE(0);
  const _ = data.readUInt32LE(4);
  const counter = data.readBigUInt64LE(8);
  const timestamp = Number(data.readBigUInt64LE(16)) / 1000; // us to ms
  const value = data.readDoubleLE(24);

  return { counter: Number(counter), timestamp: timestamp, value };
}

type ProjectContextType = {
  currentProject: Project | null;
  setCurrentProject: (projectId: string) => void;
  subscribe: (sourceId: number, callback: (point: DataPoint) => void) => void;
};

export const ProjectContext = createContext<ProjectContextType>({
  currentProject: null,
  setCurrentProject: () => {},
  subscribe: () => {},
});

export function ProjectContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const subscribersRef = useRef<Subscribers>({});

  const subscribe = (
    sourceId: number,
    callback: (point: DataPoint) => void
  ) => {
    if (!subscribersRef.current[sourceId]) {
      subscribersRef.current[sourceId] = [];
    }

    subscribersRef.current[sourceId].push(callback);
  };

  const handleProjectChange = async (projectId: string) => {
    const proj = await myFetch(`/projects/${projectId}`).then((res) =>
      res.json()
    );
    setCurrentProject(proj);
    subscribersRef.current = {};
  };

  useEffect(() => {
    if (!currentProject) return;

    const token = localStorage.getItem("access-token");
    if (!token) {
      throw new Error("Tried to connect to project while not authenticated");
    }

    const client = new net.Socket();

    client.connect(8002, "localhost", () => {
      client.write(
        JSON.stringify({
          token: token,
          project_id: currentProject.id,
        })
      );

      myConsole.info(`Connected to project ${currentProject.name}`);
    });

    client.on("readable", () => {
      let chunk;

      while (null !== (chunk = client.read(32))) {
        const point = decodeData(chunk);

        if (subscribersRef.current[point.counter]) {
          subscribersRef.current[point.counter].forEach((sub) => sub(point));
        }
      }
    });

    client.on("error", () => {
      setCurrentProject(null);
      throw new Error("Error in socket connection");
    });

    client.on("close", () => {
      setCurrentProject(null);
      throw new Error("Socket connection closed unexpectedly");
    });

    return () => {
      myConsole.info(`Disconnected from project ${currentProject.name}`);
      client.destroy();
    };
  }, [currentProject]);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        setCurrentProject: handleProjectChange,
        subscribe,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
