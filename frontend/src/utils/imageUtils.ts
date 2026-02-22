import defaultAvatar from "@/assets/default-avatar.png";

export function getImageUrl(
  path: string | undefined | null,
  fallback: string = defaultAvatar
): string {
  if (!path) return fallback;
  if (path.startsWith("http:")){
    return path;
  }
  const apiUrl = import.meta.env.VITE_API_URL; 
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  return `${apiUrl}/${cleanPath}`;
}
