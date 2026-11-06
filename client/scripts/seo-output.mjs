// Clean-URL HTML files add five bytes to the final path component.
export const canPrerenderRoute = (pathname) => {
  const parts = pathname.split("/").filter(Boolean);
  return parts.every((part, index) => Buffer.byteLength(part, "utf8") + (index === parts.length - 1 ? 5 : 0) <= 255);
};
