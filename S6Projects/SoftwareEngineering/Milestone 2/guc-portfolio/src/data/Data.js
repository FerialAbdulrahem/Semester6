export const EMPLOYERS = [
  { id: 1, company: "TechCorp Egypt",  email: "hr@techcorp.eg",          docs: ["tax_certificate.pdf", "trade_register.pdf"], status: "pending",  date: "2026-04-01" },
  { id: 2, company: "Innovate Labs",   email: "careers@innovatelabs.com", docs: ["tax_certificate.pdf"],                       status: "pending",  date: "2026-04-05" },
  { id: 3, company: "Cairo Digital",  email: "info@cairodigital.io",     docs: ["tax_certificate.pdf", "company_reg.pdf"],    status: "accepted", date: "2026-03-20" },
  { id: 4, company: "NileSoft",        email: "admin@nilesoft.com",       docs: ["tax_certificate.pdf"],                       status: "rejected", date: "2026-03-18" },
];

export const USERS = [
  { id: 1, name: "Ahmed Mostafa",   email: "ahmed.m@student.guc.edu.eg", password: "student1", role: "Student",            active: true,  companyName: null, major: "Computer Science", skills: ["React", "JavaScript", "Node.js", "MongoDB"], linkedIn: "https://linkedin.com/in/ahmed-mostafa" },
  { id: 2, name: "Sara Ali",        email: "sara.ali@student.guc.edu.eg", password: "student2", role: "Student",            active: true,  companyName: null, major: "Software Engineering", skills: ["Python", "Django", "PostgreSQL", "Docker"], linkedIn: "https://linkedin.com/in/sara-ali" },
  { id: 3, name: "Youssef Khaled", email: "youssef.k@student.guc.edu.eg", password: "student3", role: "Student",            active: false, companyName: null, major: "Information Systems", skills: ["Java", "Spring", "AWS", "Kubernetes"], linkedIn: "https://linkedin.com/in/youssef-khaled" },
  // Update the instructors in USERS array (find and replace these entries):
  { id: 4, name: "Dr. Mervat",      email: "mervat@guc.edu.eg",             password: "instructor1", role: "Course Instructor",  active: true,  companyName: null, coursesTaught: ['Software Engineering', 'Web Development'] },
  { id: 5, name: "Dr. Aya Salama",  email: "aya.salama@guc.edu.eg",         password: "instructor2", role: "Course Instructor",  active: true,  companyName: null, coursesTaught: ['Computer Networks', 'Cybersecurity'] },
  { id: 6, name: "TechCorp Egypt",  email: "hr@techcorp.eg",                password: "employer1", role: "Employer",           active: true,  companyName: "TechCorp Egypt" },
  { id: 7, name: "Innovate Labs",   email: "careers@innovatelabs.com",      password: "employer2", role: "Employer",           active: true,  companyName: "Innovate Labs" },
  { id: 8, name: "Admin User",      email: "admin@admin.guc.edu.eg",        password: "admin1", role: "Administrator",      active: true,  companyName: null },
];

export const COURSES = [
  { id: 1, name: "Software Engineering", code: "CSEN701" },
  { id: 2, name: "Computer Networks",    code: "CSEN601" },
  { id: 3, name: "Database Systems",     code: "CSEN501" },
  { id: 4, name: "Bachelor Project",     code: "CSEN900" },
];

export const LINK_REQUESTS = [
  { id: 1, instructor: "Dr. Mervat",     email: "mervat@guc.edu.eg",     course: "Software Engineering", type: "link",   date: "2026-04-10", status: "pending"  },
  { id: 2, instructor: "Dr. Aya Salama", email: "aya.salama@guc.edu.eg", course: "Computer Networks",    type: "unlink", date: "2026-04-12", status: "pending"  },
  { id: 3, instructor: "Dr. Omar",       email: "omar.h@guc.edu.eg",     course: "Database Systems",     type: "link",   date: "2026-04-15", status: "accepted" },
];

export const PROJECTS = [
  { id: 1, title: "Smart Campus App",      student: "Ahmed Mostafa",  course: "Software Engineering", active: true,  flagged: true,  flagReason: "Potential plagiarism"  },
  { id: 2, title: "Network Visualizer",    student: "Sara Ali",       course: "Computer Networks",    active: true,  flagged: false, flagReason: ""                      },
  { id: 3, title: "AI Chatbot Thesis",     student: "Nour Ibrahim",   course: "Bachelor Project",     active: true,  flagged: false, flagReason: ""                      },
  { id: 4, title: "Library Management DB", student: "Youssef Khaled", course: "Database Systems",     active: false, flagged: true,  flagReason: "Copyright violation"   },
];

