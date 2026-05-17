export type LearningPath = {
  slug: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
};

export const learningPaths: LearningPath[] = [
  {
    slug: 'intro-ethical-hacking',
    title: 'Intro to Ethical Hacking',
    description:
      'Learn the fundamentals of hacking, including phases, ethics, and basic terminologies. Perfect for absolute beginners.',
    level: 'Beginner',
  },
  {
    slug: 'network-security-basics',
    title: 'Network Security Basics',
    description:
      'Understand how networks work, common vulnerabilities, and the tools used to secure them. A foundational skill.',
    level: 'Beginner',
  },
  {
    slug: 'web-app-pentesting',
    title: 'Web App Pentesting',
    description:
      'Discover techniques to find and exploit vulnerabilities in web applications, such as SQL injection and XSS.',
    level: 'Intermediate',
  },
  {
    slug: 'malware-analysis',
    title: 'Malware Analysis',
    description:
      'Dive into the world of malicious software. Learn to dissect and understand malware behavior in a safe environment.',
    level: 'Advanced',
  },
  {
    slug: 'cryptography',
    title: 'Cryptography Fundamentals',
    description:
      'Explore the principles of encryption, hashing, and digital signatures that underpin modern secure communication.',
    level: 'Intermediate',
  },
  {
    slug: 'reverse-engineering',
    title: 'Reverse Engineering',
    description:
      'Learn to deconstruct software to understand its inner workings, identify vulnerabilities, and uncover hidden features.',
    level: 'Advanced',
  },
];
