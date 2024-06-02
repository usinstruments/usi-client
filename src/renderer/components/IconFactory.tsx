import React from "react";
import { IconType } from "react-icons";
import * as Ionicons from "react-icons/io5";

export type IconDef = {
    name: string;
};

export function makeIconDef<T extends IconType>(icon: T) {
  return {
    name: icon.name,
  };
}

export default function IconFactory({ name }: IconDef) {
  // @ts-ignore
  const Icon = Ionicons[name];
  return <Icon />;
}
