// data/recommendedProjectsData.js

// Sample user profiles for different roles
export const USER_PROFILES = {
  student: {
    id: 'current-student',
    role: 'student',
    major: 'Computer Science',
    skills: ['React', 'Python', 'Node.js', 'MongoDB'],
    interests: ['Web Development', 'AI', 'Cloud Computing'],
    completedCourses: ['Web Development', 'Database Systems', 'Artificial Intelligence']
  },
  employer: {
    id: 'current-employer',
    role: 'employer',
    company: 'Tech Corp Inc.',
    industry: 'Software Development',
    lookingFor: ['React', 'Node.js', 'Python', 'Machine Learning'],
    requiredSkills: ['Full Stack', 'AI', 'Cloud'],
    pastHires: ['Computer Science', 'Computer Engineering']
  },
  courseInstructor: {
    id: 'current-instructor',
    role: 'instructor',
    name: 'Dr. Sara',
    department: 'Computer Science',
    expertise: ['Web Development', 'React', 'Node.js'],
    taughtCourses: ['Web Development', 'Advanced JavaScript', 'Full Stack Development']
  }
};

// Enhanced projects with more metadata for recommendations
export const RECOMMENDATION_PROJECTS = [
  { 
    id: 5, 
    title: "E-Learning Platform", 
    student: "Youssef Mansour", 
    course: "Web Development", 
    instructor: "Dr. Sara", 
    date: "2026-04-25", 
    technologies: ["React", "Node.js", "MongoDB"], 
    rating: 4.8, 
    description: "Online learning platform.",
    category: "Web Development",
    difficulty: "Intermediate",
    studentMajor: "Computer Engineering",
    studentSkills: ["React", "Node.js", "MongoDB", "Express"]
  },
  { 
    id: 6, 
    title: "Stock Price Predictor", 
    student: "Nadine Atef", 
    course: "Artificial Intelligence", 
    instructor: "Dr. Khaled", 
    date: "2026-02-28", 
    technologies: ["Python", "TensorFlow"], 
    rating: 4.9, 
    description: "LSTM-based stock prediction model.",
    category: "AI/ML",
    difficulty: "Advanced",
    studentMajor: "Computer Science",
    studentSkills: ["Python", "Django", "Machine Learning", "Pandas"]
  },
  { 
    id: 7, 
    title: "Smart Home Automation", 
    student: "Farida Hany", 
    course: "Embedded Systems", 
    instructor: "Dr. Ahmed", 
    date: "2026-01-15", 
    technologies: ["Arduino", "C++"], 
    rating: 4.6, 
    description: "IoT home automation system.",
    category: "IoT",
    difficulty: "Intermediate",
    studentMajor: "Computer Engineering",
    studentSkills: ["C++", "Embedded Systems", "Arduino", "IoT"]
  },
  { 
    id: 8, 
    title: "Task Management App", 
    student: "Youssef Mansour", 
    course: "Software Engineering", 
    instructor: "Dr. Ahmed", 
    date: "2026-03-20", 
    technologies: ["React", "Express"], 
    rating: 4.5, 
    description: "Team collaboration tool.",
    category: "Web Development",
    difficulty: "Beginner",
    studentMajor: "Computer Engineering",
    studentSkills: ["React", "Node.js", "MongoDB", "Express"]
  },
  { 
    id: 9, 
    title: "Movie Recommender", 
    student: "Nadine Atef", 
    course: "Data Mining", 
    instructor: "Dr. Mona", 
    date: "2026-03-15", 
    technologies: ["Python", "Pandas"], 
    rating: 4.7, 
    description: "Movie recommendation engine.",
    category: "AI/ML",
    difficulty: "Intermediate",
    studentMajor: "Computer Science",
    studentSkills: ["Python", "Django", "Machine Learning", "Pandas"]
  },
  { 
    id: 10, 
    title: "Cloud Inventory System", 
    student: "Karim Wael", 
    course: "Cloud Computing", 
    instructor: "Dr. Youssef", 
    date: "2026-04-18", 
    technologies: ["Java", "Spring Boot", "AWS"], 
    rating: 4.4, 
    description: "AWS cloud inventory system.",
    category: "Cloud Computing",
    difficulty: "Advanced",
    studentMajor: "Information Systems",
    studentSkills: ["Java", "Spring Boot", "AWS", "Docker"]
  },
  { 
    id: 11, 
    title: "E-commerce Store", 
    student: "Seif Eldin", 
    course: "Web Development", 
    instructor: "Dr. Sara", 
    date: "2026-04-22", 
    technologies: ["Vue.js", "Firebase"], 
    rating: 4.9, 
    description: "Full e-commerce platform.",
    category: "Web Development",
    difficulty: "Intermediate",
    studentMajor: "Computer Science",
    studentSkills: ["JavaScript", "Vue.js", "Firebase", "Tailwind"]
  },
  { 
    id: 12, 
    title: "HR Management System", 
    student: "Laila Hussein", 
    course: "Database Systems", 
    instructor: "Dr. Mona", 
    date: "2025-12-20", 
    technologies: ["PHP", "Laravel"], 
    rating: 4.2, 
    description: "HR management solution.",
    category: "Enterprise Systems",
    difficulty: "Intermediate",
    studentMajor: "Information Systems",
    studentSkills: ["PHP", "Laravel", "MySQL", "Bootstrap"]
  },
  { 
    id: 13, 
    title: "Waste Management Tracker", 
    student: "Farida Hany", 
    course: "IoT Systems", 
    instructor: "Dr. Youssef", 
    date: "2026-03-30", 
    technologies: ["ESP32", "Sensors"], 
    rating: 4.3, 
    description: "Smart bin monitoring.",
    category: "IoT",
    difficulty: "Intermediate",
    studentMajor: "Computer Engineering",
    studentSkills: ["C++", "Embedded Systems", "Arduino", "IoT"]
  },
  { 
    id: 14, 
    title: "AI Image Classifier", 
    student: "Nadine Atef", 
    course: "Artificial Intelligence", 
    instructor: "Dr. Khaled", 
    date: "2026-05-01", 
    technologies: ["Python", "PyTorch"], 
    rating: 4.9, 
    description: "Deep learning image classification.",
    category: "AI/ML",
    difficulty: "Advanced",
    studentMajor: "Computer Science",
    studentSkills: ["Python", "Django", "Machine Learning", "Pandas"]
  },
  { 
    id: 15, 
    title: "Blockchain Voting System", 
    student: "Karim Wael", 
    course: "Cloud Computing", 
    instructor: "Dr. Youssef", 
    date: "2026-05-05", 
    technologies: ["Solidity", "Web3"], 
    rating: 4.7, 
    description: "Decentralized voting platform.",
    category: "Blockchain",
    difficulty: "Advanced",
    studentMajor: "Information Systems",
    studentSkills: ["Java", "Spring Boot", "AWS", "Docker"]
  }
];

