import { useQuery } from "@tanstack/react-query";
import React from "react";
import { myFetch } from "./util.ts";
import { Editor } from "@monaco-editor/react";

export function FileViewerUri({ name, uri }: { name: string; uri: string }) {
  const content = useQuery({
    queryKey: ["file", uri],
    queryFn: () => myFetch(uri).then((res) => res.text()),
  });

  return (
    // <pre className="overflow-auto max-h-full font-mono">{content.data}</pre>
    <Editor
      height="100%"
      width="100%"
      defaultLanguage="typescript"
      defaultValue={content.data}
      />
  );
}
