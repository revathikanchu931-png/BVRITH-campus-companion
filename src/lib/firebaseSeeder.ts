import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export async function seedInitialDataIfNeeded() {
  // Allow seeding even for sandbox bypass / guest previews to ensure a smooth demo
  try {
    // 1. Seed Placements if empty
    const placementsCol = collection(db, 'placements');
    const placementsSnapshot = await getDocs(placementsCol);
    if (placementsSnapshot.empty) {
      const samplePlacements = [
        {
          companyName: 'Google',
          role: 'Associate Software Engineer',
          eligibility: 'B.Tech/M.Tech (CS/IT/ECE) with 8.0+ CGPA, No Active Backlogs',
          deadline: '2026-07-15',
          applyLink: 'https://careers.google.com',
          description: 'Join the Google Engineering team to solve real-world complex computing problems. Strong foundation in structures, algorithms, and system design is preferred.',
          createdAt: new Date().toISOString()
        },
        {
          companyName: 'Microsoft',
          role: 'Software Engineering Intern',
          eligibility: 'B.Tech/B.E Penultimate Year, CGPA 7.5+ and strong coding proficiency',
          deadline: '2026-08-01',
          applyLink: 'https://careers.microsoft.com',
          description: 'A 6-month internship program focused on building highly scalable global features in cloud computing (Azure) and enterprise application services.',
          createdAt: new Date().toISOString()
        },
        {
          companyName: 'Accenture',
          role: 'Packaged App Development Associate',
          eligibility: 'All Engineering Streams (B.Tech, M.Tech, MCA) with CGPA 6.5+',
          deadline: '2026-07-20',
          applyLink: 'https://accenture.com/careers',
          description: 'Deliver tech solutions using popular SaaS tools and industry-standard development frameworks. Involves customization, testing, and continuous delivery.',
          createdAt: new Date().toISOString()
        },
        {
          companyName: 'Infosys',
          role: 'Systems Engineer - Specialist Programmer',
          eligibility: 'B.E/B.Tech/M.E/M.Tech with strong problem solving and algorithmic reasoning',
          deadline: '2026-07-30',
          applyLink: 'https://career.infosys.com',
          description: 'High-responsibility coding role focusing on modern application architectures, microservices, secure cloud deployments, and AI-enabled operations.',
          createdAt: new Date().toISOString()
        },
        {
          companyName: 'ZS Associates',
          role: 'Business Technology Analyst',
          eligibility: 'B.Tech with CGPA 7.0+, strong analytical problem-solving and SQL skills',
          deadline: '2026-07-28',
          applyLink: 'https://zs.com/careers',
          description: 'Consulting-focused technology role. Design and build data pipelines, analyze client business dynamics, and construct automated intelligence dashboards.',
          createdAt: new Date().toISOString()
        }
      ];
      for (const p of samplePlacements) {
        await addDoc(placementsCol, p);
      }
      console.log('Seeded sample placements.');
    }

    // 2. Seed Notes if empty
    const notesCol = collection(db, 'notes');
    const notesSnapshot = await getDocs(notesCol);
    const repairedNoteLinks: Record<string, string> = {
      'https://www.w3.org/People/Frystyk/book/OSI.html': 'https://gaia.cs.umass.edu/kurose_ross/lectures.php',
      'https://ict.pwr.wroc.pl/user/algorithms-handout.pdf': 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/',
      'https://cs229.stanford.edu/notes2022fall/cs229-notes1.pdf': 'https://cs229.stanford.edu/main_notes.pdf'
    };

    for (const noteDoc of notesSnapshot.docs) {
      const data = noteDoc.data();
      const repairedUrl = repairedNoteLinks[data.fileUrl];
      if (repairedUrl) {
        await updateDoc(doc(db, 'notes', noteDoc.id), { fileUrl: repairedUrl });
      }
    }

    if (notesSnapshot.empty) {
      const sampleNotes = [
        {
          title: 'Computer Networks - Comprehensive Notes',
          subject: 'Computer Networks',
          branch: 'Computer Science & Engineering',
          semester: '6th Semester',
          description: 'Covers OSI layers, TCP/UDP protocols, routing algorithms (Dijkstra, Link-state), and IP addressing. Hand-written high-quality summary.',
          fileUrl: 'https://gaia.cs.umass.edu/kurose_ross/lectures.php',
          uploadedBy: 'seed_admin',
          uploadedByName: 'Prof. Sharma (HOD CSE)',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Data Structures Quick Cheat Sheet',
          subject: 'Data Structures & Algorithms',
          branch: 'Computer Science & Engineering',
          semester: '3rd Semester',
          description: 'Quick reference guide containing code templates for Red-Black trees, graph traversal (DFS, BFS), heap operations, and sorting complexity matrices.',
          fileUrl: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/',
          uploadedBy: 'seed_admin',
          uploadedByName: 'Aditya Sen (CSE Alumnus)',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Introduction to Operating Systems Lectures',
          subject: 'Operating Systems',
          branch: 'Information Technology',
          semester: '4th Semester',
          description: 'Lecture logs covering process scheduling queues, deadlock avoidance (Banker\'s algorithm), cache replacement schemes, and virtual memory paging.',
          fileUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
          uploadedBy: 'seed_admin',
          uploadedByName: 'Dr. Shruti Sen (OS Lab)',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Database Management Systems - Query Foundations',
          subject: 'Database Management Systems',
          branch: 'Computer Science & Engineering',
          semester: '5th Semester',
          description: 'Covers SQL joins, normalization, transaction properties, indexing basics, and relational algebra practice examples.',
          fileUrl: 'https://www.db-book.com/slides-dir/index.html',
          uploadedBy: 'seed_admin',
          uploadedByName: 'Rohan Gupta (CSE Study Club)',
          createdAt: new Date().toISOString()
        }
      ];
      for (const n of sampleNotes) {
        await addDoc(notesCol, n);
      }
      console.log('Seeded sample study notes.');
    }

    // 3. Seed Events if empty
    const eventsCol = collection(db, 'events');
    const eventsSnapshot = await getDocs(eventsCol);
    const bvrithSampleEvents = [
      {
        title: 'BVRITH Innovation & Entrepreneurship Cell Orientation',
        type: 'seminar',
        description: 'BVRIT Hyderabad College of Engineering for Women orientation session for student innovation, entrepreneurship awareness, idea validation, and startup support through campus mentoring.',
        date: '2026-07-05',
        location: 'BVRITH Main Auditorium, Bachupally Campus',
        registrationLink: 'https://bvrithyderabad.edu.in/',
        createdAt: new Date().toISOString()
      },
      {
        title: 'BVRITH Women in Engineering Technical Workshop',
        type: 'workshop',
        description: 'Hands-on technical learning session for BVRITH students covering engineering problem solving, project building, and industry-oriented skill development.',
        date: '2026-07-12',
        location: 'BVRITH CSE Seminar Hall',
        registrationLink: 'https://bvrithyderabad.edu.in/',
        createdAt: new Date().toISOString()
      },
      {
        title: 'BVRITH Coding & Project Expo',
        type: 'hackathon',
        description: 'BVRITH student activity for building software prototypes, presenting mini-projects, and encouraging collaborative technical innovation across branches.',
        date: '2026-07-19',
        location: 'BVRITH Computer Labs',
        registrationLink: 'https://bvrithyderabad.edu.in/',
        createdAt: new Date().toISOString()
      },
      {
        title: 'BVRITH Cultural & Student Club Showcase',
        type: 'cultural',
        description: 'Campus club showcase by BVRIT Hyderabad College of Engineering for Women featuring student performances, club introductions, and participation drives.',
        date: '2026-08-02',
        location: 'BVRITH Open Auditorium',
        registrationLink: 'https://bvrithyderabad.edu.in/',
        createdAt: new Date().toISOString()
      },
      {
        title: 'BVRITH Sports Day Practice Meet',
        type: 'sports',
        description: 'BVRITH sports coordination meet for student teams, practice schedules, event rules, and inter-department participation planning.',
        date: '2026-08-09',
        location: 'BVRITH Sports Ground',
        registrationLink: 'https://bvrithyderabad.edu.in/',
        createdAt: new Date().toISOString()
      }
    ];

    const oldEventTitleMap: Record<string, (typeof bvrithSampleEvents)[number]> = {
      'Campus Hackathon 2026': bvrithSampleEvents[2],
      'Generative AI & LLM Hands-on Workshop': bvrithSampleEvents[1],
      'Annual Cultural Festival "Symphony 2026"': bvrithSampleEvents[3],
      'College Placement Prep & Mock Interview Fair': bvrithSampleEvents[0]
    };

    for (const eventDoc of eventsSnapshot.docs) {
      const data = eventDoc.data();
      const replacement = oldEventTitleMap[data.title];
      if (replacement) {
        await updateDoc(doc(db, 'events', eventDoc.id), replacement);
      }
    }

    if (eventsSnapshot.empty) {
      for (const e of bvrithSampleEvents) {
        await addDoc(eventsCol, e);
      }
      console.log('Seeded BVRITH sample events.');
    }
  } catch (error) {
    console.error('Error seeding initial Firestore data:', error);
  }
}