// Helper function to safely check if a project exists in favorites
const isProjectInFavorites = (projectId, favoriteProjects) => {
  return favoriteProjects && Array.isArray(favoriteProjects) && favoriteProjects.some(fav => fav.id === projectId);
};

// Helper function to safely check if a student's project exists in favorites
const isStudentProjectInFavorites = (student, favoriteProjects) => {
  if (!student || !student.projects || !Array.isArray(student.projects) || !favoriteProjects || !Array.isArray(favoriteProjects)) {
    return false;
  }
  return student.projects.some(p => favoriteProjects.some(fav => fav.id === p.id));
};

// Recommendation logic based on user role
export const getRecommendedProjects = (userRole, favoriteStudents = [], favoriteProjects = []) => {
  // Ensure favorites are arrays
  const safeFavoriteStudents = Array.isArray(favoriteStudents) ? favoriteStudents : [];
  const safeFavoriteProjects = Array.isArray(favoriteProjects) ? favoriteProjects : [];
  
  let recommendations = [];
  
  switch(userRole) {
    case 'student':
      recommendations = getStudentRecommendations(safeFavoriteStudents, safeFavoriteProjects);
      break;
    case 'employer':
      recommendations = getEmployerRecommendations(safeFavoriteStudents, safeFavoriteProjects);
      break;
    case 'instructor':
      recommendations = getInstructorRecommendations(safeFavoriteStudents, safeFavoriteProjects);
      break;
    default:
      recommendations = [];
  }
  
  // Return top 6 recommendations
  return recommendations.slice(0, 6);
};