export const APPEALS = [
  { id: 1, student: "Ahmed Mostafa",  project: "Smart Campus App",      message: "Our project is fully original. GitHub commits prove individual contributions.", date: "2026-04-16", status: "pending"  },
  { id: 2, student: "Youssef Khaled", project: "Library Management DB", message: "The uploaded report was a draft, not the final version. Please reactivate.",   date: "2026-04-17", status: "reviewed" },
];

export const INTERNSHIPS = [
  { id: 1, employerId: 6, title: "Frontend Developer Intern", status: "hiring", duration: "3 months", details: "Develop responsive web applications using React and modern JavaScript", deadline: "2026-05-15", skills: ["React", "JavaScript", "CSS"], postedAt: "2026-04-10" },
  { id: 2, employerId: 6, title: "Backend Developer Intern", status: "hiring", duration: "3 months", details: "Build scalable backend services with Node.js and Express", deadline: "2026-05-20", skills: ["Node.js", "Express", "MongoDB"], postedAt: "2026-04-15" },
  { id: 3, employerId: 5, title: "Full Stack Developer Intern", status: "hiring", duration: "6 months", details: "Work on full stack development with modern tech stack", deadline: "2026-05-30", skills: ["React", "Node.js", "Python", "SQL"], postedAt: "2026-04-20" },
  { id: 4, employerId: 6, title: "Data Science Intern", status: "filled", duration: "3 months", details: "Analyze data and build Machine Learning models, and data visualization ", deadline: "2026-04-30", skills: ["Python", "Machine Learning", "SQL", "Statistics"], postedAt: "2026-04-05" },
  { id: 5, employerId: 5 , title: "QA Engineer Intern", status: "hiring", duration: "3 months", details: "Test and ensure quality of software applications, and reviewing the survey", deadline: "2026-05-25", skills: ["Testing", "JavaScript", "Selenium"], postedAt: "2026-04-18" },
];

export const COMPLETED_INTERNSHIPS = [
   [
    { id: 1, title: "Summer Frontend Developer Internship", companyId: 2, duration: "6 months", year: "2025", description: "Built responsive dashboard using React", completedAt: "2025-08-30" },
    { id: 2, title: "Backend Engineering Internship", companyId: 3, duration: "3 months", year: "2024", description: "Developed REST APIs and database optimization", completedAt: "2024-09-15" },
  ],
   [
    { id: 1, title: "Full Stack Development Internship", companyId: 1, duration: "3 months", year: "2025", description: "Worked on e-commerce platform", completedAt: "2025-07-20" },
    { id: 2, title: "Data Analysis Internship", companyId: 2, duration: "3 months", year: "2024", description: "Analyzed customer behavior data and created dashboards", completedAt: "2024-06-10" },
  ],
   [
    { id: 1, title: "Web Developer Internship", companyId: 3, duration: "6 months", year: "2025", description: "Developed responsive web applications using Vue.js", completedAt: "2025-10-05" },
  ],
];


export const STUDENT_PROJECTS = {
  1: [ // Ahmed mo
    {
      id: 1,
      title: "AI-Powered Thesis Management System",
      course: "Bachelor Project", // Make sure this is exactly "Bachelor Project"
      githubLink: "https://github.com/student/thesis-project",
      programmingLanguages: ["React", "Node.js", "Python"],
      demoVideo: "https://youtube.com/watch?v=demo1",
      projectReport: "N/A",
      createdAt: "2024-01-15",
      visibility: "public",
      isVisibleOnPortfolio: false
    },
    {
      id: 2,
      title: "E-Learning Platform",
      course: "Software Engineering", // This won't show thesis tab
      githubLink: "https://github.com/student/elearning",
      programmingLanguages: ["React", "JavaScript", "MongoDB"],
      demoVideo: "https://youtube.com/watch?v=demo2",
      projectReport: "N/A",
      createdAt: "2024-01-20",
      visibility: "public",
      isVisibleOnPortfolio: true
    }
  ],
  2: [ // sara ali
    {
      id: 3,
      title: "Network Visualizer",
      course: "Computer Networks",
      githubLink: "https://github.com/sara-ali/network-viz",
      programmingLanguages: ["Python", "D3.js", "JavaScript"],
      demoVideo: "https://youtube.com/watch?v=example3",
      projectReport: "N/A",
      createdAt: "2026-03-01",
      visibility: "public",
      isVisibleOnPortfolio: true
    }
  ],
  3: [ // yousef khaled
    {
      id: 4,
      title: "Library Management System",
      course: "Database Systems",
      githubLink: "https://github.com/youssef-khaled/library-db",
      programmingLanguages: ["Java", "SQL", "Spring"],
      demoVideo: "https://youtube.com/watch?v=example4",
      projectReport: "N/A",
      createdAt: "2026-01-20",
      visibility: "private",
      isVisibleOnPortfolio: false
    }
  ]
};




