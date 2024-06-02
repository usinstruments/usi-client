import React from "react";
import { FileViewer } from "./FileViewer.tsx";

const components: { [key: string]: React.ComponentType<any> } = {
  FileViewer: FileViewer,
};

export type ComponentDef = {
  name: string;
  props: any;
};

export function makeComponentDef<T extends React.ComponentType<U>, U>(
  component: T,
  props: U
): ComponentDef {
  if (!components.hasOwnProperty(component.name)) {
    throw new Error(`Component ${component.name} not found`);
  }

  return {
    name: component.name,
    props,
  };
}

export default function DynamicComponent({ name, props }: ComponentDef) {
  const Component = components[name];
  return <Component {...props} />;
}