// Student-based recommendations (projects matching their major, skills, and interests)
const getStudentRecommendations = (favoriteStudents, favoriteProjects) => {
  const userProfile = USER_PROFILES.student;
  
  let scoredProjects = RECOMMENDATION_PROJECTS.map(project => {
    let score = 0;
    
    // Match by skills (40% weight)
    const skillMatches = project.technologies.filter(tech => 
      userProfile.skills.some(skill => 
        tech.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(tech.toLowerCase())
      )
    ).length;
    score += (skillMatches / Math.max(project.technologies.length, 1)) * 40;
    
    // Match by course interests (30% weight)
    const interestMatches = userProfile.interests.filter(interest =>
      project.category?.toLowerCase().includes(interest.toLowerCase()) ||
      project.course.toLowerCase().includes(interest.toLowerCase())
    ).length;
    score += (interestMatches / Math.max(userProfile.interests.length, 1)) * 30;
    
    // Match by major (20% weight)
    if (project.studentMajor === userProfile.major) {
      score += 20;
    }
    
    // Rating boost (10% weight)
    score += (project.rating / 5) * 10;
    
    // Bonus from favorites
    if (isProjectInFavorites(project.id, favoriteProjects)) {
      score += 15;
    }
    
    // Check if any favorite student has this project
    const hasFavoriteStudentProject = favoriteStudents.some(student => 
      isStudentProjectInFavorites(student, [project])
    );
    if (hasFavoriteStudentProject) {
      score += 10;
    }
    
    return { ...project, score };
  });
  
  return scoredProjects.sort((a, b) => b.score - a.score);
};

// Employer-based recommendations (projects matching required skills and industry)
const getEmployerRecommendations = (favoriteStudents, favoriteProjects) => {
  const userProfile = USER_PROFILES.employer;
  
  let scoredProjects = RECOMMENDATION_PROJECTS.map(project => {
    let score = 0;
    
    // Match by required skills (50% weight)
    const skillMatches = project.technologies.filter(tech =>
      userProfile.lookingFor.some(skill =>
        tech.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(tech.toLowerCase())
      )
    ).length;
    score += (skillMatches / Math.max(project.technologies.length, 1)) * 50;
    
    // Match by student major (20% weight)
    if (userProfile.pastHires.includes(project.studentMajor)) {
      score += 20;
    }
    
    // Project rating (20% weight)
    score += (project.rating / 5) * 20;
    
    // Project complexity/industry relevance (10% weight)
    const relevantCategories = ['Web Development', 'AI/ML', 'Cloud Computing'];
    if (relevantCategories.includes(project.category)) {
      score += 10;
    }
    
    // Bonus from favorites
    if (isProjectInFavorites(project.id, favoriteProjects)) {
      score += 15;
    }
    
    return { ...project, score };
  });
  
  return scoredProjects.sort((a, b) => b.score - a.score);
};

// Instructor-based recommendations (projects from their courses or expertise)
const getInstructorRecommendations = (favoriteStudents, favoriteProjects) => {
  const userProfile = USER_PROFILES.courseInstructor;
  
  let scoredProjects = RECOMMENDATION_PROJECTS.map(project => {
    let score = 0;
    
    // Match by instructor name (40% weight)
    if (project.instructor === userProfile.name) {
      score += 40;
    }
    
    // Match by taught courses (30% weight)
    if (userProfile.taughtCourses.includes(project.course)) {
      score += 30;
    }
    
    // Match by expertise (20% weight)
    const expertiseMatches = project.technologies.filter(tech =>
      userProfile.expertise.some(exp =>
        tech.toLowerCase().includes(exp.toLowerCase()) ||
        exp.toLowerCase().includes(tech.toLowerCase())
      )
    ).length;
    score += (expertiseMatches / Math.max(project.technologies.length, 1)) * 20;
    
    // Project rating (10% weight)
    score += (project.rating / 5) * 10;
    
    // Bonus from favorites
    if (isProjectInFavorites(project.id, favoriteProjects)) {
      score += 15;
    }
    
    return { ...project, score };
  });
  
  return scoredProjects.sort((a, b) => b.score - a.score);
};