export const SAMPLE_THESIS_DRAFTS = {
  1: [{ 
      id: 101,
      name: 'Thesis_Draft_v1.pdf',
      url: '/thesis_sample.pdf',
      uploadDate: '2024-01-10T10:30:00.000Z'
    },
    {
      id: 102,
      name: 'Thesis_Draft_v2.pdf',
      url: '/thesis_sample.pdf',
      uploadDate: '2024-01-20T14:15:00.000Z'
    },
    {
      id: 103,
      name: 'Thesis_Draft_v3_Final_Candidate.pdf',
      url: '/thesis_sample.pdf',
      uploadDate: '2024-02-01T09:45:00.000Z'
    }
  ]
};

export const NOTIFICATIONS = [
  // Internship Application Status (Student) - Accepted or Rejected
  { id: 1, userId: 1, type: 'internship_accepted', message: 'Your application for Frontend Developer Intern has been accepted.', date: '2026-05-01', read: false },
  { id: 2, userId: 2, type: 'internship_rejected', message: 'Your application for Backend Developer Intern has been rejected.', date: '2026-05-01', read: false },
  
  // Project Feedback and Comments (Student)
  { id: 10, userId: 1, type: 'project_feedback', message: 'Instructor Dr. Mervat commented on your Smart Campus App project: "Great work on the UI design!".', date: '2026-05-02', read: true },
  { id: 11, userId: 1, type: 'task_comment', message: 'Dr. Ahmed added a comment on your Frontend Development task.', date: '2026-05-01', read: false },
  { id: 12, userId: 2, type: 'project_feedback', message: 'Instructor Dr. Omar provided feedback on your Network Visualizer project.', date: '2026-05-02', read: false },
  
  // Project Flagged (Student)
  { id: 13, userId: 1, type: 'project_flagged', message: 'Your Smart Campus App project has been flagged for potential plagiarism.', date: '2026-05-03', read: false },
  { id: 14, userId: 3, type: 'project_flagged', message: 'Your Library Management DB project has been flagged for copyright violation.', date: '2026-05-03', read: true },
  
  // Project Invitation (Student)
  { id: 4, userId: 1, type: 'project_invitation', message: 'You have been invited to collaborate on the Network Visualizer project by Ahmed Hassan.', date: '2026-05-04', read: false },
  { id: 5, userId: 3, type: 'project_invitation', message: 'You have been invited to contribute feedback on the Smart Campus App project.', date: '2026-05-03', read: true },
  
  // Private Messages (Student)
  { id: 7, userId: 1, type: 'private_message', message: 'You have received a private message from Dr. Aya Salama.', date: '2026-05-05', read: true },
  { id: 8, userId: 2, type: 'private_message', message: 'You have a new message from Ahmed Corp Recruiter.', date: '2026-05-04', read: false },
  { id: 9, userId: 1, type: 'private_message', message: 'New message from Dr. Omar regarding your project feedback.', date: '2026-04-30', read: true },
];

export const INOTIFICATIONS = [
  
  // Project Invitation (Instructor)
  { id: 1, userId: 1, type: 'project_invitation', message: 'You have been invited to supervise the Network Visualizer project by Ahmed Hassan.', date: '2026-05-04', read: false },
  { id: 2, userId: 3, type: 'project_invitation', message: 'You have been invited to review the Smart Campus App project as a course instructor.', date: '2026-05-03', read: true },
  
  // Private Messages (Instructor)
  { id: 3, userId: 1, type: 'private_message', message: 'You have received a private message from Dean Dr. Aya Salama.', date: '2026-05-05', read: true },
  { id: 4, userId: 2, type: 'private_message', message: 'You have a new message from Student Omar about thesis feedback.', date: '2026-05-04', read: false },
  { id: 5, userId: 1, type: 'private_message', message: 'New message from Department Head regarding course curriculum changes.', date: '2026-04-30', read: true },
];


export const SAMPLE_FINAL_DRAFTS = {
  1: { 
    id: 103,
    name: 'Thesis_Draft_v3_Final_Candidate.pdf',
    url: '/thesis_sample.pdf',
    uploadDate: '2024-02-01T09:45:00.000Z'
  }
};

