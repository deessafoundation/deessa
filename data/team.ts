export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string
}

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Bikram Thapa",
    role: "Program Director",
    bio: "Leading education initiatives across rural Nepal.",
    image: "/deessa-resources/changeMaker1.jpeg",
  },
  {
    id: "2",
    name: "Rejina Gharti Magar",
    role: "Community Lead",
    bio: "Building sustainable communities through grassroots engagement.",
    image: "/deessa-resources/changeMaker2.jpeg",
  },
  {
    id: "3",
    name: "Deepak Bashyal",
    role: "Health Coordinator",
    bio: "Bringing healthcare access to remote villages.",
    image: "/deessa-resources/changeMaker3.jpeg",
  },
]
