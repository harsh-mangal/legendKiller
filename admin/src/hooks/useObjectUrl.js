import { useEffect, useMemo } from "react";

export const useObjectUrl = (file) => {
  const url = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
};

export const useObjectUrls = (files = []) => {
  const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => { urls.forEach((url) => URL.revokeObjectURL(url)); }, [urls]);
  return urls;
};