export const SAMPLE_COLLABORATORS = {

  1: [ 
    {
      id: 1001,
      userId: 2,
      name: 'Sara Ali',
      email: 'sara.ali@student.guc.edu.eg',
      firstName: 'Sara',
      lastName: 'Ali',
      role: 'Collaborator',
      joinedAt: '2024-01-05T10:00:00.000Z'
    },
    {
      id: 1002,
      userId: 3,
      name: 'Youssef Khaled',
      email: 'youssef.k@student.guc.edu.eg',
      firstName: 'Youssef',
      lastName: 'Khaled',
      role: 'Collaborator',
      joinedAt: '2024-01-08T14:30:00.000Z'
    },
    {
      id: 1003,
      userId: 101,
      name: 'Dr. Ahmed Hassan',
      email: 'ahmed.hassan@guc.edu.eg',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      role: 'Course Instructor',
      joinedAt: '2024-01-03T09:15:00.000Z'
    }
  ],
  2: [
    {
      id: 2001,
      userId: 2,
      name: 'Sara Ali',
      email: 'sara.ali@student.guc.edu.eg',
      firstName: 'Sara',
      lastName: 'Ali',
      role: 'Collaborator',
      joinedAt: '2024-01-10T11:00:00.000Z'
    },
    {
      id: 2002,
      userId: 102,
      name: 'Prof. Sarah Mahmoud',
      email: 'sarah.mahmoud@guc.edu.eg',
      firstName: 'Sarah',
      lastName: 'Mahmoud',
      role: 'Course Instructor',
      joinedAt: '2024-01-12T14:30:00.000Z'
    }
  ],
  3: [
    {
      id: 3001,
      userId: 1,
      name: 'Ahmed Mostafa',
      email: 'ahmed.m@student.guc.edu.eg',
      firstName: 'Ahmed',
      lastName: 'Mostafa',
      role: 'Collaborator',
      joinedAt: '2024-02-01T09:00:00.000Z'
    },
    {
      id: 3002,
      userId: 103,
      name: 'Dr. Mohamed Ibrahim',
      email: 'mohamed.ibrahim@guc.edu.eg',
      firstName: 'Mohamed',
      lastName: 'Ibrahim',
      role: 'Course Instructor',
      joinedAt: '2024-02-03T11:20:00.000Z'
    }
  ],
  4: [
    {
      id: 4001,
      userId: 1,
      name: 'Ahmed Mostafa',
      email: 'ahmed.m@student.guc.edu.eg',
      firstName: 'Ahmed',
      lastName: 'Mostafa',
      role: 'Collaborator',
      joinedAt: '2024-01-20T10:15:00.000Z'
    }
  ]
};

export const SAMPLE_INVITATIONS = {
  1: [
    {
      id: 5001,
      userId: 4,
      name: 'Dr. Mervat',
      email: 'mervat@guc.edu.eg',
      status: 'pending',
      invitedAt: '2024-02-01T09:00:00.000Z',
      role: 'Course Instructor'
    },
    {
      id: 5002,
      userId: 5,
      name: 'Dr. Aya Salama',
      email: 'aya.salama@guc.edu.eg',
      status: 'pending',
      invitedAt: '2024-02-02T10:30:00.000Z',
      role: 'Course Instructor'
    }
  ],
  2: [
    {
      id: 5003,
      userId: 3,
      name: 'Youssef Khaled',
      email: 'youssef.k@student.guc.edu.eg',
      status: 'accepted',
      invitedAt: '2024-01-20T14:00:00.000Z',
      role: 'Collaborator'
    }
  ],
  3: [
    {
      id: 5004,
      userId: 1,
      name: 'Ahmed Mostafa',
      email: 'ahmed.m@student.guc.edu.eg',
      status: 'pending',
      invitedAt: '2024-02-10T09:30:00.000Z',
      role: 'Collaborator'
    }
  ]
};

