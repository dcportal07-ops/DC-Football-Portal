


export let role = "admin"; 

export const coachesData = [
  {
    id: 1,
    userId: "coach_001",
    name: "Arjun Patel",
    email: "arjun.patel@dcway.com",
    photo:
      "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "9876543210",
    specialties: ["Technical", "Dribbling", "Ball Control"],
    teams: ["U14 Tigers"],
    role: "COACH"
  },
  {
    id: 2,
    userId: "coach_002",
    name: "Simran Kaur",
    email: "simran.kaur@dcway.com",
    photo:
      "https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "9876543211",
    specialties: ["Tactical", "Decision-Making", "Positioning"],
    teams: ["U12 Gold"],
    role: "COACH"
  },
  {
    id: 3,
    userId: "admin_001",
    name: "Rohit Sharma",
    email: "rohit.admin@dcway.com",
    photo:
      "https://images.pexels.com/photos/428328/pexels-photo-428328.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "9876543212",
    specialties: ["Admin", "Ops"],
    teams: [],
    role: "ADMIN"
  }
];

export const teamsData = [
  { id: 1, code: "U14_TIGERS", name: "U14 Tigers", ageGroup: "11-14", coach: "Arjun Patel" },
  { id: 2, code: "U12_GOLD", name: "U12 Gold", ageGroup: "9-12", coach: "Simran Kaur" },
  { id: 3, code: "U10_ACAD", name: "U10 Academy", ageGroup: "8-10", coach: "Simran Kaur" }
];

// players: include dob so you can compute age; parentEmail links to parentsData
export const playersData = [
  {
    id: 1,
    playerId: "player_leo_001",
    firstName: "Leo",
    lastName: "Anderson",
    name: "Leo Anderson",
    dob: "2013-05-04T00:00:00.000Z", // age 12 (2025)
    gender: "M",
    team: "U14 Tigers",
    jerseyNumber: 17,
    parentEmail: "parent.leo@family.com",
    photo:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    createdAt: "2025-10-01T10:00:00.000Z",
    address: "123 Main St, Springfield, USA"
  },
  {
    id: 2,
    playerId: "player_mason_002",
    firstName: "Mason",
    lastName: "Rivera",
    name: "Mason Rivera",
    dob: "2015-04-12T00:00:00.000Z", // age 10
    gender: "M",
    team: "U12 Gold",
    jerseyNumber: 9,
    parentEmail: "mason.parent@family.com",
    photo:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1200",
    createdAt: "2025-09-20T09:00:00.000Z",
    address: "123 Main St, Springfield, USA"
  },
  {
    id: 3,
    playerId: "player_daniel_003",
    firstName: "Daniel",
    lastName: "Chen",
    name: "Daniel Chen",
    dob: "2016-02-15T00:00:00.000Z", // age 9
    gender: "M",
    team: "U10 Academy",
    jerseyNumber: 7,
    parentEmail: "chen.family@family.com",
    photo:
      "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=1200",
    createdAt: "2025-08-10T12:00:00.000Z",
    address: "123 Main St, Springfield, USA"
  },
  {
    id: 4,
    playerId: "player_sofia_004",
    firstName: "Sofia",
    lastName: "Edwards",
    name: "Sofia Edwards",
    dob: "2014-01-20T00:00:00.000Z", // age 11
    gender: "F",
    team: "U13 Girls",
    jerseyNumber: 10,
    parentEmail: "sofia.parent@family.com",
    photo:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1200",
    createdAt: "2025-07-15T08:00:00.000Z",
    address: "123 Main St, Springfield, USA"
  }
];


