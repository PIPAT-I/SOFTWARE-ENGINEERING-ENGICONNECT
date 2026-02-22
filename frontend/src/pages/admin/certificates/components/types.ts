export interface DataType {
    key: string;
    activityID: number;
    activity: string;
    category: string;
    dateHeld: string;
    dateIssued: string;
    certificate: string;
    status: string;
    statusRaw: string;
    picture?: string;
    detail?: string;
    organizer?: string;
    hasCertificate: boolean;
    certImage?: string;
    stopDate?: string;
}

export interface ParticipantType {
    key: string;
    studentId: string;
    name: string;
    department: string;
    award: string;
}