export const SAMPLE_TASKS = {
  1: [ 
    {
      id: 6001,
      title: 'Frontend Development',
      description: 'Complete the React components for the dashboard',
      assignedTo: 'Sara Ali',
      status: 'completed',
      deadline: '2024-01-20',
      importance: 5,
      createdAt: '2024-01-01T10:00:00.000Z',
      comments: [
        {
          id: 7001,
          text: 'Great progress on the frontend! Keep it up.',
          author: 'Dr. Ahmed Hassan',
          authorRole: 'Course Instructor',
          timestamp: '2024-01-15T14:30:00.000Z'
        },
        {
          id: 7002,
          text: 'I have completed the main components.',
          author: 'Sara Ali',
          authorRole: 'Collaborator',
          timestamp: '2024-01-18T09:45:00.000Z'
        }
      ]
    },
    {
      id: 6002,
      title: 'Backend API Integration',
      description: 'Connect frontend to backend APIs',
      assignedTo: 'Youssef Khaled',
      status: 'pending',
      deadline: '2024-02-10',
      importance: 4,
      createdAt: '2024-01-05T11:30:00.000Z',
      comments: [
        {
          id: 7003,
          text: 'Make sure to handle error cases properly.',
          author: 'Dr. Ahmed Hassan',
          authorRole: 'Course Instructor',
          timestamp: '2024-01-20T10:15:00.000Z'
        }
      ]
    },
    {
      id: 6003,
      title: 'Write Documentation',
      description: 'Create technical documentation for the project',
      assignedTo: 'Unassigned',
      status: 'pending',
      deadline: '2024-02-20',
      importance: 3,
      createdAt: '2024-01-15T14:20:00.000Z',
      comments: []
    }
  ],
  2: [
    {
      id: 6004,
      title: 'Design UI/UX',
      description: 'Create wireframes and prototypes',
      assignedTo: 'Sara Ali',
      status: 'completed',
      deadline: '2024-01-25',
      importance: 4,
      createdAt: '2024-01-10T09:00:00.000Z',
      comments: [
        {
          id: 7004,
          text: 'Great design! Love the color scheme.',
          author: 'Prof. Sarah Mahmoud',
          authorRole: 'Course Instructor',
          timestamp: '2024-01-24T14:00:00.000Z'
        }
      ]
    }
  ],
  3: [
    {
      id: 6005,
      title: 'Implement Network Visualization',
      description: 'Create D3.js visualization for network topology',
      assignedTo: 'Ahmed Mostafa',
      status: 'in-progress',
      deadline: '2024-03-15',
      importance: 5,
      createdAt: '2024-02-01T11:00:00.000Z',
      comments: [
        {
          id: 7005,
          text: 'Make sure to handle large datasets efficiently.',
          author: 'Dr. Mohamed Ibrahim',
          authorRole: 'Course Instructor',
          timestamp: '2024-02-05T09:30:00.000Z'
        }
      ]
    },
    {
      id: 6006,
      title: 'Write Network Algorithms',
      description: 'Implement routing algorithms',
      assignedTo: 'Sara Ali',
      status: 'pending',
      deadline: '2024-03-20',
      importance: 4,
      createdAt: '2024-02-05T14:00:00.000Z',
      comments: []
    }
  ],
  4: [
    {
      id: 6007,
      title: 'Database Schema Design',
      description: 'Design normalized database schema',
      assignedTo: 'Ahmed Mostafa',
      status: 'completed',
      deadline: '2024-01-30',
      importance: 5,
      createdAt: '2024-01-15T10:00:00.000Z',
      comments: [
        {
          id: 7006,
          text: 'Good schema design! Remember to add indexes.',
          author: 'Dr. Mohamed Ibrahim',
          authorRole: 'Course Instructor',
          timestamp: '2024-01-28T11:00:00.000Z'
        }
      ]
    },
    {
      id: 6008,
      title: 'Implement Search Functionality',
      description: 'Add advanced search with filters',
      assignedTo: 'Youssef Khaled',
      status: 'pending',
      deadline: '2024-03-10',
      importance: 3,
      createdAt: '2024-02-10T15:30:00.000Z',
      comments: []
    }
  ]
};

export const SAMPLE_PROJECT_COMMENTS = {
  1: [
    {
      id: 8001,
      text: 'The project is coming along nicely. Great teamwork!',
      author: 'Dr. Ahmed Hassan',
      authorRole: 'Course Instructor',
      timestamp: '2024-01-12T10:30:00.000Z'
    },
    {
      id: 8002,
      text: 'We need to improve the UI/UX design.',
      author: 'Prof. Sarah Mahmoud',
      authorRole: 'Course Instructor',
      timestamp: '2024-01-18T14:15:00.000Z'
    }
  ],
  2: [
    {
      id: 8003,
      text: 'Good progress on the software architecture.',
      author: 'Prof. Sarah Mahmoud',
      authorRole: 'Course Instructor',
      timestamp: '2024-01-20T10:00:00.000Z'
    }
  ],
  3: [
    {
      id: 8004,
      text: 'Interesting approach to network visualization!',
      author: 'Dr. Mohamed Ibrahim',
      authorRole: 'Course Instructor',
      timestamp: '2024-02-08T14:30:00.000Z'
    },
    {
      id: 8005,
      text: 'Thank you! We are working hard on this project.',
      author: 'Sara Ali',
      authorRole: 'Student',
      timestamp: '2024-02-09T09:15:00.000Z'
    }
  ],
  4: [
    {
      id: 8006,
      text: 'Database design looks solid. Good job!',
      author: 'Dr. Ahmed Hassan',
      authorRole: 'Course Instructor',
      timestamp: '2024-01-25T11:00:00.000Z'
    }
  ]
};