// small drill sample (use these as drop-in examples from your 280 list)
export const drillsData = [
  {
    id: "TEC_006",
    code: "TEC_006",
    name: "V-Cut (Inside)",
    category: "Technical",
    level: "Intermediate",
    primarySkills: ["Dribbling", "Ball Control"],
    minAge: 5,
    maxAge: 99,
    description: "Pull back and push diagonally (45°) using the inside of the same foot to create space.",
    regressionTip: "Perform at 50% speed focusing on body shape.",
    progressionTip: "Add passive defender pressure; increase angle speed.",
    videoUrl: "https://example.com/tec_006_video"
  },
  {
    id: "TEC_014",
    code: "TEC_014",
    name: "Dribble Slalom",
    category: "Technical",
    level: "Intermediate",
    primarySkills: ["Dribbling", "Coordination"],
    minAge: 5,
    maxAge: 99,
    description: "Dribble through cones with controlled touches, head up every 3 touches.",
    regressionTip: "Use wider spacing and walk through first.",
    progressionTip: "Close cone gap & increase speed.",
    videoUrl: "https://example.com/tec_014_video"
  },
  {
    id: "PHY_009",
    code: "PHY_009",
    name: "Wall Acceleration",
    category: "Physical",
    level: "Advanced",
    primarySkills: ["Speed", "Acceleration"],
    minAge: 12,
    maxAge: 99,
    description: "Explosive 10m acceleration drills using wall push-starts.",
    regressionTip: "Shorten to 5m and focus on technique.",
    progressionTip: "Add resisted sprint with light sled or partner hold.",
    videoUrl: "https://example.com/phy_009_video"
  },
  {
    id: "MENT_003",
    code: "MENT_003",
    name: "Visualization Routine",
    category: "Mental",
    level: "Beginner",
    primarySkills: ["Concentration", "Confidence"],
    minAge: 6,
    maxAge: 99,
    description: "Short guided visualization to rehearse key moves and calm nerves.",
    regressionTip: "Start with 1 minute breathing before visualization.",
    progressionTip: "Add match-scenario visualization at 80% intensity.",
    videoUrl: "https://example.com/ment_003_video"
  },
  {
    id: "TAC_011",
    code: "TAC_011",
    name: "Support Play Drill",
    category: "Tactical",
    level: "Intermediate",
    primarySkills: ["Support Play", "Decision-Making"],
    minAge: 9,
    maxAge: 99,
    description: "Small-sided drill focusing on support angles and quick decisions.",
    regressionTip: "Increase space and reduce defenders.",
    progressionTip: "Add neutral players and limit touches.",
    videoUrl: "https://example.com/tac_011_video"
  }
];


// sample evaluations (ratingsJson + computed overallJson)
export const evaluationsData = [
  {
    id: "eval_001",
    playerId: "player_leo_001",
    coachId: "coach_001",
    createdAt: "2025-11-21T08:30:00.000Z",
    ratingsJson: {
      technical: {
        "Ball Control": 5,
        "Dribbling": 4,
        "Passing Accuracy": 6,
        "Shooting": 5,
        "First Touch": 5,
        "Weak Foot Use": 3
      },
      tactical: {
        "Positioning": 4,
        "Decision-Making": 5,
        "Game Awareness": 4,
        "Support Play": 5,
        "Transition": 5,
        "Adaptability": 4
      },
      physical: {
        "Speed": 8,
        "Agility": 6,
        "Balance": 6,
        "Strength": 7,
        "Endurance": 6,
        "Coordination": 6
      },
      mental: {
        "Concentration": 5,
        "Confidence": 5,
        "Communication": 6,
        "Teamwork": 6,
        "Resilience": 4,
        "Motivation": 6
      },
      attacking: 5,
      defending: 5
    },
    overallJson: {
      technical: 4.67,
      tactical: 4.5,
      physical: 6.17,
      mental: 5.33,
      attacking: 5,
      defending: 5
    },
    note: "Initial baseline evaluation for Leo."
  },
  {
    id: "eval_002",
    playerId: "player_mason_002",
    coachId: "coach_002",
    createdAt: "2025-11-15T10:15:00.000Z",
    ratingsJson: {
      technical: { "Ball Control": 4, "Dribbling": 3, "Passing Accuracy": 5, "Shooting": 4, "First Touch": 4, "Weak Foot Use": 3 },
      tactical: { "Positioning": 3, "Decision-Making": 4, "Game Awareness": 3, "Support Play": 4, "Transition": 3, "Adaptability": 3 },
      physical: { "Speed": 6, "Agility": 5, "Balance": 5, "Strength": 5, "Endurance": 5, "Coordination": 5 },
      mental: { "Concentration": 4, "Confidence": 4, "Communication": 5, "Teamwork": 5, "Resilience": 4, "Motivation": 5 },
      attacking: 4,
      defending: 4
    },
    overallJson: { technical: 3.83, tactical: 3.67, physical: 5.17, mental: 4.5, attacking: 4, defending: 4 },
    note: "Baseline eval for Mason."
  }
];

