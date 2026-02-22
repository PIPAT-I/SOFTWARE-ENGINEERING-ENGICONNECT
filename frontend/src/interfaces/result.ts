export interface Winner {
    rank: number;
    name: string;
    prize: string;
    awardName?: string;
    isTeam: boolean;
    members?: string[];
    memberIds?: number[]; // Added for student view compatibility
    awardId?: number;
    registrationId?: number;
}

export interface Activity {
    id: number;
    title: string;
    description: string;
    participants: number;
    status: string; // Optional for student, required for admin sorting logic
    endDate: string;
    category: string;
    hasWinners: boolean;
    winners?: Winner[];
    points: number;
    pointsDistributed: boolean;
    picture?: string; // Standardize on 'picture' to match backend/admin, alias 'image' in student if needed or refactor student
}

export interface User {
    id: number;
    name: string;
}

export interface SelectedReward {
    type: string;
    userId: string;
    prize: string;
    customName?: string;
}