export const SAMPLE_FLAGGED_PROJECTS = {
  1: {
    flagged: true,
    reason: 'Project contains code that appears to be copied from online sources. Please provide original implementation or properly cite sources.',
    flaggedDate: '2024-01-25T09:00:00.000Z',
    flaggedBy: 'Prof. Sarah Mahmoud',
    appeal: null,
    appealStatus: null
  },
  4: { 
    flagged: true,
    reason: 'The submitted report appears to contain plagiarized content. Please resubmit with original work.',
    flaggedDate: '2024-02-01T10:00:00.000Z',
    flaggedBy: 'Dr. Mohamed Ibrahim',
    appeal: null,
    appealStatus: null
  }
};

// REPLACE your existing COURSE_INSTRUCTORS with this:
export const COURSE_INSTRUCTORS = [
  {
    id: 101,
    firstName: 'Ahmed',
    lastName: 'Hassan',
    name: 'Dr. Ahmed Hassan',
    email: 'ahmed.hassan@guc.edu.eg',
    role: 'Course Instructor',
    department: 'Computer Science',
    coursesTaught: ['Web Development', 'Computer Science', 'Database Systems', 'Software Engineering']
  },
  {
    id: 102,
    firstName: 'Sarah',
    lastName: 'Mahmoud',
    name: 'Prof. Sarah Mahmoud',
    email: 'sarah.mahmoud@guc.edu.eg',
    role: 'Senior Instructor',
    department: 'Computer Science',
    coursesTaught: ['Computer Networks', 'Web Development', 'UI/UX Design', 'Frontend Development']
  },
  {
    id: 103,
    firstName: 'Mohamed',
    lastName: 'Ibrahim',
    name: 'Dr. Mohamed Ibrahim',
    email: 'mohamed.ibrahim@guc.edu.eg',
    role: 'Course Instructor',
    department: 'Computer Science',
    coursesTaught: ['Database Systems', 'Data Science', 'Artificial Intelligence', 'Machine Learning']
  }
];

export const getInstructorsByCourse = (courseName) => {
  return COURSE_INSTRUCTORS.filter(instructor => 
    instructor.courses?.some(course => course === courseName)
  );
};


// ============================================================
// EMPLOYER-SPECIFIC DATA
// All employer-related static/mock data lives here so the
// general components stay data-agnostic.
// ============================================================

export const EMPLOYER_STATS = [
  { id: 1, label: 'Active Internships',     value: '4',  change: '+2 this month', icon: '💼', color: '#4f46e5' },
  { id: 2, label: 'Total Applicants',       value: '28', change: '+12 this week',  icon: '👥', color: '#10b981' },
  { id: 3, label: 'Applications Pending',   value: '16', change: 'need review',    icon: '📋', color: '#f59e0b' },
  { id: 4, label: 'Nominated Students',     value: '8',  change: 'top candidates', icon: '⭐', color: '#ef4444' },
];

export const INTERNSHIP_STATS = {
  totalInternshipsOffered: 24,
  totalStudentsCompleted:  18,
  currentInterns:          6,
  completionRate:          75,
};

