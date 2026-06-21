export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  department: string;
  semester: string;
  createdAt: string;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  branch?: string;
  semester: string;
  description: string;
  fileUrl: string; // can be PDF link or Drive link
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}

export interface PlacementOpportunity {
  id: string;
  companyName: string;
  role: string;
  eligibility: string;
  deadline: string;
  applyLink: string;
  description: string;
  createdAt: string;
}

export interface CollegeEvent {
  id: string;
  title: string;
  type: 'workshop' | 'hackathon' | 'cultural' | 'sports' | 'seminar';
  description: string;
  date: string;
  location: string;
  registrationLink: string;
  createdAt: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemType: 'note' | 'placement' | 'event';
  itemId: string;
  savedAt: string;
}

export interface StudyTask {
  id: string;
  userId: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD or schedule
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