// sample assignments (homework items match earlier schema)
export const assignmentsData = [
  {
    id: "asg_001",
    playerId: "player_leo_001",
    coachId: "coach_001",
    createdAt: "2025-11-21T09:00:00.000Z",
    template: "Mixed Progression Plan",
    skillFocus: "Dribbling",
    currentRating: 4,
    goalRating: 8,
    items: [
      {
        id: "TEC_006",
        code: "TEC_006",
        name: "V-Cut (Inside)",
        category: "Technical",
        level: "Intermediate",
        description: "Pull back and push diagonally (45°) using the inside of the same foot to create space.",
        regressionTip: "Perform at 50% speed focusing on body shape.",
        progressionTip: "Add passive defender pressure; increase angle speed.",
        suggestedSets: "3 sets",
        suggestedReps: "8–12 reps per set",
        video_qr: "https://example.com/tec_006_video"
      },
      {
        id: "TEC_014",
        code: "TEC_014",
        name: "Dribble Slalom",
        category: "Technical",
        level: "Intermediate",
        description: "Dribble through cones with controlled touches, head up every 3 touches.",
        regressionTip: "Use wider spacing and walk through first.",
        progressionTip: "Close cone gap & increase speed.",
        suggestedSets: "4 sets",
        suggestedReps: "30 seconds each",
        video_qr: "https://example.com/tec_014_video"
      },
      {
        id: "PHY_009",
        code: "PHY_009",
        name: "Wall Acceleration",
        category: "Physical",
        level: "Advanced",
        description: "Explosive 10m acceleration drills using wall push-starts.",
        regressionTip: "Shorten to 5m and focus on technique.",
        progressionTip: "Add resisted sprint with light sled or partner hold.",
        suggestedSets: "6 repeats",
        suggestedReps: "10m sprints",
        video_qr: "https://example.com/phy_009_video"
      }
    ],
    coachFeedback: "Focus on head-up awareness while dribbling. Start slow and increase tempo.",
    estimated_total_time_min: 28,
    status: "PENDING",
    export_formats: ["pdf", "png"]
  },
  {
    id: "asg_002",
    playerId: "player_mason_002",
    coachId: "coach_002",
    createdAt: "2025-11-15T11:00:00.000Z",
    template: "Technical Focus",
    skillFocus: "Passing Accuracy",
    currentRating: 5,
    goalRating: 7,
    items: [
      {
        id: "TEC_021",
        code: "TEC_021",
        name: "Short Passing Grid",
        category: "Technical",
        level: "Intermediate",
        description: "Short, quick passes in a small grid focusing on weight and timing.",
        regressionTip: "Use stationary partners and focus on accuracy.",
        progressionTip: "Add moving targets and time limit.",
        suggestedSets: "4 sets",
        suggestedReps: "10 passes each",
        video_qr: "https://example.com/tec_021_video"
      }
    ],
    coachFeedback: "Improve passing speed and weight over 2 weeks.",
    estimated_total_time_min: 20,
    status: "SENT",
    export_formats: ["pdf"]
  }
];

// events and announcements for calendar/admin
export const eventsData = [
  { id: 1, title: "U14 Tigers Training", team: "U14 Tigers", date: "2025-11-22", startTime: "17:00", endTime: "18:30" },
  { id: 2, title: "U12 Gold Training", team: "U12 Gold", date: "2025-11-23", startTime: "16:00", endTime: "17:30" },
  { id: 3, title: "Evaluation Day (Leo)", team: "U14 Tigers", date: "2025-11-21", startTime: "08:30", endTime: "09:30" }
];

