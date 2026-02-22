export function MarqueeStrip() {
  const skills = [
    "Python",
    "React",
    "UX/UI Design",
    "Marketing",
    "Data Science",
    "Hardware",
    "Blockchain",
    "Business Plan",
    "Video Editing",
    "Pitching",
  ];

  return (
    <div className="bg-primary py-4 border-y border-primary/80 overflow-hidden">
      <div className="marquee-container">
        <div className="marquee-content text-slate-400 font-medium text-sm md:text-base uppercase tracking-widest flex items-center gap-12">
          {/* First set */}
          {skills.map((skill, index) => (
            <span key={`first-${index}`}>
              <span>{skill}</span>
              <span className="mx-6"></span>
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {skills.map((skill, index) => (
            <span key={`second-${index}`}>
              <span>{skill}</span>
              <span className="mx-6"></span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
