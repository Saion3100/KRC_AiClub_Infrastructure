export function ProjectDescription({
  text,
  className = "",
  clamp = true,
}: {
  text: string;
  className?: string;
  clamp?: boolean;
}) {
  return (
    <p className={`leading-[1.7] text-[#344054] ${className} ${clamp ? "line-clamp-2" : ""}`}>
      {text}
    </p>
  );
}