export const CHART_DATA = {
  year: {
    internships: [8, 10, 6],
    students:    [6, 9, 3],
    labels:      ['2024', '2025', '2026'],
  },
  month: {
    internships: [3, 2, 4, 5, 3, 2],
    students:    [2, 1, 3, 4, 2, 1],
    labels:      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
  all: {
    internships: [18, 6],
    students:    [15, 3],
    labels:      ['2024-2025', '2025-2026'],
  },
};

export const RECENT_APPLICANTS = [
  { name: 'Mariam Boulos', position: 'Frontend Intern',  status: 'Pending',   avatar: 'MB' },
  { name: 'Omar Khaled',   position: 'AI Internship',    status: 'Nominated', avatar: 'OK' },
  { name: 'Sara Ahmed',    position: 'Backend Intern',   status: 'Pending',   avatar: 'SA' },
  { name: 'Youssef Ali',   position: 'ML Internship',    status: 'Nominated', avatar: 'YA' },
];

export const INITIAL_APPLICATIONS = [
  { id: 1, name: 'Mariam Boulos', email: 'mariam@guc.edu.eg', major: 'Computer Engineering', projects: 4, status: 'pending', isFavorite: true,  internship: 'Frontend Internship - React Team'  },
  { id: 2, name: 'Omar Khaled',   email: 'omar@guc.edu.eg',   major: 'Computer Science',     projects: 6, status: 'pending', isFavorite: false, internship: 'AI Internship - Data Team'         },
  { id: 3, name: 'Sara Ahmed',    email: 'sara@guc.edu.eg',   major: 'Software Engineering', projects: 2, status: 'pending', isFavorite: false, internship: 'Backend Internship - Node Team'    },
  { id: 4, name: 'Youssef Ali',   email: 'youssef@guc.edu.eg',major: 'Computer Science',     projects: 8, status: 'pending', isFavorite: false, internship: 'ML Internship - AI Team'           },
  { id: 5, name: 'Nour El Din',   email: 'nour@guc.edu.eg',   major: 'Information Systems',  projects: 5, status: 'pending', isFavorite: true,  internship: 'UI/UX Internship - Design Team'   },
];

export const INITIAL_INTERNSHIPS = [
  {
    id: 1,
    title: 'Frontend Developer Intern',
    description: 'Build responsive web applications using React. Collaborate with design team and participate in code reviews.',
    skills: ['React', 'JavaScript', 'CSS', 'Git'],
    duration: '3 months',
    deadline: '2026-06-30',
    languages: ['JavaScript', 'HTML/CSS'],
    status: 'hiring',
    archived: false,
  },
  {
    id: 2,
    title: 'Backend Developer Intern',
    description: 'Develop RESTful APIs and work with databases. Implement authentication and authorization.',
    skills: ['Node.js', 'Python', 'MongoDB', 'SQL'],
    duration: '4 months',
    deadline: '2026-07-15',
    languages: ['Python', 'JavaScript', 'SQL'],
    status: 'hiring',
    archived: false,
  },
];

export const PORTFOLIO_STUDENTS = [
  {
    id: 1,
    name: 'Mariam Boulos',
    email: 'mariam@guc.edu.eg',
    major: 'Computer Engineering',
    skills: ['React', 'Java', 'UI/UX'],
    description: 'Computer Engineering student passionate about frontend development.',
    projects: [
      { id: 101, title: 'Smart Parking System', course: 'Digital System Design', instructor: 'Dr. Ahmed', date: '2026-03-15', technologies: ['VHDL', 'FPGA', 'ModelSim'], description: 'FPGA-based smart parking system using sensors and VHDL.' },
      { id: 102, title: 'Portfolio Website',    course: 'Web Development',       instructor: 'Dr. Sara',  date: '2026-04-20', technologies: ['React', 'CSS', 'JavaScript'], description: 'Responsive portfolio website for showcasing student work.' },
    ],
  },
  {
    id: 2,
    name: 'Omar Khaled',
    email: 'omar@guc.edu.eg',
    major: 'Computer Science',
    skills: ['Python', 'Machine Learning', 'SQL'],
    description: 'Computer Science student interested in AI systems and backend engineering.',
    projects: [
      { id: 201, title: 'AI Chatbot', course: 'Artificial Intelligence', instructor: 'Dr. Mona', date: '2026-02-10', technologies: ['Python', 'NLP', 'TensorFlow'], description: 'Chatbot using NLP and machine learning models.' },
    ],
  },
];

export const FAVORITE_STUDENTS = [
  { id: 1, name: 'Mariam Boulos', email: 'mariam@guc.edu.eg', major: 'Computer Engineering', description: 'Frontend developer interested in UI/UX and embedded systems.' },
  { id: 2, name: 'Omar Khaled',   email: 'omar@guc.edu.eg',   major: 'Computer Science',     description: 'Machine learning enthusiast with backend experience.'        },
];

export const FAVORITE_PROJECTS = [
  { id: 101, title: 'Smart Parking System', course: 'Digital System Design', date: '2026-03-15', description: 'FPGA-based smart parking system using sensors and VHDL.' },
  { id: 102, title: 'AI Chatbot',           course: 'Artificial Intelligence', date: '2026-04-02', description: 'NLP chatbot trained using machine learning models.'        },
];

export const DEFAULT_COMPANY_PROFILE = {
  name: 'TechCorp Egypt',
  email: 'contact@techcorp.com',
  phone: '+20 123 456 7890',
  website: 'www.techcorp.com',
  industry: 'Information Technology',
  founded: '2015',
  employeeCount: '50-100',
  bio: 'TechCorp Egypt is a leading technology company specializing in software development, AI solutions, and digital transformation services.',
  address: '123 Nile Street, Cairo, Egypt',
  city: 'Cairo',
  country: 'Egypt',
  postalCode: '11511',
  location: { lat: 30.0444, lng: 31.2357 },
};

export const EMPLOYER_NOTIFICATIONS = [
  { id: 1, title: 'New Application',       message: 'Mariam Boulos applied for Frontend Developer Intern', time: 'Just now',    read: false, icon: '👤' },
  { id: 2, title: 'Application Accepted',  message: 'Omar Khaled accepted your internship offer',          time: '2 hours ago', read: false, icon: '✅' },
  { id: 3, title: 'Internship Closing Soon', message: 'Backend Developer Intern posting closes tomorrow',  time: '1 day ago',   read: false, icon: '⚠️' },
  { id: 4, userId: 1, type: 'private_message', message: 'You have received a private message from Dr. Aya Salama.', date: '2026-05-05', read: true }
];

export const STUDENT_FAVORITES = {
  1: { // Ahmed Mostafa
    projects: [
      {
        id: 1,
        title: "AI-Powered Thesis Management System",
        course: "Bachelor Project",
        student: "Ahmed Mostafa",
        githubLink: "https://github.com/student/thesis-project",
        programmingLanguages: ["React", "Node.js", "Python"],
        demoVideo: "https://youtube.com/watch?v=demo1",
        createdAt: "2024-01-15",
        description: "Comprehensive thesis management system with AI-powered insights",
        stars: 24,
        views: 156
      },
      {
        id: 2,
        title: "E-Learning Platform",
        course: "Software Engineering",
        student: "Ahmed Mostafa",
        githubLink: "https://github.com/student/elearning",
        programmingLanguages: ["React", "JavaScript", "MongoDB"],
        demoVideo: "https://youtube.com/watch?v=demo2",
        createdAt: "2024-01-20",
        description: "Interactive e-learning platform with real-time collaboration",
        stars: 18,
        views: 89
      }
    ],
    portfolios: [
      {
        id: 101,
        name: "Sara Ali",
        email: "sara@student.guc.edu.eg",
        major: "Computer Engineering",
        description: "Frontend developer interested in UI/UX and embedded systems.",
        skills: ["React", "CSS", "JavaScript", "FPGA"],
        website: "https://sara-portfolio.com",
        linkedIn: "https://linkedin.com/in/sara-ali",
        projects: 5,
        stars: 42
      },
      {
        id: 102,
        name: "Omar Khaled",
        email: "omar@guc.edu.eg",
        major: "Computer Science",
        description: "Machine learning enthusiast with backend experience.",
        skills: ["Python", "Machine Learning", "SQL", "Django"],
        website: "https://omar-portfolio.com",
        linkedIn: "https://linkedin.com/in/omar-khaled",
        projects: 8,
        stars: 67
      }
    ]
  },
  2: { // Sara Ali
    projects: [
      {
        id: 3,
        title: "Network Visualizer",
        course: "Computer Networks",
        student: "Sara Ali",
        githubLink: "https://github.com/sara-ali/network-viz",
        programmingLanguages: ["Python", "D3.js", "JavaScript"],
        demoVideo: "https://youtube.com/watch?v=example3",
        createdAt: "2026-03-01",
        description: "Advanced network topology visualization tool",
        stars: 34,
        views: 203
      },
      {
        id: 5,
        title: "Data Analytics Dashboard",
        course: "Data Mining",
        student: "Sara Ali",
        githubLink: "https://github.com/sara-ali/analytics",
        programmingLanguages: ["Python", "Pandas", "D3.js"],
        demoVideo: "https://youtube.com/watch?v=demo5",
        createdAt: "2026-02-15",
        description: "Interactive dashboard for analyzing large datasets",
        stars: 28,
        views: 145
      }
    ],
    portfolios: [
      {
        id: 103,
        name: "Noor Ibrahim",
        email: "noor@guc.edu.eg",
        major: "Information Systems",
        description: "Full-stack developer with expertise in cloud technologies.",
        skills: ["Node.js", "AWS", "MongoDB", "Docker"],
        website: "https://noor-portfolio.com",
        linkedIn: "https://linkedin.com/in/noor-ibrahim",
        projects: 6,
        stars: 55
      }
    ]
  },
  3: { // Youssef Khaled
    projects: [
      {
        id: 4,
        title: "Library Management System",
        course: "Database Systems",
        student: "Youssef Khaled",
        githubLink: "https://github.com/youssef-khaled/library-db",
        programmingLanguages: ["Java", "SQL", "Spring"],
        demoVideo: "https://youtube.com/watch?v=example4",
        createdAt: "2026-01-20",
        description: "Comprehensive library management system with advanced search",
        stars: 12,
        views: 67
      },
      {
        id: 6,
        title: "Mobile Payment Gateway",
        course: "Software Engineering",
        student: "Youssef Khaled",
        githubLink: "https://github.com/youssef-khaled/payment",
        programmingLanguages: ["Java", "Spring Boot", "PostgreSQL"],
        demoVideo: "https://youtube.com/watch?v=demo6",
        createdAt: "2026-02-10",
        description: "Secure mobile payment processing system",
        stars: 31,
        views: 178
      }
    ],
    portfolios: [
      {
        id: 104,
        name: "Fatima Hassan",
        email: "fatima@guc.edu.eg",
        major: "Computer Engineering",
        description: "Backend engineer specializing in microservices architecture.",
        skills: ["Java", "Kubernetes", "AWS", "PostgreSQL"],
        website: "https://fatima-portfolio.com",
        linkedIn: "https://linkedin.com/in/fatima-hassan",
        projects: 9,
        stars: 78
      }
    ]
  }
};
