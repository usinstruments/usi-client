import { useQuery } from "@tanstack/react-query";
import React from "react";
import { myFetch } from "../util.ts";

export function FileViewerUri({ name, uri }: { name: string; uri: string }) {
  const content = useQuery({
    queryKey: ["file", uri],
    queryFn: () => myFetch(uri).then((res) => res.text()),
  });

  return (
    <pre className="overflow-auto max-h-full font-mono">{content.data}</pre>
  );
}
