import { useQuery } from "@tanstack/react-query";
import React from "react";
import { myFetch } from "../util.ts";

export function FileViewer({ name, uri }: { name: string; uri: string }) {
  const content = useQuery({
    queryKey: ["file", uri],
    queryFn: () => myFetch(uri).then((res) => res.text()),
  });

  return (
    <pre className="overflow-auto max-h-full font-mono px-4 pb-2">{content.data}</pre>
  );
}