export const announcementsData = [
  { id: 1, title: "Winter Training Schedule Released", audience: "All", date: "2025-11-20" },
  { id: 2, title: "Parent Meeting: U14 Tigers", audience: "U14 Tigers", date: "2025-11-25" }
];

export const calendarEvents = [
  {
    title: "U14 Tigers Training",
    allDay: false,
    start: new Date(2025, 1, 3, 17, 0),   // Feb 3, 5:00 PM
    end: new Date(2025, 1, 3, 18, 30),    // Feb 3, 6:30 PM
  },
  {
    title: "U12 Gold Training",
    allDay: false,
    start: new Date(2025, 1, 4, 16, 0),
    end: new Date(2025, 1, 4, 17, 30),
  },
  {
    title: "Speed & Agility Session",
    allDay: false,
    start: new Date(2025, 1, 5, 7, 30),
    end: new Date(2025, 1, 5, 8, 30),
  },
  {
    title: "Evaluation: Leo Anderson",
    allDay: false,
    start: new Date(2025, 1, 6, 9, 0),
    end: new Date(2025, 1, 6, 10, 0),
  },
  {
    title: "Match Preparation",
    allDay: false,
    start: new Date(2025, 1, 7, 17, 0),
    end: new Date(2025, 1, 7, 18, 0),
  },
  {
    title: "League Match — U14 Tigers",
    allDay: false,
    start: new Date(2025, 1, 8, 10, 30),
    end: new Date(2025, 1, 8, 12, 15),
  },
  {
    title: "Recovery & Stretching",
    allDay: false,
    start: new Date(2025, 1, 9, 8, 0),
    end: new Date(2025, 1, 9, 9, 0),
  },
  {
    title: "Tactical Meeting — U12 Gold",
    allDay: false,
    start: new Date(2025, 1, 10, 18, 0),
    end: new Date(2025, 1, 10, 19, 0),
  },
  {
    title: "Strength Training",
    allDay: false,
    start: new Date(2025, 1, 11, 7, 0),
    end: new Date(2025, 1, 11, 8, 0),
  },
  {
    title: "Player Review Meeting — Mason",
    allDay: false,
    start: new Date(2025, 1, 12, 15, 0),
    end: new Date(2025, 1, 12, 16, 0),
  },
  {
    title: "Team Training — U10 Academy",
    allDay: false,
    start: new Date(2025, 1, 14, 17, 0),
    end: new Date(2025, 1, 14, 18, 30),
  },
  {
    title: "Goalkeeper Drills",
    allDay: false,
    start: new Date(2025, 1, 15, 8, 30),
    end: new Date(2025, 1, 15, 9, 30),
  },
  {
    title: "Video Analysis Session",
    allDay: false,
    start: new Date(2025, 1, 17, 18, 0),
    end: new Date(2025, 1, 17, 19, 0),
  },
  {
    title: "Friendly Match — U12 Gold",
    allDay: false,
    start: new Date(2025, 1, 18, 11, 0),
    end: new Date(2025, 1, 18, 12, 30),
  },
  {
    title: "Evaluation: Daniel Chen",
    allDay: false,
    start: new Date(2025, 1, 20, 10, 0),
    end: new Date(2025, 1, 20, 11, 0),
  },
  {
    title: "Advanced Technical Drills",
    allDay: false,
    start: new Date(2025, 1, 21, 17, 30),
    end: new Date(2025, 1, 21, 18, 45),
  },
  {
    title: "Sprint Mechanics Session",
    allDay: false,
    start: new Date(2025, 1, 22, 7, 45),
    end: new Date(2025, 1, 22, 8, 45),
  },
  {
    title: "Tactical Formation Review",
    allDay: false,
    start: new Date(2025, 1, 24, 18, 0),
    end: new Date(2025, 1, 24, 19, 0),
  },
  {
    title: "Weekend Match — U10 Academy",
    allDay: false,
    start: new Date(2025, 1, 25, 9, 30),
    end: new Date(2025, 1, 25, 11, 15),
  },
  {
    title: "Post-Match Recovery",
    allDay: false,
    start: new Date(2025, 1, 26, 8, 30),
    end: new Date(2025, 1, 26, 9, 30),
  },
];
