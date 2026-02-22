export const PRESET_OPTIONS = {
  skills: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Next.js', 'Express.js',
  ],
  interests: [
    'Web Development', 'Mobile Development', 'Game Development',
    'AI/Machine Learning', 'Data Science', 'Cybersecurity',
    'Cloud Computing', 'DevOps', 'UI/UX Design', 'Graphic Design',
    'Startup', 'Open Source', 'Competitive Programming', 'Hackathon',
    'IoT', 'Robotics', 'Research',
  ],
  tools: [
    'VS Code', 'IntelliJ IDEA', 'WebStorm', 'Vim',
    'Git', 'GitHub', 'GitLab', 'Postman', 'Docker',
    'Figma', 'Notion', 'Trello', 'Jira', 'Slack',
    'ChatGPT', 'GitHub Copilot', 'Vercel', 'Netlify',
  ],
};

export const TAG_CONFIGS = [
  { field: 'skills' as const, title: 'Skills', color: 'blue' as const, options: PRESET_OPTIONS.skills },
  { field: 'interests' as const, title: 'Interests', color: 'purple' as const, options: PRESET_OPTIONS.interests },
  { field: 'tools' as const, title: 'Tools', color: 'green' as const, options: PRESET_OPTIONS.tools },
];
